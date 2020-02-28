const mongodb = require('mongodb');
const Joi = require('@hapi/joi');

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  const schema = Joi.object().keys({
    reportId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }).options({ stripUnknown: true });

  let body;
  try {
    body = await schema.validateAsync(req.body);
  } catch (err) {
    console.log(err.message);
    res.success(false).messages([err.message]).apiRes();
    return;
  }

  req.app.dbo.collection('users').findOneAndUpdate(
    {
      _id: mongodb.ObjectId(req.session.userid),
    },
    {
      $addToSet: {
        notifications: mongodb.ObjectId(body.reportId),
      },
    },
    {
      upsert: 1,
    },
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).success(false).messages([err.message]).apiRes([]);
      }
      if (!result.lastErrorObject.updatedExisting) {
        res.status(500).success(false).messages(['Could not find user.']).apiRes([]);
        return;
      }
      res.messages(['Report added to notifications.']).apiRes([]);
    },
  );
});
