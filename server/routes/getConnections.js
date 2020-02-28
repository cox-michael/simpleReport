module.exports = app => app.get(app.routeFromName(__filename), async (req, res) => {
  const query = [
    {
      $project: {
        name: 1,
      },
    },
    {
      $sort: {
        name: 1,
      },
    },
  ];

  req.app.dbo.collection('connections').aggregate(query).toArray(
    (err, docs) => {
      if (err) {
        console.error(err);
        res.status(500).success(false).messages([err.message]).apiRes([]);
        return;
      }
      res.apiRes(docs);
    },
  );
});
