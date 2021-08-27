const Joi = require('@hapi/joi');
const { ObjectId } = require('mongodb');
const simpleReport = require('simplereport.js');
const executeReportQueries = require('./../executeReportQueries.js');
const applyTheme = require('./../applyTheme.js');

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  req.setTimeout(1000 * 60 * 20, () => {
    console.log('Request timed out. Long running query');
    res.send(500);
  });

  const schema = Joi.object().keys({
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  }).options({ stripUnknown: true });

  try {
    const { _id } = await schema.validateAsync(req.body);
    const definition = await app.dbo.collection('definitions').findOne({ _id: ObjectId(_id) });
    let report = await executeReportQueries(definition, app.dbo);
    if (report.themeId) report = await applyTheme(report, app.dbo);
    const buffer = await simpleReport.generate(report, true);
    res.apiRes({ filename: report.filename, buffer: JSON.stringify(buffer) });
    // res.apiRes({ buffer: JSON.stringify(buffer) });
    // res.apiRes({ report });
  } catch (err) {
    console.error(err);
    res.status(500).success(false).messages([err.message]).apiRes([]);
  }
});
