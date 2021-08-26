module.exports = app => app.post(app.routeFromName(__filename), async (req, res) => {
  try {
    const jobs = await app.agenda.jobs();
    const defs = await app.dbo.collection('definitions').find({}, { projection: { name: 1 } }).toArray();

    const schedules = jobs.map(j => j.attrs).map(j => {
      const found = defs.find(d => `${d._id}` === j.name);
      return { ...j, defName: found && found.name };
    });

    res.apiRes(schedules);
  } catch (err) {
    console.error(err);
    res.status(500).success(false).messages([err.message]).apiRes([]);
  }
});
