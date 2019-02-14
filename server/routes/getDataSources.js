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
          "name": 1
        }
      },
      {
        "$sort": {
          "name": 1
        }
      }
    ];

    req.app.dbo.collection('dataSources').aggregate(query).toArray((err, docs) => {
      res.json(apiResponse(docs));
    });

  };

  return module;
};
