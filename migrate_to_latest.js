// TODO: add user.ldap.mail to all users in db

console.log('Set working directory');
console.log(__dirname);
process.chdir(__dirname);

require('dotenv').config();
console.log('NODE_ENV: ' + process.env.NODE_ENV);

var updates = [{
    collection: 'definitions',
    query: {},
    update: {
      $set: {
        'sheets.$[table].tables.$[elem].rowBanding': {
          on: true,
          colors: {
            useDefaults: true,
            background: ['#FFFFFF', '#FFFFFF'],
            font: ['#000000', '#000000'],
          },
        }
      }
    },
    options: {
      arrayFilters: [{
        'table.name': {
          $exists: true
        }
      }, {
        'elem.rowBanding': {
          $exists: false
        }
      }],
      multi: true
    },
  },
  {
    collection: 'definitions',
    query: {},
    update: {
      $set: {
        'sheets.$[table].tables.$[elem].totalsRow': {}
      }
    },
    options: {
      arrayFilters: [{
        'table.name': {
          $exists: true
        }
      }, {
        'elem.totalsRow': {
          $exists: false
        }
      }],
      multi: true
    },
  },
  {
    collection: 'definitions',
    query: {},
    update: {
      $set: {
        'schedules.$[sched].active': true
      }
    },
    options: {
      arrayFilters: [{
        'sched.active': {
          $exists: false
        }
      }],
      multi: true
    },
  },
  {
    collection: 'definitions',
    query: {},
    update: {
      $unset: {
        print_report_name_on_every_sheet: 1,
        print_sheet_name: 1,
      }
    },
    options: {},
  },
  {
    collection: 'definitions',
    query: {
      requested_by: {
        $exists: true
      },
      requestedBy: {
        $exists: false
      },
    },
    update: {
      $rename: {
        requested_by: "requestedBy",
      }
    },
    options: {},
  },
  {
    collection: 'definitions',
    query: {
      requested_by: {
        $exists: true
      },
      requestedBy: {
        $exists: true
      },
    },
    update: {
      $unset: {
        requested_by: 1,
      }
    },
    options: {},
  },
  {
    collection: 'definitions',
    query: {
      exceptionsReport: {
        $exists: false
      },
    },
    update: {
      $set: {
        exceptionsReport: false,
      }
    },
    options: {},
  },
];

updates.forEach(update => {
  update.complete = false;
});

var MongoClient = require('mongodb').MongoClient;
var dbo;

MongoClient.connect(
  "mongodb://" + process.env.DB_USER +
  ":" + process.env.DB_PASSWORD +
  "@" + process.env.DB_HOST +
  "/admin", {
    useNewUrlParser: true
  },
  function(err, db) {
    if (err) throw err;

    dbo = db.db(process.env.DB_NAME);

    updates.forEach(update => {
      dbo.collection(update.collection).updateMany(
        update.query,
        update.update,
        update.options,
        () => {
          update.complete = true;
        }
      );
    });

    // dbo.collection('definitions').find().toArray((error, docs) => {
    // 	if(error) throw error;
    //
    // 	docs.map(doc => {
    // 		dbo.collection('definitions').update(
    // 			{ requestedBy: 'Cat' },
    // 			{ $set {
    // 				'sheets.tables'
    // 			} }
    // 		);
    // 	})
    // });

  });

const done = () => {
  const incomplete = updates.filter(update => update.complete === false);
  if (incomplete.length === 0) {
    console.log('Done!');
    // process.exit();
  } else {
    setTimeout(done, 1);
  }
};
done();

// const loadQuery = (req, path) => {
// 	return new Promise((resolve, reject) => {
// 		fs.readFile(path, (err, contents) => {
// 	    if (err) {
// 	      reject(err);
// 	    } else {
// 				var query = JSON.parse(contents)
// 	      resolve(query);
// 			}
// 	  })
// 	});
// }
