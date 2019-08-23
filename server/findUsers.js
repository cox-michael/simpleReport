const ldap = require('ldapjs');

module.exports = {
  findUsers: query => (
    new Promise((resolve, reject) => {
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
    })),
};
