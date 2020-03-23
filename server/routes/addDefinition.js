const { ObjectId } = require('mongodb');
const defineJobProcessors = require('../agenda/jobs/createReport');
const defSchema = require('../schemas/reportOrDef')(false);

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    const definition = await defSchema.validateAsync(req.body);

    if (definition._id) {
      const { _id } = definition;
      delete definition._id;
      await app.dbo.collection('definitions').updateOne(
        { _id: ObjectId(_id) },
        { $set: { ...definition } },
      );
    } else {
      await app.dbo.collection('definitions').insertOne(definition);
      await defineJobProcessors(null, app);
    }
    res.messages(['Report definition saved successfully.']).apiRes();
  } catch (err) {
    console.log(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
