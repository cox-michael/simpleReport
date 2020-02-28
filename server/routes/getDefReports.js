const { ObjectId } = require('mongodb');
const Joi = require('@hapi/joi');

module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  const schema = Joi.object().keys({
    definitionId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  }).options({ stripUnknown: true });

  let body;
  try {
    body = await schema.validateAsync(req.body);
  } catch (err) {
    console.log(err.message);
    res.success(false).messages([err.message]).apiRes();
    return;
  }

  console.log({ body });

  const query = [
    {
      $match: {
        definitionId: ObjectId(body.definitionId),
      },
    },
    {
      $project: {
        file: 0,
        definitionId: 0,
      },
    },
    {
      $addFields: {
        created: {
          $toDate: '$_id',
        },
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
  ];

  // if (req.session.analyst) {
  //   query.splice(-2, 0, {
  //     $unwind: {
  //       path: "$downloads",
  //       preserveNullAndEmptyArrays: true
  //     }
  //   }, {
  //     $lookup: {
  //       from: 'users',
  //       localField: 'downloads.user_id',
  //       foreignField: '_id',
  //       as: 'downloads.user'
  //     }
  //   }, {
  //     $addFields: {
  //       "downloads.user": {
  //         $arrayElemAt: [
  //           '$downloads.user.ldap.displayName', 0
  //         ]
  //       }
  //     }
  //   }, {
  //     $sort: {
  //       "downloads.timestamp": -1
  //     }
  //   }, {
  //     $group: {
  //       _id: {
  //         _id: '$_id',
  //         filename: '$filename'
  //       },
  //       downloads: {
  //         $push: "$downloads"
  //       }
  //     }
  //   }, {
  //     $addFields: {
  //       _id: "$_id._id",
  //       filename: "$_id.filename",
  //       downloads: {
  //         $filter: {
  //           input: "$downloads",
  //           as: "download",
  //           cond: {
  //             $not: {
  //               $eq: [{}, "$$download"]
  //             }
  //           }
  //         }
  //       }
  //     }
  //   });
  // }

  req.app.dbo.collection('reports').aggregate(query).toArray(
    (err, docs) => {
      if (err) {
        console.error(err);
        res.status(500).success(false).messages([err.message]).apiRes([]);
      }
      res.apiRes(docs);
    },
  );
});
