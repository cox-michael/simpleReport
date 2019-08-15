const Joi = require('joi'); // api validation
const { findUsers } = require('./../findUsers.js');

module.exports = app => app.post(app.routeFromName(__filename), (req, res) => {
  const perms = { scope: 'sitewide', permission: 'Edit User Permissions' };
  if (res.notPermitted(perms)) return;

  const schema = Joi.string().regex(/^[\w\-\s.]+$/).min(2).required();
  Joi.validate(req.body.query, schema, err => {
    if (err) {
      console.log(err);
      res.status(400).success(false).messages(['Invalid query']).apiRes([]);
      return;
    }

    findUsers(req.body.query)
      .then(users => res.apiRes(users));
  });
});
