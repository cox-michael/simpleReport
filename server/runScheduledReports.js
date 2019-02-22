// TODO: send an email to the creator and admims if the report fails

const connectToMongoDB = require('./connectToMongoDB.js')();
const loadHtmlEmailTemplates = require('./runScheduledReports/loadHtmlEmailTemplates.js')();
const getDefinitions = require('./runScheduledReports/getDefinitions.js')();
const getUsers = require('./runScheduledReports/getUsers.js')();
const generateReport = require('./runScheduledReports/generateReport.js')();
const sendDailyEmail = require('./runScheduledReports/sendDailyEmail.js')();

const app = {};

// Define a couple handy functions
app.fillTemplate = (templateString, templateVars) => {
  // eslint-disable-next-line no-new-func
  return new Function("return `" + templateString + "`;").call(templateVars);
};
app.cleanDate = (date) => {
  var format = {
    hour: '2-digit',
    minute: '2-digit'
  };
  let cleanedDate = new Date(date);
  cleanedDate = date.toLocaleDateString([], format);
  cleanedDate = cleanedDate.replace(',', ' at');
  return cleanedDate;
};

// Get the start time and log it along with the environment
app.now = new Date();
console.log('Starting ' + app.cleanDate(app.now));
require('dotenv').config();
console.log('NODE_ENV: ' + process.env.NODE_ENV);

// Determine which time of day the app is running
app.time = (date => {
  const hour = date.getHours();
  switch (true) {
    case (hour < 4):
      return 'Midnight';
    case (hour >= 4 && hour < 12):
      return 'Morning';
    case (hour >= 12 && hour < 16):
      return 'Afternoon';
    case (hour >= 16 && hour < 22):
      return 'Evening';
    case (hour >= 22):
      return 'Night';
    default:
      return 'uh-oh';
  }
})(app.now);
console.log('Time of day: ' + app.time);

connectToMongoDB(app)
  .then(() => Promise.all([
    loadHtmlEmailTemplates(app),
    getDefinitions(app),
    getUsers(app)
  ]))
  .then(() => Promise.all(app.definitions.map(def => generateReport(def, app))))
  .then(() => sendDailyEmail(app))
  // eslint-disable-next-line no-process-exit
  .then(() => process.exit());
