const Agenda = require('agenda');

module.exports = dbo => {
  const agenda = new Agenda({ mongo: dbo });

  agenda.define('testAgenda', job => {
    console.log('this is my test agenda job');
    console.log('These are the parameters:', job.attrs.data);
    // cb();
  });
  agenda.define('Administer Cue Card', async () => {
    console.log('>>>>> Run Administer Cue Card <<<<<<');
  });

  // agenda.jobs({ name: 'printAnalyticsReport' })
  agenda.jobs({ name: 'printAnalyticsReport' }, { data: -1 }, 3)
    .then(jobs => {
      jobs.forEach(job => console.log({ job }));
    });

  // agenda.every(
  //   '2 minutes',
  //   'testAgenda',
  //   { name: 'this is parameter name', now: new Date() },
  //   { skipImmediate: true },
  //   logDone,
  // );
  // agenda.every(
  //   '*/5 * * * *',
  //   // '*/5 5-21 * * *',
  //   'testAgenda',
  //   { reportId: 'dfg654asdg654' },
  //   { skipImmediate: true },
  // );

  // dbo.collection('administerClaimCueCardSchedule').findOne(
  //   { current: true },
  //   (err, schedule) => {
  //     if (err) { console.error(err); return; }
  //     agenda.every(schedule.schedule, 'Administer Claim Cue Card');
  //   },
  // );

  agenda.purge((err, numRemoved) => {
    console.log({ numRemoved });
  });

  // agenda.now(
  //   'testAgenda',
  //   { name: 'now test', now: new Date() },
  //   // logDone,
  // );

  agenda.on('start', job => {
    console.log(`Job ${job.attrs.name} starting`);
  });

  console.log('starting agenda');
  agenda.start();

  return agenda;
};
