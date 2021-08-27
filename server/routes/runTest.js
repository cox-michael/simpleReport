const simpleReport = require('simplereport.js');
const executeReportQueries = require('./../executeReportQueries.js');
const applyTheme = require('./../applyTheme.js');
const reportSchema = require('../schemas/reportOrDef')(false);

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  req.setTimeout(1000 * 60 * 20, () => {
    console.log('Request timed out. Long running query');
    res.send(500);
  });

  try {
    const definition = await reportSchema.validateAsync(req.body);
    let report = await executeReportQueries(definition, req.app.dbo);
    if (report.themeId) report = await applyTheme(report, req.app.dbo);
    const buffer = await simpleReport.generate(report, true);
    res.apiRes({ filename: report.filename, buffer: JSON.stringify(buffer) });
    // res.apiRes({ report });
  } catch (err) {
    console.error(err);
    res.status(500).success(false).messages([err.message]).apiRes([]);
  }
});
