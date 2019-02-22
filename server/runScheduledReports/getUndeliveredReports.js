// const ObjectId = require('mongodb').ObjectId;

module.exports = function() {
  const getUndeliveredReports = (user, app) => {
    return new Promise(resolve => {

      // Query collection('definitions') for this user's undelivered reports
      const query = [{
        $match: {
          _id: {
            '$in': user.undelivered
          }
        }
      }, {
        $project: {
          name: 1
        }
      }, {
        $lookup: {
          'from': 'reports',
          'localField': '_id',
          'foreignField': 'definition_id',
          'as': 'report_id'
        }
      }, {
        $addFields: {
          'report_id': {
            '$max': '$report_id._id'
          }
        }
      }];

      app.dbo.collection('definitions').aggregate(query)
        .toArray((err, undelivereds) => {
          if (err) throw new Error(err);
          resolve(undelivereds);
        });

    });
  };

  return getUndeliveredReports;
};
