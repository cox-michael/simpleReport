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

  try {
    const docs = await app.dbo.collection('resources').aggregate(query).toArray();
    res.apiRes(docs);
  } catch (err) {
    console.error(err);
    res.status(500).success(false).messages([err.message]).apiRes([]);
  }
});
