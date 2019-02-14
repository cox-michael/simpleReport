const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  // level 1 => user must be logged in
  // level 2 => user must be an analyst
  // level 3 => user must have superpowers
  module.permissionLevel = 1;

  module.fn = (req, res) => {
    const query = [{
      "$project": {
        "schedules": 1,
        "name": 1
      }
    }, {
      "$unwind": {
        "path": "$schedules"
      }
    }, {
      "$lookup": {
        "from": "reports",
        "localField": "_id",
        "foreignField": "definition_id",
        "as": "lastRun"
      }
    }, {
      "$addFields": {
        "lastRun": {
          "$toDate": {
            "$max": "$lastRun._id"
          }
        }
      }
    }];

    if (!req.session.analyst) {
      query.unshift({
        $match: {
          $expr: {
            $or: [{
                $eq: ["$permissions.company." + req.session.permissionLevel,
                  true
                ]
              },
              {
                $and: [{
                    $eq: ["$dept", req.session.ldap.department]
                  },
                  {
                    $eq: ["$permissions.dept." + req.session.permissionLevel,
                      true
                    ]
                  }
                ]
              }
            ]
          }
        }
      });
    }

    req.app.dbo.collection('definitions').aggregate(query).toArray((err, docs) => {
      res.json(apiResponse(docs));
    });
  };

  return module;
};
