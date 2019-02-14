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
          "filename": 1,
          "downloads": 1
        }
      }, {
        "$match": {
          "$expr": {
            "$gt": [
              {
                "$size": "$downloads"
              }, 0
            ]
          }
        }
      }, {
        "$unwind": {
          "path": "$downloads"
        }
      }, {
        "$group": {
          "_id": {
            "_id": "$_id",
            "filename": "$filename"
          },
          "downloads": {
            "$addToSet": "$downloads.user_id"
          }
        }
      }, {
        "$addFields": {
          "_id": "$_id._id",
          "filename": "$_id.filename",
          "downloads": {
            "$size": "$downloads"
          }
        }
      }, {
        "$sort": {
          "downloads": -1
        }
      }, {
        "$limit": 5
      }
    ];

    req.app.dbo.collection('reports').aggregate(query).toArray((err, docs) => {
      res.json(apiResponse(docs));
    });
  };

  return module;
};
