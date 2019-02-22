// const util = require('util');
const fs = require('fs');
// const readFile = util.promisify(fs.readFile);

const fileToString = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, string) => {
      if (err) reject(err);
      resolve(string);
    });
  });
};

// const templatePaths = {
//   daily: './src/email_templates/daily_delivery.html',
//   notification: './src/email_templates/immediate_notification.html',
//   row: './src/email_templates/report_row.html',
// };

module.exports = function() {
  const loadHtmlEmailTemplates = (app) => {
    return new Promise(resolve => {

      console.log('\tLoad HTML email templates');

      // const templates = {};
      // for (const [name, path] of Object.entries(templatePaths)) {
      //   templates[name] = readFile(path);
      // }


      app.templates = {};

      Promise.all([
        fileToString('./src/email_templates/daily_delivery.html')
        .then(string => {
          return new Promise(resolve => {
            app.templates.daily = string;
            resolve();
          });
        }),
        fileToString('./src/email_templates/immediate_notification.html')
        .then(string => {
          return new Promise(resolve => {
            app.templates.notification = string;
            resolve();
          });
        }),
        fileToString('./src/email_templates/report_row.html')
        .then(string => {
          return new Promise(resolve => {
            app.templates.row = string;
            resolve();
          });
        })
      ])
      .then(() => {
          console.log('\tTemplates loaded:', Object.keys(app.templates));
          resolve();
      });


      //   daily: fileToString(
      //     './src/email_templates/daily_delivery.html'
      //   ),
      //   notification: fileToString(
      //     './src/email_templates/immediate_notification.html'
      //   ),
      //   row: fileToString(
      //     './src/email_templates/report_row.html'
      //   ),
      // };

      // Promise.all(Object.values(templates))
      // .then(() => {
      //     console.log('all templates resolved');
      //     console.log(Object.values(templates)[0]);
      //     resolve(templates);
      //
      // });

      // readFile("path/to/myfile")
      // .then(file => console.log(file))





      // return new Promise((resolve, reject) => {
      //   fs.readFile(fileName, 'utf8', (err, data) => {
      //       err ? reject(err) : resolve(data);
      //   });
      // });

    });
  };

  return loadHtmlEmailTemplates;
};
