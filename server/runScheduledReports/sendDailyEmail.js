const compileDailyEmail = require('./compileDailyEmail.js')();

module.exports = function() {
  const sendDailyEmail = (app) => {
    return new Promise(resolve => {

      // Don't execute if it's production and not morning
      if (process.env.NODE_ENV === 'production' && app.time !== 'Morning') {
        resolve();
        return;
      }
      console.log('\tSend daily email');

      console.log('\t\tGet users with undelivered reports');
      const query = [{
        '$match': {
          '$expr': {
            '$gte': [{
                '$size': {
                  '$ifNull': ['$undelivered', []]
                }
              },
              1
            ]
          }
        }
      }];

      app.dbo.collection('users')
        .aggregate(query)
        .toArray((err, usersToEmail) => {
          
          console.log(
            '\t\tUsers with undelivered reports:',
            usersToEmail.map(user => user.username)
          );

          Promise.all(usersToEmail.map(user => compileDailyEmail(user, app)))
            .then(() => {
              resolve();
            });
        });

    });
  };

  return sendDailyEmail;
};
