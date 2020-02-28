const { ObjectId } = require('mongodb');
const Joi = require('@hapi/joi');

const schema = Joi.object().keys({
  defId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  folderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
}).options({ stripUnknown: true });

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    const { defId, folderId } = await schema.validateAsync(req.body);

    await app.dbo.collection('definitions').findOneAndUpdate(
      { _id: ObjectId(defId) },
      {
        $set: {
          parentId: ObjectId(folderId),
        },
      },
      {
        upsert: 1,
      },
    );

    res.messages(['Report definition moved.']).apiRes();
  } catch (err) {
    console.log(err.message);
    res.status(500).success(false).messages([err.message]).apiRes();
  }
});
