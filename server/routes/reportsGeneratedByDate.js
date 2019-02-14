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
          "created": {
            "$dateFromString": {
              "dateString": {
                "$dateToString": {
                  "format": "%Y-%m-%d",
                  "date": {
                    "$toDate": "$_id"
                  },
                  "timezone": "America/New_York"
                }
              },
              "timezone": "America/New_York"
            }
          }
        }
      }, {
        "$group": {
          "_id": {
            "created": "$created"
          },
          "generated": {
            "$push": "$_id"
          }
        }
      }, {
        "$project": {
          "created": "$_id.created",
          "generated": {
            "$size": "$generated"
          },
          "_id": 0
        }
      }, {
        "$sort": {
          "created": -1
        }
      }
    ];

    req.app.dbo.collection('reports').aggregate(query).toArray((err, docs) => {
      res.json(apiResponse(docs));
    });

  };

  return module;
};
