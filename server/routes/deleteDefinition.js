const Joi = require('@hapi/joi');
const { ObjectId } = require('mongodb');

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  const schema = Joi.object().keys({
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }).options({ stripUnknown: true });

  try {
    const { _id } = await schema.validateAsync(req.body);

    const schedules = await app.agenda.jobs({ name: _id });

    if (schedules.length) throw new Error('You must delete all schedules before you can delete the definition.');

    const result = await app.dbo.collection('definitions').updateOne(
      { _id: ObjectId(_id) },
      { $set: { deleted: true } },
    );
    res.apiRes(result);
  } catch (err) {
    console.log(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
