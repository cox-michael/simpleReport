const simpleReport = require('simplereport.js');
const applyTheme = require('./../applyTheme.js');
const reportSchema = require('../schemas/reportOrDef')(true);

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    let report = await reportSchema.validateAsync(req.body);

    if (report.reportNameType === 'Dynamic' && report.reportNameDataSourceId) {
      const reportNameData = report.dataSources
        .find(ds => ds.id === report.reportNameDataSourceId).data;
      // eslint-disable-next-line prefer-destructuring
      if (reportNameData.length) report.name = Object.values(reportNameData[0])[0];
    }
    if (report.reportNameType === 'Static' && report.reportName) report.name = report.reportName;

    if (report.reportFilenameType === 'Dynamic' && report.filenameDataSourceId) {
      const filenameData = report.dataSources
        .find(ds => ds.id === report.filenameDataSourceId).data;
      // eslint-disable-next-line prefer-destructuring
      if (filenameData && filenameData.length) {
        [report.filename] = Object.values(filenameData[0]);
        return;
      }
      report.filename = 'Filename error';
    }
    if (report.reportFilenameType === 'Static' && report.reportFilename) {
      report.filename = report.reportFilename;
    }
    if (report.reportFilenameType === 'Same as Report') report.filename = report.name;


    // Generate report ///////////////////////////////////////////////////////////////////////
    if (report.themeId) report = await applyTheme(report, req.app.dbo);
    const buffer = await simpleReport.generate(report, true);
    res.apiRes({ filename: report.filename, buffer: JSON.stringify(buffer) });
  } catch (err) {
    console.error(err);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
