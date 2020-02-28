const { ObjectId } = require('mongodb');
const Joi = require('@hapi/joi');

module.exports = app => app.get('/downloadReport/:_id', async (req, res) => {
  const schema = Joi.object().keys({
    _id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }).options({ stripUnknown: true });

  let params;
  try {
    params = await schema.validateAsync(req.params);
  } catch (err) {
    console.log(err.message);
    res.success(false).send(err.message);
    return;
  }

  try {
    const result = await req.app.dbo.collection('reports').findOneAndUpdate({
      _id: ObjectId(params._id),
    }, {
      $push: {
        downloads: {
          timestamp: new Date(),
          user_id: ObjectId(req.session.realUserid),
        },
      },
    }, {
      upsert: false,
    });

    const doc = result.value;
    if (!doc) {
      console.log('Report not found');
      res.status(500).success(false).send('Report not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${doc.filename}"`,
    });
    res.end(Buffer.from(doc.file.buffer, 'binary'));
  } catch (err) {
    console.error(err);
    res.status(500).success(false).send('Report not found');
  }
});
