const Joi = require('@hapi/joi');
const { ObjectId } = require('mongodb');
const cronstrue = require('cronstrue');

const schema = Joi.object().keys({
  _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  defId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  repeatInterval: Joi.string().required(),
  disabled: Joi.alternatives().try(Joi.boolean(), Joi.string()),
  data: Joi.string().email({ multiple: true }).allow(null)
    .error(() => new Error('`Email To` must contain valid email address(es) separated by `,`')),
}).options({ stripUnknown: true });

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    const {
      _id: editId,
      defId,
      repeatInterval,
      disabled,
      data,
    } = await schema.validateAsync(req.body);

    try {
      cronstrue.toString(repeatInterval);
    } catch (err) {
      throw new Error('Invalid cron string.');
    }

    let jobs = await app.agenda.jobs({ _id: ObjectId(editId) }, {}, 1);
    const job = jobs[0];

    if (data) job.attrs.data = data.replace(/,[\s]*/g, ', ');

    await job.repeatEvery(repeatInterval);

    if (disabled === 'true' || disabled === true) await job.disable();
    if (disabled !== 'true' && disabled !== true) await job.enable();

    await job.save();

    jobs = await app.agenda.jobs({ name: defId });
    res.apiRes(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
