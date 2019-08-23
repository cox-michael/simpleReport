const processLogin = require('./../processLogin.js')();

module.exports = app => app.post(app.routeFromName(__filename), (req, res) => {
  const perms = { scope: 'sitewide', permission: 'Superpower' };
  if (res.notPermitted(perms)) return;

  console.log(`superpower switching to: ${req.body.username}`);
  const { un: realUn } = req.session;

  processLogin(req)
    .then(session => {
      console.log(`(superpower used by ${realUn})`);
      req.session = { ...req.session, ...session };
      req.session.realUn = realUn;
      req.session.save();
    })
    .then(() => res.json({
      // username: req.session.un,
      isLoggedIn: req.session.isLoggedIn,
      displayName: req.session.ldap.displayName,
      userid: req.session.userid,
      permissions: req.session.permissions,
      success: true,
    }));
});
