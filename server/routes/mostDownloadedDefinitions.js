// const mongodb = require('mongodb');
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  // level 1 => user must be logged in
  // level 2 => user must be an analyst
  // level 3 => user must have superpowers
  module.permissionLevel = 2;

  module.fn = (req, res) => {
    const query = [
        {
            "$project": {
                "definition_id": 1,
                "downloads": {
                    "$size": "$downloads"
                }
            }
        }, {
            "$match": {
                "$expr": {
                    "$gt": [
                        "$downloads", 0
                    ]
                }
            }
        }, {
            "$group": {
                "_id": "$definition_id",
                "downloads": {
                    "$sum": "$downloads"
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
            "$addFields": {
                "definition": {
                    "$arrayElemAt": [
                        "$definition", 0
                    ]
                }
            }
        }, {
            "$project": {
                "name": "$definition.name",
                "downloads": 1
            }
        }, {
            "$sort": {
                "downloads": -1
            }
        }
    ];

    req.app.dbo.collection('reports').aggregate(query).toArray((err, docs) => {
      res.json(apiResponse(docs));
    });
  };

  return module;
};
