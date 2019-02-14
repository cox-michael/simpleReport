const processLogin = require('./../processLogin.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 3;

  module.fn = (req, res) => {
    console.log('superpower switching to: ' + req.body.username);
    const realUserid = req.session.realUserid;

    processLogin(req)
      .then(session => {
        session.realUserid = realUserid;
        req.session = session;
        req.session.save();
      })
      .then(() => res.json({
        username: req.session.un,
        isLoggedIn: req.session.isLoggedIn,
        displayName: req.session.ldap.displayName,
        superpower: req.session.superpower,
        analyst: req.session.analyst,
        success: true,
      }));
  };

  return module;
};
