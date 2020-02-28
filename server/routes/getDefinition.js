const Joi = require('@hapi/joi');
const { ObjectId } = require('mongodb');

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  const schema = Joi.object().keys({
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }).options({ stripUnknown: true });

  try {
    const { _id } = await schema.validateAsync(req.body);

    const result = await app.dbo.collection('definitions').findOne(
      { _id: ObjectId(_id) },
    );
    res.apiRes(result);
  } catch (err) {
    console.log(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
