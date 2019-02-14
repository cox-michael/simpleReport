const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  // level 1 => user must be logged in
  // level 2 => user must be an analyst
  // level 3 => user must have superpowers
  module.permissionLevel = 2;

  module.fn = (req, res) => {

    const query = [{
      "$project": {
        "user_id": "$downloads.user_id"
      }
    }, {
      "$unwind": {
        "path": "$user_id"
      }
    }, {
      "$group": {
        "_id": "$user_id",
        "downloads": {
          "$addToSet": "$_id"
        }
      }
    }, {
      "$addFields": {
        "downloads": {
          "$size": "$downloads"
        }
      }
    }, {
      "$lookup": {
        "from": "users",
        "localField": "_id",
        "foreignField": "_id",
        "as": "displayName"
      }
    }, {
      "$addFields": {
        "displayName": {
          "$arrayElemAt": [
            "$displayName.ldap.displayName", 0
          ]
        }
      }
    }, {
      "$sort": {
        "downloads": -1
      }
    }, {
      "$limit": 5
    }];

    req.app.dbo.collection('reports').aggregate(query).toArray((err, docs) => {
      res.json(apiResponse(docs));
    });

  };

  return module;
};
