const Joi = require('@hapi/joi');

const borderStyles = ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot'];

const borderSchema = Joi.object({
  style: Joi.string().valid(...borderStyles),
  color: Joi.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
}).options({ stripUnknown: true });

const nameFormat = Joi.object({
  useDefaults: Joi.boolean().default(true),
  font: Joi.when('useDefaults', {
    is: false,
    then: Joi.object({
      size: Joi.number().max(409).min(1).precision(0),
      bold: Joi.boolean(),
      italics: Joi.boolean(),
      underline: Joi.boolean(),
      strike: Joi.boolean(),
      color: Joi.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    }).options({ stripUnknown: true }),
    otherwise: Joi.strip(true),
  }),
  fill: Joi.when('useDefaults', {
    is: false,
    then: Joi.object({
      type: Joi.string(),
      patternType: Joi.string(),
      bgColor: Joi.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
      fgColor: Joi.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
    }).options({ stripUnknown: true }),
    otherwise: Joi.strip(true),
  }),
  alignment: Joi.when('useDefaults', {
    is: false,
    then: Joi.object({
      horizontal: Joi.string().valid('left', 'center', 'right', 'justify'),
      vertical: Joi.string().valid('bottom', 'center', 'distributed', 'justify', 'top'),
      indent: Joi.number().max(250).min(1).precision(0),
      shrinkToFit: Joi.boolean(),
      textRotation: Joi.number().max(90).min(-90).precision(0),
    }).options({ stripUnknown: true }),
    otherwise: Joi.strip(true),
  }),
  border: Joi.when('useDefaults', {
    is: false,
    then: Joi.object({
      left: borderSchema,
      right: borderSchema,
      top: borderSchema,
      bottom: borderSchema,
      diagonal: borderSchema,
      diagonalDown: Joi.boolean(),
      diagonalUp: Joi.boolean(),
      outline: Joi.boolean(),
    }).options({ stripUnknown: true }),
    otherwise: Joi.strip(true),
  }),
  numberFormat: Joi.when('useDefaults', {
    is: false,
    then: Joi.string(),
    otherwise: Joi.strip(true),
  }),
}).options({ stripUnknown: true });

module.exports = includeData => Joi.object().keys({
  _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  // eslint-disable-next-line no-useless-escape
  name: Joi.string().pattern(/^[\w\s\[\]\{\}\.()`~!@#$%^&\-+=;',]{1,255}$/).required(),
  dynamicReportName: Joi.boolean().default(false),
  dataSourceId: Joi.when('dynamicReportName', {
    is: true,
    then: Joi.number().required(),
    otherwise: Joi.strip(true),
  }),
  nameFormat,
  description: Joi.string().allow(''),
  dept: Joi.string(),
  requestedBy: Joi.string(),
  exceptionsReport: Joi.boolean(),
  // eslint-disable-next-line no-useless-escape
  themeId: Joi.string().pattern(/^[\w\s\[\]\{\}\.()`~!@#$%^&\-+=;',]{1,255}$/).allow(''),
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
    ).strip(!includeData),
    columnNames: Joi.array().items(Joi.string()),
  }).options({ stripUnknown: true })).required(),
  sheets: Joi.array().items(Joi.object({
    // eslint-disable-next-line no-useless-escape
    name: Joi.string().pattern(/^((?![\*\[\]\\/\?]).){1,31}$/).required(),
    nameFormat,
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
      ).strip(!includeData),
    }),
    tables: Joi.when('type', {
      is: 'Single',
      then: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        nameFormat,
        columnNamesFormat: nameFormat,
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
          useDefaults: Joi.boolean().default(true),
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
        ).strip(!includeData),
      }).options({ stripUnknown: true })),
    }),
    table: Joi.when('type', {
      is: 'Grouping',
      then: Joi.object({
        nameFormat,
        columnNamesFormat: nameFormat,
        printTableName: Joi.boolean(),
        filters: Joi.boolean(),
        rowBanding: Joi.object({
          on: Joi.boolean(),
          useDefaults: Joi.boolean().default(true),
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
      }).options({ stripUnknown: true }),
    }),
    printSheetName: Joi.boolean(),
    printReportName: Joi.boolean(),
    description: Joi.string().allow(''),
  }).options({ stripUnknown: true })).required(),
}).options({ stripUnknown: true });
