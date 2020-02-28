const Joi = require('@hapi/joi');
const { ObjectId } = require('mongodb');

const schema = Joi.object().keys({
  _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  defId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
}).options({ stripUnknown: true });

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    const { _id: deleteId, defId } = await schema.validateAsync(req.body);

    let jobs = await app.agenda.jobs({ _id: ObjectId(deleteId) }, {}, 1);
    await jobs[0].remove();

    jobs = await app.agenda.jobs({ name: defId });
    res.apiRes(jobs);
  } catch (err) {
    console.log(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
