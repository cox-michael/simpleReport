const simpleReport = require('simplereport.js');
const Joi = require('@hapi/joi');

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  const schema = Joi.object().keys({
    report: Joi.object({
      _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
      // eslint-disable-next-line no-useless-escape
      name: Joi.string().pattern(/^[\w\s\[\]\{\}\.()`~!@#$%^&\-+=;',]{1,255}$/).required(),
      description: Joi.string().allow(''),
      dept: Joi.string(),
      requestedBy: Joi.string(),
      exceptionsReport: Joi.boolean(),
      dataSources: Joi.array().items(Joi.object({
        id: Joi.number().required(),
        type: Joi.string().valid('Query', 'Resource').required(),
        value: Joi.when('type', {
          is: 'Resource',
          then: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
          otherwise: Joi.string().required(),
        }),
        name: Joi.when('type', {
          is: 'Query',
          then: Joi.string().required(),
        }),
        connectionId: Joi.when('type', {
          is: 'Query',
          then: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
        }),
        data: Joi.array().items(
          Joi.object({
            tableData: Joi.any().strip(),
          }).pattern(/./, Joi.alternatives().try(
            Joi.string(),
            Joi.number(),
            Joi.date(),
          )),
        ),
        columnNames: Joi.array().items(Joi.string()),
      }).options({ stripUnknown: true })).required(),
      sheets: Joi.array().items(Joi.object({
        // eslint-disable-next-line no-useless-escape
        name: Joi.string().pattern(/^((?![\*\[\]\\/\?]).){1,31}$/).required(),
        type: Joi.string().valid('Single', 'Grouping').required(),
        dataSourceId: Joi.when('type', {
          is: 'Grouping',
          then: Joi.number().required(),
        }),
        groupingColumn: Joi.when('type', {
          is: 'Grouping',
          then: Joi.string().required(),
        }),
        data: Joi.when('type', {
          is: 'Grouping',
          then: Joi.array().items(
            Joi.object({
              tableData: Joi.any().strip(),
            }).pattern(/./, Joi.alternatives().try(
              Joi.string(),
              Joi.number(),
              Joi.date(),
            )),
          ).required(),
        }),
        tables: Joi.when('type', {
          is: 'Single',
          then: Joi.array().items(Joi.object({
            name: Joi.string().required(),
            type: Joi.string().valid('Single', 'Grouping').required(),
            printTableName: Joi.boolean(),
            description: Joi.string().allow(''),
            dataSourceId: Joi.number().required(),
            groupingColumn: Joi.when('type', {
              is: 'Grouping',
              then: Joi.string().required(),
            }),
            filters: Joi.boolean(),
            rowBanding: Joi.object({
              on: Joi.boolean(),
              useDefaults: Joi.boolean(),
              primary: Joi.object({
                font: Joi.string(),
                background: Joi.string(),
              }).options({ stripUnknown: true }),
              secondary: Joi.object({
                font: Joi.string(),
                background: Joi.string(),
              }).options({ stripUnknown: true }),
            }).options({ stripUnknown: true }),
            totalsRow: Joi.object({
              on: Joi.boolean(),
              columns: Joi.object().pattern(/./, Joi.alternatives().try(
                Joi.string(),
                Joi.number(),
              )),
            }).options({ stripUnknown: true }),
            data: Joi.array().items(
              Joi.object({
                tableData: Joi.any().strip(),
              }).pattern(/./, Joi.alternatives().try(
                Joi.string(),
                Joi.number(),
                Joi.date(),
              )),
            ),
          }).options({ stripUnknown: true })),
        }),
        printSheetName: Joi.boolean(),
        printReportName: Joi.boolean(),
        description: Joi.string().allow(''),
      }).options({ stripUnknown: true })).required(),
    }).options({ stripUnknown: true }).required(),
  }).options({ stripUnknown: true });

  try {
    const { report } = await schema.validateAsync(req.body);

    simpleReport.generate(report, true)
      .then(buffer => res.apiRes({ buffer: JSON.stringify(buffer) }))
      .catch(err => {
        console.error(err);
        res.status(500).success(false).messages([err.message]).apiRes([]);
      });
  } catch (err) {
    console.log(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
