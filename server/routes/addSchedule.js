const Joi = require('@hapi/joi');
const cronstrue = require('cronstrue');

const schema = Joi.object().keys({
  _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  repeatInterval: Joi.string().required(),
  data: Joi.string().email({ multiple: true }).allow(null)
    .error(() => new Error('`Email To` must contain valid email address(es) separated by `,`')),
}).options({ stripUnknown: true });

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    const { _id, repeatInterval, data } = await schema.validateAsync(req.body);

    try {
      cronstrue.toString(repeatInterval);
    } catch (err) {
      throw new Error('Invalid cron string.');
    }

    await app.agenda.create(_id, data.replace(/,[\s]*/g, ', ')).repeatEvery(repeatInterval).save();
    const jobs = await app.agenda.jobs({ name: _id });
    res.apiRes(jobs);
  } catch (err) {
    console.log(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
