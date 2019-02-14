var mongodb = require('mongodb');
const log = require('./../logger.js')();

module.exports = function() {

  const downloadReport = (req, res) => {
    log(req);
    if (!req.session.isLoggedIn) {
      console.log('redirecting...');
      res.redirect(process.env.API_URL + 'download/' + req.params.id);
      return;
    } else if (!req.session.analyst) {
      req.app.dbo.collection("reports").aggregate([{
        $match: {
          _id: mongodb.ObjectId(req.params.id)
        }
      }, {
        $lookup: {
          from: 'definitions',
          localField: 'definition_id',
          foreignField: '_id',
          as: 'definition'
        }
      }, {
        $addFields: {
          definition: {
            $max: "$definition"
          }
        }
      }, {
        $match: {
          $expr: {
            $or: [{
                $eq: [
                  "$definition.permissions.company." + req.session.permissionLevel,
                  true
                ]
              },
              {
                $and: [{
                  $eq: ["$definition.dept", req.session.ldap.department]
                }, {
                  $eq: [
                    "$definition.permissions.dept." + req.session.permissionLevel,
                    true
                  ]
                }]
              }
            ]
          }
        }
      }]).toArray(function(err, docs) {
        // res.write('\nlength of array: ' + docs.length);
        // res.write('\nthat means: ');
        if (!docs.length) {
          // res.write('\nnot permitted');
          res.redirect(process.env.API_URL + 'notPermitted');
          return;
        } else { // TODO clean up these two else statements. They do the same thing
          // console.log('\n\ndownloading report');
          // dbo = db.db(process.env.DB_NAME);
          req.app.dbo.collection("reports").findOneAndUpdate({
              '_id': mongodb.ObjectId(req.params.id)
            }, {
              $push: {
                downloads: {
                  timestamp: new Date(),
                  user_id: mongodb.ObjectId(req.session.realUserid)
                }
              }
            }, {
              // projection: { file: 1 },
              upsert: false,
            })
            .then(result => {
              const doc = result.value;
              if (!doc) {
                throw new Error('No record found.');
              }
              res.writeHead(200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="' + doc.filename + '"'
              });

              res.end(new Buffer(doc.file.buffer, 'binary'));
            })
            .catch(err => {
              console.log('\n\nthere was an error:\n');
              console.log(err);
              res.send('No such report was found');
            });
        }
      });
    } else { // TODO clean up these two else statements. They do the same thing
      // console.log('\n\ndownloading report');
      // dbo = db.db(process.env.DB_NAME);
      req.app.dbo.collection("reports").findOneAndUpdate({
        '_id': mongodb.ObjectId(req.params.id)
      }, {
        $push: {
          downloads: {
            timestamp: new Date(),
            user_id: mongodb.ObjectId(req.session.realUserid)
          }
        }
      }, {
        // projection: { file: 1 },
        upsert: false,
      }).then(result => {
        const doc = result.value;
        if (!doc) {
          throw new Error('No record found.');
        }
        res.writeHead(200, {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="' + doc.filename + '"'
        });

        res.end(new Buffer(doc.file.buffer, 'binary'));
      }).catch(err => {
        console.log('\n\nthere was an error:\n');
        console.log(err);
        res.send('No such report was found');
      });
    }
  };

  return downloadReport;
};
