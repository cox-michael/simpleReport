const Joi = require('@hapi/joi');
const { ObjectId } = require('mongodb');

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  const schema = Joi.object().keys({
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }).options({ stripUnknown: true });

  try {
    const { _id } = await schema.validateAsync(req.body);

    const query = { _id: ObjectId(_id) };

    const options = {
      $project: {
        data: 1,
      },
    };

    const { data } = await app.dbo.collection('resources').findOne(query, options);
    res.apiRes(data);
  } catch (err) {
    console.error(err);
    res.status(500).success(false).messages([err.message]).apiRes([]);
  }
});
