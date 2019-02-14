const mongodb = require('mongodb');
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  // level 1 => user must be logged in
  // level 2 => user must be an analyst
  // level 3 => user must have superpowers
  module.permissionLevel = 1;

  module.fn = (req, res) => {
    const query = [{
      "$match": {
        "completed": false
      }
    }, {
      "$addFields": {
        "votes": {
          "$subtract": [{
            "$size": "$upvotes"
          }, {
            "$size": "$downvotes"
          }]
        }
      }
    }, {
      "$addFields": {
        "upvoted": {
          "$in": [
            mongodb.ObjectId(req.session.userid), "$upvotes"
          ]
        },
        "downvoted": {
          "$in": [
            mongodb.ObjectId(req.session.userid), "$downvotes"
          ]
        }
      }
    }, {
      "$project": {
        "upvotes": 0,
        "downvotes": 0
      }
    }, {
      "$lookup": {
        "from": "users",
        "localField": "author",
        "foreignField": "_id",
        "as": "author"
      }
    }, {
      "$addFields": {
        "author": {
          "$arrayElemAt": [
            "$author", 0
          ]
        }
      }
    }, {
      "$addFields": {
        "author": "$author.ldap.displayName"
      }
    }, {
      "$sort": {
        "votes": -1
      }
    }];

    req.app.dbo.collection('requests').aggregate(query).toArray((err, docs) => {
      res.json(apiResponse(docs));
    });
  };

  return module;
};
