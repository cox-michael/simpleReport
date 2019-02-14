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
        "subscriptions": 1,
        "_id": 0
      }
    }, {
      "$unwind": {
        "path": "$subscriptions"
      }
    }, {
      "$group": {
        "_id": "$subscriptions",
        "subscriptions": {
          "$sum": 1
        }
      }
    }, {
      "$lookup": {
        "from": "definitions",
        "localField": "_id",
        "foreignField": "_id",
        "as": "definition"
      }
    }, {
      "$project": {
        "subscriptions": 1,
        "name": {
          "$arrayElemAt": [
            "$definition.name", 0
          ]
        }
      }
    }, {
      "$sort": {
        "subscriptions": -1
      }
    }, {
      "$limit": 5
    }];

    req.app.dbo.collection('users').aggregate(query).toArray((err, docs) => {
      res.json(apiResponse(docs));
    });
  };

  return module;
};
