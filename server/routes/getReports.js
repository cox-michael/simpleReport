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
        "$lookup": {
          "from": "users",
          "let": {
            "report_id": "$_id"
          },
          "pipeline": [{
            "$match": {
              "$expr": {
                "$and": [{
                    "$eq": ["$_id", mongodb.ObjectId(req.session.userid)]
                  },
                  {
                    "$in": ["$$report_id", "$subscriptions"]
                  }
                ]
              }
            }
          }],
          "as": "subscribed"
        }
      },
      {
        "$lookup": {
          "from": "users",
          "let": {
            "report_id": "$_id"
          },
          "pipeline": [{
            "$match": {
              "$expr": {
                "$and": [{
                    "$eq": ["$_id", mongodb.ObjectId(req.session.userid)]
                  },
                  {
                    "$in": ["$$report_id", "$notifications"]
                  }
                ]
              }
            }
          }],
          "as": "notify"
        }
      },
      {
        "$lookup": {
          "from": "users",
          "let": {
            "report_id": "$_id"
          },
          "pipeline": [{
            "$match": {
              "$expr": {
                "$and": [{
                    "$eq": ["$_id", mongodb.ObjectId(req.session.userid)]
                  },
                  {
                    "$in": ["$$report_id", "$starred"]
                  }
                ]
              }
            }
          }],
          "as": "starred"
        }
      },
      {
        "$lookup": {
          "from": "reports",
          "localField": "_id",
          "foreignField": "definition_id",
          "as": "lastRun"
        }
      },
      {
        "$addFields": {
          "subscribed": {
            "$size": "$subscribed"
          },
          "notify": {
            "$size": "$notify"
          },
          "starred": {
            "$size": "$starred"
          },
          "lastRun": {
            "$toDate": {
              "$max": "$lastRun._id"
            }
          }
        }
      },
      {
        "$sort": {
          "dept": 1,
          "name": 1
        }
      }
    ];

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
