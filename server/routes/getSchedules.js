const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
  _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
}).options({ stripUnknown: true });

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    const { _id } = await schema.validateAsync(req.body);

    const jobs = await app.agenda.jobs({ name: _id });

    res.apiRes(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).success(false).messages([err.message]).apiRes([]);
  }
});
