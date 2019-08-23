const Joi = require('@hapi/joi');
const ldap = require('ldapjs');
// const { findUsers } = require('./../findUsers.js');

const findUsers = query => new Promise((resolve, reject) => {
  if (query === '') { reject(); return; }

  const client = ldap.createClient({ url: process.env.LDAP_URL });

  client.on('error', () => console.log('findUsers: LDAP connection closed'));

  client.bind(process.env.LDAP_USER, process.env.LDAP_PASSWORD, err => {
    if (err) { reject(new Error(err)); return; }

    const opts = {
      filter: `(&(|(samAccountName=*${query}*)(displayName=*${query}*))(objectClass=user)(objectCategory=person))`,
      scope: 'sub',
      attributes: [
        'title',
        'department',
        'displayName',
        'mail',
        'samAccountName',
      ],
      paged: true,
      sizeLimit: 100,
    };

    client.search(process.env.LDAP_DC, opts, (error, res) => {
      if (error) {
        console.log(`Could not find ${query}`);
        reject(new Error(error));
        return;
      }

      const results = [];

      res.on('searchEntry', entry => results.push(entry.object));

      res.on('end', () => resolve(results));
    });
  });
});

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
