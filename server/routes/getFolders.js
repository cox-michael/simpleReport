module.exports = app => app.get(app.routeFromName(__filename), async (req, res) => {
  try {
    const docs = await app.dbo.collection('folders').find().sort({ name: 1 }).toArray();
    res.apiRes(docs);
  } catch (err) {
    console.error(err);
    res.status(500).success(false).messages([err.message]).apiRes([]);
  }
});
