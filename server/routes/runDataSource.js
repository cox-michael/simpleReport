const Joi = require('@hapi/joi');
const odbc = require('odbc');
const { ObjectId } = require('mongodb');
const sqlite3 = require('sqlite3').verbose();

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  const apiError = err => {
    if (err) {
      console.log('errror');
      console.log(err.message);
      console.error(err);
      console.log({ headersSent: res.headersSent });
      res.status(500).success(false).messages([err.message]).apiRes([]);
    }
  };
  // const apiError2 = err => { throw new Error(err); };

  let conn2;
  try {
    // Validate //////////////////////////////////////////////////////////////////////////////
    const schema = Joi.object({
      connectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
      query: Joi.string().required(),
      // dataSourceId: Joi.number().required(),
      support: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        data: Joi.array().items(Joi.object()),
        connectionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
        query: Joi.string(),
      })
        // .xor('data', 'query')
        .with('query', 'connectionId')).optional().default([]),
    });
    const options = { stripUnknown: true };

    const { connectionId, query, support } = await schema.validateAsync(req.body, options);

    // Query mongodb for connection string ///////////////////////////////////////////////////
    // TODO: query only the ones the user has permissions to
    const connection = await app.dbo.collection('connections')
      .findOne({ _id: ObjectId(connectionId) });

    // Execute query /////////////////////////////////////////////////////////////////////////
    if (!connection) throw new Error('The connection could not be found');
    const { connString } = connection;

    if (connString === 'sqlite') {
      const db = new sqlite3.Database(':memory:');

      const supportTables = {};
      support.forEach(async s => {
        if (s.data) {
          supportTables[s.name.replace("'", "''")] = s.data;
          return;
        }
        if (s.connString) {
          // TODO: get connString
          console.log({ connStringS: s.connString });
          const conn = await odbc.connect(s.connString);
          const results = await conn.query(s.query);
          supportTables[s.name] = results;
          await conn.close();
        }
      });

      Object.entries(supportTables).forEach(([name, table]) => {
        const columns = Object.keys(table[0]);

        const createStmt = `CREATE TABLE '${name}' ("${columns.join('", "')}");`;
        const insertTmp = `INSERT INTO '${name}' VALUES (${'?,'.repeat(columns.length - 1)}?);`;

        // console.log({ name, columns, table, createStmt, insertTmp });

        db.serialize(() => {
          db.run(createStmt, apiError);

          const stmt = db.prepare(insertTmp, apiError);
          table.forEach(row => stmt.run(Object.values(row), apiError));
          stmt.finalize();

          // db.all(`SELECT * FROM ${name};`, (err, results) => {
          //   if (err) console.error(err);
          //   console.log({ [`${name} results`]: results });
          // });
        });
      });

      db.all(query, (err, results) => {
        if (err) apiError(err);
        res.apiRes(results);
      });

      db.close();
      return;
    }

    conn2 = await odbc.connect(connString);
    // console.log('connected');
    const results = await conn2.query(query);

    // This is to fix this error: TypeError: Do not know how to serialize a BigInt
    const cleanRes = JSON.parse(JSON.stringify(
      results, (key, value) => (typeof value === 'bigint' ? Number(value) : value),
      // results, (key, value) => (typeof value === 'bigint' ? value.toString() : value),
    ));

    res.apiRes(cleanRes);
    // conn2.close();
  } catch (err) {
    console.error(err);
    if (Array.isArray(err.odbcErrors) && err.odbcErrors[0] && err.odbcErrors[0].message) {
      res.status(500).success(false).messages([err.odbcErrors[0].message]).apiRes([]);
    }
    res.status(500).success(false).messages([err.message]).apiRes([]);
  } finally {
    if (conn2) conn2.close(err => { if (err) console.error(err); });
  }
});
