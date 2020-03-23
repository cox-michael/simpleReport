const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');
const simpleReport = require('simplereport.js');
const executeReportQueries = require('../../executeReportQueries.js');
const applyTheme = require('../../applyTheme.js');

const sendEmail = (to, subject, text, attachments) => new Promise(resolve => {
  const transporter = nodemailer.createTransport({ sendmail: true });

  const mailOptions = {
    from: `"${process.env.TITLE}" <${process.env.FROM_EMAIL_ADDRESS}>`,
    // to: process.env.ADMIN_EMAIL_ADDRESS, // (comma separated)
    to, // (comma separated)
    subject,
    text, // plain text body
    // html, // html body
    attachments,
  };

  // console.log({ mailOptions });

  // transporter.sendMail(mailOptions, (err, info) => {
  transporter.sendMail(mailOptions, err => {
    // if (err) reject(err);
    // if (info) resolve(info);
    if (err) console.log('err:', err);
    // console.log('info:', info);
    // console.log('\t\t\tSent:', to);
    resolve();
  });
});

module.exports = async (jobName, app) => {
  const defs = await app.dbo.collection('definitions').find({}).project({ _id: 1 }).toArray();

  defs.map(def => def._id).forEach(_id => {
    app.agenda.define(_id, async ({ attrs: { data } }) => {
      try {
        // Get Definition
        // console.log('get def');
        const def = await app.dbo.collection('definitions').findOne({ _id: ObjectId(_id) });
        // console.log('got report');
        // Execute Queries
        let report = await executeReportQueries(def, app.dbo);
        if (report.themeId) report = await applyTheme(report, app.dbo);

        // console.log({ er: def.exceptionsReport });

        // Check if Exceptions report and there arn't exceptions
        if (def.exceptionsReport) {
          const sendExceptionsReport = report.dataSources.some(ds => (
            Array.isArray(ds.data) && ds.data.length
          ));
          // console.log({ sendExceptionsReport });
          if (!sendExceptionsReport) {
            // Insert into db
            await app.dbo.collection('reports').insertOne({
              definitionId: ObjectId(def._id),
              noExceptions: true,
            });
            // console.log('inserted');
            return;
          }
        }

        // Generate Report
        const buffer = await simpleReport.generate(report, true);

        // Send Email
        if (data) {
          // console.log({ data });
          const attachments = [{ filename: `${report.filename}.xlsx`, content: buffer }];
          sendEmail(data, report.name, 'Please see attached report', attachments);
        }

        // Insert into db
        await app.dbo.collection('reports').insertOne({
          definitionId: ObjectId(def._id),
          filename: `${report.filename}.xlsx`,
          file: buffer, // JSON.stringify(buffer)
          downloads: [],
        });

        // report._id = result.ops[0]._id;
        // report.definition_id = result.ops[0].definition_id;

        // await updateSubscribedUsers(report, app);
        // await sendNotificationEmail(report, app),
      } catch (err) {
        console.error(err);
      }
    });
  });
};
