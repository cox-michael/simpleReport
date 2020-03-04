const simpleReport = require('simplereport.js');
const applyTheme = require('./../applyTheme.js');
const reportSchema = require('../schemas/reportOrDef')(true);

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    let report = await reportSchema.validateAsync(req.body);
    if (report.themeId) report = await applyTheme(report, req.app.dbo);
    const buffer = await simpleReport.generate(report, true);
    res.apiRes({ filename: report.name, buffer: JSON.stringify(buffer) });
  } catch (err) {
    console.log(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
