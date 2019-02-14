const mongodb = require('mongodb');
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 1;

  module.fn = (req, res) => {
    // TODO: Anyone could get any definition with the definition_id.
    // Make this check for user permissions like getReports.
    req.app.dbo.collection('definitions').aggregate([{
      '$match': {
        '$expr': {
          '$eq': ['$_id', mongodb.ObjectId(req.body.reportId)]
        }
      }
    }, {
      '$lookup': {
        'from': 'users',
        'let': {
          'report_id': '$_id'
        },
        'pipeline': [{
          '$match': {
            '$expr': {
              '$in': ['$$report_id', '$subscriptions']
            }
          }
        }],
        'as': 'subscribed'
      }
    }, {
      '$lookup': {
        'from': 'users',
        'let': {
          'report_id': '$_id'
        },
        'pipeline': [{
          '$match': {
            '$expr': {
              '$in': ['$$report_id', '$notifications']
            }
          }
        }],
        'as': 'notify'
      }
    }, {
      '$lookup': {
        'from': 'users',
        'let': {
          'report_id': '$_id'
        },
        'pipeline': [{
          '$match': {
            '$expr': {
              '$in': ['$$report_id', '$starred']
            }
          }
        }],
        'as': 'starred'
      }
    }, {
      '$addFields': {
        'subscribed': '$subscribed._id',
        'notify': '$notify._id',
        'starred': '$starred._id'
      }
    }]).toArray(function(err, doc) {
      res.json(apiResponse(doc[0]));
    });
  };

  return module;
};
