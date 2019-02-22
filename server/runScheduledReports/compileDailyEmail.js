const mail = require('./../mail.js')();
const getUndeliveredReports = require('./getUndeliveredReports.js')();

module.exports = function() {
  const compileDailyEmail = (user, app) => {
    return new Promise(resolve => {

      getUndeliveredReports(user, app)
        .then(undelivereds => {

          // Setup one HTML row per report
          let rows = '';
          undelivereds.forEach(undelivered => {
            rows += app.fillTemplate(app.templates.row, {
              fullUrl: process.env.FULL_URL,
              report_id: undelivered.report_id,
              reportName: undelivered.name,
              created: app.cleanDate(undelivered.report_id.getTimestamp()),
              definition_id: undelivered._id,
            });
          });

          // Fill the HTML email template
          const html = app.fillTemplate(app.templates.daily, {
            rows: rows,
            nameOfUser: user.ldap.givenName,
            fullUrl: process.env.FULL_URL,
          });

          // Send the email
          const subject = 'Daily Report Delivery';
          mail(
              process.env.NODE_ENV !== 'production' ?
              process.env.ADMIN_EMAIL_ADDRESS : user.ldap.mail,
              process.env.NODE_ENV !== 'production' ?
              subject + ` (${user.ldap.mail})` : subject,
              html
            )
            .then(() => {

              const find = {
                '_id': user._id
              };
              const update = {
                '$set': {
                  'undelivered': []
                }
              };

              app.dbo.collection('users').findOneAndUpdate(find, update, {
                upsert: true
              }, (err) => {
                if (err) throw new Error(err);
                resolve();
              });

            });
        });

    });
  };

  return compileDailyEmail;
};
