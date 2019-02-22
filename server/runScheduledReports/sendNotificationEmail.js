const mail = require('./../mail.js')();

module.exports = function() {
  const sendNotificationEmail = (report, app) => {
    return new Promise(resolve => {
      console.log('\t\tSending immediate notifications');

      const usersToNotify = [];
      app.users.forEach(user => {
        user.notifications.forEach(sub => {
          if (sub.equals(report._id)) usersToNotify.push(user);
        });
      });

      const subject = `Report notification: ${report.name}`;
      const row = app.fillTemplate(app.templates.row, {
        fullUrl: process.env.FULL_URL,
        report_id: report.id,
        reportName: report.name,
        created: app.cleanDate(report.id.getTimestamp()),
        definition_id: report.definition_id,
      });
      const notification = app.fillTemplate(app.templates.notification, {
        fullUrl: process.env.FULL_URL,
        rows: row
      });

      Promise.all(
          usersToNotify.map(user => mail(
            process.env.NODE_ENV !== 'production' ?
              process.env.ADMIN_EMAIL_ADDRESS : user.ldap.mail,
            process.env.NODE_ENV !== 'production' ?
              subject + ` (${user.ldap.mail})` : subject,
            notification
          ))

        )
        .then(() => {
          console.log('\t\tall notifications sent');
          resolve();
        });
    });
  };

  return sendNotificationEmail;
};
