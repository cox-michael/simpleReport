const mongodb = require('mongodb');
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 1;

  // TODO: Anyone could execute this with the definitionId. Lock down with
  // permissionLevel like on getReports.

  module.fn = (req, res) => {
    var query = [{
        $match: {
          definition_id: mongodb.ObjectId(req.body.definitionId)
        }
      },
      {
        $project: {
          file: 0,
          definition_id: 0
        }
      },
      {
        $addFields: {
          created: {
            $toDate: "$_id"
          }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }
    ];

    if (req.session.analyst) {
      query.splice(-2, 0, {
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
                  $eq: [{}, "$$download"]
                }
              }
            }
          }
        }
      });
    }

    req.app.dbo.collection("reports").aggregate(query).toArray(function(err, docs) {
      res.json(apiResponse(docs));
    });
  };

  return module;
};
