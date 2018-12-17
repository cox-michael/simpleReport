console.log('\n\nStarting Service');
console.log(new Date());
console.log('Set working directory');
console.log(__dirname);
process.chdir(__dirname);

require('dotenv').config();
console.log('NODE_ENV: ' + process.env.NODE_ENV);

// I've written authenticate.js that is specific to my company to authenticate
// against our Active Directory.
var { getUser, auth } = require('./authenticate');

const express = require('express');
const path = require('path'); // this is for serving files
const fs = require('fs'); // fs is for files
// const util = require('util'); // util is for formatting parameters in strings

var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var db;

const session = require('express-session');
var FileStore = require('session-file-store')(session);

var assert = require('assert');

const spawn = require("child_process").spawn;

// Initialize MongoDB connection once
MongoClient.connect(
	"mongodb://" + process.env.DB_USER +
	":" + process.env.DB_PASSWORD +
	"@" + process.env.DB_HOST +
	"/admin",{ useNewUrlParser: true }, function(err, database) {
	if(err) throw err;

	db = database;

	// Start the application after the database connection is ready
	app.listen(process.env.POOLING_PORT);
	console.log(`MongoDB listening on port ${process.env.POOLING_PORT}`);
});

const app = express();
app.use(express.json()); // this allows you to send and receive json for API

var fileStoreOptions = {};
app.use(session({
	name: process.env.NODE_ENV, // ensure your environments don't share cookies
	secret: "try",
	store: new FileStore(fileStoreOptions),
	resave: true,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: (90 * 86400 * 1000),
	},
	// expires: new Date(Date.now() + (90 * 86400 * 1000))
}));
app.use(express.static('static'));

// const apiRouter = express.Router();
// const getLocations = (req, res) => {
// 	res.sendFile(process.cwd() + '/data/locations.json');
// }
// apiRouter.get('/locations', getLocations);
// app.use('/', apiRouter);

var log = (req) => {
	var d = new Date();
	var timestamp = (
		d.getFullYear().toString() +
		"-" + ((d.getMonth()+1).toString().length==2?(d.getMonth()+1).toString():"0"+(d.getMonth()+1).toString()) +
		"-" + (d.getDate().toString().length==2?d.getDate().toString():"0"+d.getDate().toString()) +
		" " + (d.getHours().toString().length==2?d.getHours().toString():"0"+d.getHours().toString()) +
		":" + (d.getMinutes().toString().length==2?d.getMinutes().toString():"0"+d.getMinutes().toString()) +
		":" + (d.getSeconds().toString().length==2?d.getSeconds().toString():"0"+d.getSeconds().toString())
	);

	if (typeof(req.session) !== "undefined" &&
	 		typeof(req.session.realUn) !== "undefined") {
		var user = req.session.realUn;
	} else {
		var user = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	}


	var msg = '[' + timestamp + ']'
	msg += ' ' + user;
	msg += ' ' + req.originalUrl;

	console.log(msg)
}

const notLoggedIn = {
	isLoggedIn: false,
	success: false,
	messages: ['Not logged in'],
	// reports: result
}
const notPermitted = {
	isLoggedIn: true,
	success: false,
	messages: ['You do not have permissions to do this'],
	// reports: result
}

const checkPermissions = (req, level) => {
	// level 1 => user must be logged in
	// level 2 => user must be an analyst
	// level 3 => user must have superpowers
	return new Promise((resolve, reject) => {
		if (level >= 1 && !req.session.isLoggedIn) {
			reject(401, notLoggedIn);
		} else if (level >= 2 && !req.session.analyst) {
			reject(403, notPermitted);
		} else if (level >= 3 && !req.session.superpower) {
			reject(403, notPermitted);
		} else {
			resolve(true);
		}
	});
}

const loadQuery = (req, path) => {
	return new Promise((resolve, reject) => {
		fs.readFile(path, (err, contents) => {
	    if (err) {
	      reject(err);
	    } else {
				var query = JSON.parse(contents)

				function eachRecursive(obj) {
			    for (var item in obj) {
		        if (typeof(obj[item]) == "object" && obj[item] !== null) {
	            eachRecursive(obj[item]);
		        } else if (obj[item] == '_userid_') {
								obj[item] = mongodb.ObjectId(req.session.userid)
						}
			    }
				}
				eachRecursive(query);

				if ((req.params.handle == 'getReports' && !req.session.analyst) ||
						(req.params.handle == 'getSchedules' && !req.session.analyst)) {
					query.unshift({
						$match: {
							$expr: {
								$or: [
									{ $eq: [ "$permissions.company." + req.session.permissionLevel,
													 true ] },
									{ $and: [
											{ $eq: [ "$dept", req.session.ldap.department ] },
											{ $eq: [ "$permissions.dept." + req.session.permissionLevel,
															 true ] }
									] }
								]
							}
						}
					})
				}

	      resolve(query);
			}
	  })
	});
}

const apiResponse = (data, success=true, messages=[]) => {
	return {
		isLoggedIn: true,
		success: success,
		messages: messages,
		data: data
	}
}

const apiHandler = (req) => {
	return new Promise((resolve, reject) => {
		const handle = req.params.handle

		const [collection, permissionLevel] = ((handle) => { switch (handle) {
			case 'mostDownloadedDefinitions':
			case 'mostDownloadedReports':
			case 'reportsGeneratedByDate':
			case 'mostActiveUsersByDownloads': 	return ['reports', 2];
			case 'getRequests':									return ['requests', 1];
			case 'getSchedules':
			case 'getReports':									return ['definitions', 1];
			case 'mostSubscribedToDefinitions':	return ['users', 2];
			case 'mostStarredDefinitions':			return ['users', 2];
			default:
				console.log(handle);
				console.log('defaulting');
				reject(500, {});
				return;
		}})(handle);

		checkPermissions(req, permissionLevel)
		.then(() => {
			loadQuery(req, path.join(__dirname + '/queries/' + handle + '.json'))
			.then(query => {
				dbo = db.db(process.env.DB_NAME);
				dbo.collection(collection).aggregate(query).toArray((err, docs) => {
					resolve(apiResponse(docs));
				});
			})
			.catch(err => reject(500, {
				isLoggedIn: true,
				success: false,
				messages: ['Failed to load query'],
			}))
		})
		.catch((code, json) => reject(code, json))
	});
}

//##############################################################################
// SERVING #####################################################################
//##############################################################################

// GET #########################################################################

// TODO: remove this after full production release to public
app.get('//*', (req, res) => { // reroute from old domain
	res.redirect('http://' + process.env.FULL_URL + req.originalUrl.substr(2));
})

app.get('/', (req, res) => {
	log(req);
	res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.get('/dist/main.js', (req, res) => {
	log(req);
	res.sendFile(path.join(__dirname + '/dist/main.js'));
});

app.get('/destroy', (req, res) => {
	log(req);
	req.session.destroy();
	res.end('Session destroyed!');
});

app.get('/removeAnalyst', (req, res) => {
	log(req);
	req.session.analyst = false;
	req.session.save();
	res.end('not an analyst anymore');
});

app.get('/removeSuperpower', (req, res) => {
	log(req);
	req.session.superpower = false;
	req.session.save();
	res.end('not a hero anymore');
});

app.get('/sessionData', (req, res) => {
	log(req);
	res.json(req.session);
});

app.get('/expires', function(req, res, next) {
	log(req);
  if (req.session.views) {
    req.session.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + req.session.views + '</p>')
    res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    req.session.views = 1
    res.end('welcome to the session demo. refresh!')
  }
})

app.all('/api/:handle', (req, res) => {
	log(req);
	apiHandler(req)
	.then(response => res.json(response))
	.catch((code, json) => {
		res.status(code);
		res.json(json);
	})
})

app.get('/downloadTest/:filename', (req, res) => {
	log(req);
	checkPermissions(req, 2)
	.then(() => {
		const filename = path.join(__dirname + '/tmp/' + req.params.filename);
		res.download(filename);
	})
});

app.get('/downloadReport/:id', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn) {
		console.log('redirecting...');
		res.redirect(process.env.API_URL + 'download/' + req.params.id);
		return;
	} else if (!req.session.analyst) {
		dbo = db.db(process.env.DB_NAME);
		dbo.collection("reports").aggregate([
		  {
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
		        $or: [
		          { $eq: [
								"$definition.permissions.company."+ req.session.permissionLevel,
								true
		          ]},
							{
		            $and: [
		              {
		                $eq: [ "$definition.dept", req.session.ldap.department ]
		              }, { $eq: [
										"$definition.permissions.dept."+req.session.permissionLevel,
										true
		              ]}
		            ]
		          }
		        ]
		      }
		    }
		  }
		]).toArray(function(err, docs) {
			// res.write('\nlength of array: ' + docs.length);
			// res.write('\nthat means: ');
			if (!docs.length) {
				// res.write('\nnot permitted');
				res.redirect(process.env.API_URL + 'notPermitted');
				return;
			} else { // TODO clean up these two else statements. They do the same thing
				// console.log('\n\ndownloading report');
				dbo = db.db(process.env.DB_NAME);
				dbo.collection("reports").findOneAndUpdate(
					{'_id': mongodb.ObjectId(req.params.id)},
					{ $push: {
						downloads: {
							timestamp: new Date(),
							user_id: mongodb.ObjectId(req.session.realUserid)
						}
					}},
					{
						// projection: { file: 1 },
						upsert: false,
					}
				)
				.then(result => {
					const doc = result.value;
					if (!doc){
						throw new Error('No record found.');
					}
					res.writeHead(200, {
						'Content-Type':
						 	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
						'Content-Disposition': 'attachment; filename="' + doc.filename + '"'
					});

					res.end(new Buffer(doc.file.buffer, 'binary') );
				})
				.catch(err => {
					console.log('\n\nthere was an error:\n');
					console.log(err)
					res.send('No such report was found');
				});
			}
		});
	} else { // TODO clean up these two else statements. They do the same thing
		// console.log('\n\ndownloading report');
		dbo = db.db(process.env.DB_NAME);
		dbo.collection("reports").findOneAndUpdate(
			{'_id': mongodb.ObjectId(req.params.id)},
			{ $push: {
				downloads: {
					timestamp: new Date(),
					user_id: mongodb.ObjectId(req.session.realUserid)
				}
			}},
			{
				// projection: { file: 1 },
				upsert: false,
			}
		).then(result => {
			const doc = result.value;
			if (!doc){
				throw new Error('No record found.');
			}
			res.writeHead(200, {
			  'Content-Type':
				 	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			  'Content-Disposition': 'attachment; filename="' + doc.filename + '"'
			});

			res.end(new Buffer(doc.file.buffer, 'binary') );
		}).catch(err => {
			console.log('\n\nthere was an error:\n');
			console.log(err)
			res.send('No such report was found');
		});
	}
});







// POST ########################################################################

app.post('/create_new_report', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn) {
		res.status(401);
		res.json(notLoggedIn);
		return;
	} else if (!req.session.analyst) {
		res.status(403);
		res.json(notPermitted);
		return;
	}

	dbo = db.db(process.env.DB_NAME);
	dbo.collection('definitions').insertOne(req.body.report, function(err, result) {
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		assert.equal(1, result.ops.length);
		console.log('Inserted 1 document into definitions');
		// console.log(result.insertedId)
		// console.log(result);
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			reports: result
		})
	});
});

app.post('/createNewRequest', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn) {
		res.json(notLoggedIn);
		return;
	}

	// console.log('createNewRequest');
	dbo = db.db(process.env.DB_NAME);
	const request = {
		description: req.body.description,
		upvotes: [],
		downvotes: [],
		author: mongodb.ObjectId(req.session.userid),
		completed: false,
	}
	dbo.collection("requests").insertOne(request, function(err, result) {
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		assert.equal(1, result.ops.length);
		console.log('Inserted 1 document into requests');
		// console.log(result.insertedId)
		// console.log(result);
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			request: result
		})
	});
});

app.post('/update_report', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn){
		res.json(notLoggedIn);
		return;
	} else if (!req.session.analyst) {
		res.json(notPermitted);
		return;
	}

	const id = req.body.report._id;
	delete req.body.report._id;
	dbo = db.db(process.env.DB_NAME);
	dbo.collection('definitions').findOneAndUpdate(
		{ _id: mongodb.ObjectId(id) },
		{ $set: req.body.report },
		{ upsert: 1 },
		function(err, result) {
			assert.equal(err, null);
			// assert.equal(1, result.result.n);
			// assert.equal(1, result.ops.length);
			console.log('Updated 1 document in definitions');
			// console.log(result);
			res.json({
				isLoggedIn: req.session.isLoggedIn,
				success: true,
				messages: [],
				// reports: result
			})
		});
});

app.post('/subscribe', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn){
		res.json(notLoggedIn);
		return;
	}

	dbo = db.db(process.env.DB_NAME);
	dbo.collection("users").findOneAndUpdate(
		{ _id: mongodb.ObjectId(req.session.userid) },
		{ $push: {subscriptions:  mongodb.ObjectId(req.body.reportId)} },
		{ upsert: 1 },
		function(err, result) {
			assert.equal(err, null);
			// assert.equal(1, result.result.n);
			// assert.equal(1, result.ops.length);
			console.log('Inserted 1 subscription into users');
			// console.log(result);
			res.json({
				isLoggedIn: req.session.isLoggedIn,
				success: true,
				messages: [],
				// reports: result
			})
	});
});

app.post('/notify', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn){
		res.json(notLoggedIn);
		return;
	}

	dbo = db.db(process.env.DB_NAME);
	dbo.collection("users").findOneAndUpdate(
		{ _id: mongodb.ObjectId(req.session.userid) },
		{ $push: {notifications:  mongodb.ObjectId(req.body.reportId)} },
		{ upsert: 1 },
		function(err, result) {
		assert.equal(err, null);
		// assert.equal(1, result.result.n);
		// assert.equal(1, result.ops.length);
		console.log('Inserted 1 notification into users');
		// console.log(result);
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			// reports: result
		})
	});
});

app.post('/unsubscribe', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn){
		res.json(notLoggedIn);
		return;
	}

	dbo = db.db(process.env.DB_NAME);
	dbo.collection("users").findOneAndUpdate(
		{ _id: mongodb.ObjectId(req.session.userid) },
		{
			$pull: {
				subscriptions:  mongodb.ObjectId(req.body.reportId),
				notifications:  mongodb.ObjectId(req.body.reportId)
			}
	 	},
		{ upsert: 1 },
		function(err, result) {
		assert.equal(err, null);
		// assert.equal(1, result.result.n);
		// assert.equal(1, result.ops.length);
		console.log('Removed 1 subscription and 1 notification from users');
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			// reports: result
		})
	});
});

app.post('/star', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn){
		res.json(notLoggedIn);
		return;
	}

	dbo = db.db(process.env.DB_NAME);
	dbo.collection("users").findOneAndUpdate(
		{ _id: mongodb.ObjectId(req.session.userid) },
		{ $push: {starred:  mongodb.ObjectId(req.body.reportId)} },
		{ upsert: 1 },
		function(err, result) {
		assert.equal(err, null);
		// assert.equal(1, result.result.n);
		// assert.equal(1, result.ops.length);
		console.log('Inserted 1 starred into users');
		// console.log(result);
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			// reports: result
		})
	});
});

app.post('/unstar', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn){
		res.json(notLoggedIn);
		return;
	}

	// console.log(req.body);
	dbo = db.db(process.env.DB_NAME);
	dbo.collection("users").findOneAndUpdate(
		{ _id: mongodb.ObjectId(req.session.userid) },
		{ $pull: {starred:  mongodb.ObjectId(req.body.reportId)} },
		{ upsert: 1 },
		function(err, result) {
		assert.equal(err, null);
		// assert.equal(1, result.result.n);
		// assert.equal(1, result.ops.length);
		console.log('Removed 1 starred from users');
		// console.log(result);
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			// reports: result
		})
	});
});

app.post('/requestVote', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn){
		res.json(notLoggedIn);
		return;
	}

	var update;

	if (req.body.direction == 'up') {
		update = {
			$pull: {downvotes: mongodb.ObjectId(req.session.userid)},
			$addToSet: {upvotes: mongodb.ObjectId(req.session.userid)},
		}
	} else if (req.body.direction == 'down') {
		update = {
			$pull: {upvotes: mongodb.ObjectId(req.session.userid)},
			$addToSet: {downvotes: mongodb.ObjectId(req.session.userid)},
		}
	} else {
		update = {
			$pull: {
				upvotes: mongodb.ObjectId(req.session.userid),
				downvotes: mongodb.ObjectId(req.session.userid)
			},
		}
	}

	dbo = db.db(process.env.DB_NAME);
	dbo.collection("requests").findOneAndUpdate(
		{ _id: mongodb.ObjectId(req.body.request_id) },
		update,
		{ upsert: 1 },
		function(err, result) {
		assert.equal(err, null);
		// assert.equal(1, result.result.n);
		// assert.equal(1, result.ops.length);
		console.log(req.body.direction + ' vote (request)');
		// console.log(result);
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			// reports: result
		})
	});
});

app.post('/returnDefinition', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn) {
		res.json(notLoggedIn);
		return;
	} else if (!req.session.analyst) {
		res.json(notPermitted);
		return;
	}

	// console.log('getReport');
	dbo = db.db(process.env.DB_NAME);
	dbo.collection('definitions').aggregate([
    {
        '$match': { '$expr': {
					'$eq': [ '$_id', mongodb.ObjectId(req.body.reportId) ]
				}}
    }, {
        '$lookup': {
            'from': 'users',
            'let': { 'report_id': '$_id' },
            'pipeline': [{
	              '$match': { '$expr': {
	                      '$in': [ '$$report_id', '$subscriptions' ]
	              }}
            }],
            'as': 'subscribed'
        }
    }, {
        '$lookup': {
            'from': 'users',
            'let': { 'report_id': '$_id' },
            'pipeline': [{
	              '$match': { '$expr': {
	                      '$in': [ '$$report_id', '$notifications' ]
	              }}
            }],
            'as': 'notify'
        }
    }, {
        '$lookup': {
            'from': 'users',
            'let': {
                'report_id': '$_id'
            },
            'pipeline': [{
                '$match': { '$expr': {
                        '$in': [ '$$report_id', '$starred' ]
                }}
            }],
            'as': 'starred'
        }
    }, {
        '$addFields': {
            'subscribed': '$subscribed._id',
            'notify': '$notify._id',
            'starred': '$starred._id'
        }
    }
]).toArray(function(err, doc) {
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			report: doc[0]
		})
	});
});

app.post('/getReportsForDef', (req, res) => {
	log(req);
	if (!req.session.isLoggedIn){
		res.json(notLoggedIn);
		return;
	}

	// console.log('getReportsForDef');
	// console.log(req.body.definitionId);
	dbo = db.db(process.env.DB_NAME);

	var query = [
		  { $match: {
		      definition_id: mongodb.ObjectId(req.body.definitionId)
		  }},
			{ $project: {
		      file: 0,
      		definition_id: 0
		  }},
			{ $addFields: {
		      created: { $toDate: "$_id" }
		  }},
			{ $sort: {
				_id: -1
			}}
	]

	if (req.session.analyst) {
		query.splice( -2, 0, {
	    $unwind: {
	      path: "$downloads",
	      preserveNullAndEmptyArrays: true
	    }
	  }, {
	    $lookup: {
	      from: 'users',
	      localField: 'downloads.user_id',
	      foreignField: '_id',
	      as: 'downloads.user'
	    }
	  }, {
	    $addFields: {
	      "downloads.user": {
	        $arrayElemAt: [
	          '$downloads.user.ldap.displayName', 0
	        ]
	      }
	    }
	  }, {
	    $sort: {
	      "downloads.timestamp": -1
	    }
	  }, {
	    $group: {
	      _id: {
	        _id: '$_id',
	        filename: '$filename'
	      },
	      downloads: {
	        $push: "$downloads"
	      }
	    }
	  }, {
	    $addFields: {
	      _id: "$_id._id",
	      filename: "$_id.filename",
	      downloads: {
	        $filter: {
	          input: "$downloads",
	          as: "download",
	          cond: {
	            $not: {
	              $eq: [
	                {}, "$$download"
	              ]
	            }
	          }
	        }
	      }
	    }
	  })
	}

	dbo.collection("reports").aggregate(query).toArray(function(err, docs) {
		res.json({
			isLoggedIn: req.session.isLoggedIn,
			success: true,
			messages: [],
			reports: docs
		})
	});
});

app.post('/runTest', (req, res) => {
if (!req.session.isLoggedIn) {
	res.json(notLoggedIn);
	return;
} else if (!req.session.analyst) {
	res.json(notPermitted);
	return;
}
	log(req);
	const filename = path.join(__dirname + '/tmp/' + req.session.realUserid + '.xlsx');

	// Delete file if it exists so that we will know that the new one was created
	fs.stat(filename, (err, stats) => {
		if (err && err.errno == -2) {
			// File does not exist, proceed
			return;
		}
		if (err) {
		  return console.error(err);
		}

		fs.unlink(filename, (err) => {
		   if(err) return console.log(err);
		   console.log('file deleted successfully');
		});
	})

	// Execute Python script
	const pythonProcess = spawn('python3',
	 														[path.join(__dirname + '/run_test.py'),
															 JSON.stringify(req.body.report),
														 	 req.session.realUserid]);

	pythonProcess.stdout.on('data', (data) => {
		console.log('python response:');
		console.log(data.toString());

		// return res.json({
		// 	isLoggedIn: req.session.isLoggedIn,
		// 	success: false,
		// 	messages: ['An error occurred while generating the report: ' +
		// 	 					 data.toString()],
		// 	// reports: docs
		// })
	})

	pythonProcess.on('exit', (code, signal) => {
		console.log('python exited');
		fs.stat(filename, (err, stats) => {
			if (err && err.errno == -2) {
				return res.json({
					isLoggedIn: req.session.isLoggedIn,
			 		success: false,
			 		messages: ['An error occurred while generating the report'],
			 		// reports: docs
				})
			}
			if (err) {
			   return console.error(err);
			}

			const downloadUrl = (process.env.API_URL + "downloadTest/" +
			 										 req.session.realUserid + '.xlsx');
			res.json({
				isLoggedIn: req.session.isLoggedIn,
				success: true,
				messages: [],
				url: downloadUrl,
			})
		})
	})
});




//##############################################################################
// AUTHENTICATION ##############################################################
//##############################################################################

const processLogin = (session, body) => {
	return new Promise((resolve, reject) => {
		console.log('processLogin');
		// console.log(session);
		// console.log(body);

		session.un = body.username;

		getUser(body.username, body.password)
			.then(ldap => {
				session.ldap = ldap.ldap;
				return Promise.resolve(ldap);
			})
			.then(auth)
			.then(success => {
				session.isLoggedIn = true;

				if (session.ldap.dn.toLowerCase().includes(process.env.ANALYST_DEPT)) {
				// TODO: this is a temporary change until I figure out
				// who I want to have superpowers
				// if (session.un == process.env.ADMIN) {
					session.superpower = true;
				}
				if (session.ldap.dn.toLowerCase().includes(process.env.ANALYST_DEPT)) {
					session.analyst = true;
				} else {
					session.analyst = false;
				}

				if (session.ldap.department == 'Executive Senior Management') {
					session.permissionLevel = 'L4'
				} else if (session.ldap.title.toLowerCase().includes("chief") ||
									 session.ldap.title.toLowerCase().includes("ceo")) {
					session.permissionLevel = 'L4'
				} else if (session.ldap.title.toLowerCase().includes("vp") ||
									 session.ldap.title.toLowerCase().includes("president")) {
					session.permissionLevel = 'L3'
				} else if (session.ldap.title.toLowerCase().includes("manage") ||
									 session.ldap.title.toLowerCase().includes("supervisor") ||
									 session.ldap.title.toLowerCase().includes("coord")) {
					session.permissionLevel = 'L2'
				} else {
					session.permissionLevel = 'L1'
				}
				// req.session.save();

				dbo = db.db(process.env.DB_NAME);
				dbo.collection("users").findOneAndUpdate(
					{ // FILTER
						username: session.un
					},
					{ // UPDATE
						$set: {
							ldap: session.ldap,
						},
						$setOnInsert: {
							subscriptions: [],
							notifications: [],
							starred: [],
						}
					},
					{ // OPTIONS
						projection: {_id: 1},
						upsert: true,
						returnNewDocument: true
					}
					,
					function(err, result) {
						if (result.lastErrorObject.updatedExisting) {
							session.userid = result.value._id;
						} else {
							session.userid = result.lastErrorObject.upserted;
						}

						console.log('username: ' + session.un + '; loggedIn: ' + session.isLoggedIn);
						resolve(session);
					}
				);
			})
			.catch(failure => {
				session.isLoggedIn = false;
				console.log('username: ' + session.un + '; loggedIn: ' + session.isLoggedIn);
				resolve(session);
			});
		});
};

app.post('/login', function(req, res) {
	log(req);
	req.session.realUn = req.body.username;
	req.session.superpower = false;

	processLogin(req.session, req.body)
		.then(session => {
			session.realUserid = session.userid;
			req.session = session;
			req.session.save();
		})
		.then(() => res.json({
			username: req.session.un,
			isLoggedIn: req.session.isLoggedIn,
			displayName: req.session.ldap.displayName,
			superpower: req.session.superpower,
			analyst: req.session.analyst,
		}));
});

app.get('/logout', (req, res) => {
	log(req);
	req.session.isLoggedIn = false;
	res.redirect(process.env.API_URL);
});

app.get('/loggedIn', (req, res) => {
	log(req);
	if (req.session.isLoggedIn) {
		console.log(req.session.un + ' is logged in');
		console.log('The displayName is ' + req.session.ldap.displayName);
		console.log('Superpower: ' + req.session.superpower);

		res.json({
			isLoggedIn: req.session.isLoggedIn,
			displayName: req.session.ldap.displayName,
			superpower: req.session.superpower,
			analyst: req.session.analyst,
		});
	} else {
		console.log('not logged in');

		res.json({
			isLoggedIn: req.session.isLoggedIn,
		});
	}
});

app.post('/superpower', function(req, res) {
	log(req);
	if(req.session.isLoggedIn && req.session.superpower) {
		console.log('superpower switching to: ' + req.body.username);
		const realUserid = req.session.realUserid;

		processLogin(req.session, req.body)
			.then(session => {
				session.realUserid = realUserid;
				req.session = session;
				req.session.save();
			})
			.then(() => res.json({
				username: req.session.un,
				isLoggedIn: req.session.isLoggedIn,
				displayName: req.session.ldap.displayName,
				superpower: req.session.superpower,
				analyst: req.session.analyst,
				success: true,
			}));
	}
});



// WRAP UP #####################################################################

// This is for React-Router to work
app.get('*', (req, res) => {
	log(req);
	res.sendFile(path.join(__dirname + '/dist/index.html'));
});
// app.get('/*/*', (req, res) => {
// 	log(req);
// 	res.sendFile(path.join(__dirname + '/dist/index.html'));
// });


// Run app
app.listen(process.env.PORT, process.env.HOST, () => {
	console.log(`Server running at http://${process.env.HOST}:${process.env.PORT}/`);
});
