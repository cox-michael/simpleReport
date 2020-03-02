// I've written authenticate.js that is specific to my company to authenticate
// against our Active Directory.
const { getUser, auth } = require('./authenticate.js');

module.exports = async req => {
  const { session, body } = req;

  try {
    session.un = body.username;

    const { ldap } = await getUser(body.username, body.password);
    session.ldap = ldap;
    await auth({ dn: ldap.dn, pw: body.password });
    session.isLoggedIn = true;
    // req.session.save();

    const result = await req.app.dbo.collection('users').findOneAndUpdate(
      { // FILTER
        username: session.un,
      }, { // UPDATE
        $set: {
          ldap: session.ldap,
        },
        $setOnInsert: {
          subscriptions: [],
          notifications: [],
          starred: [],
          permissions: {
            sitewide: [],
          },
          preferences: {},
        },
      }, { // OPTIONS
        projection: {
          _id: 1,
        },
        upsert: true,
        returnNewDocument: true,
      },
    );

    if (result.lastErrorObject.updatedExisting) {
      session.userid = result.value._id;
    } else {
      session.userid = result.lastErrorObject.upserted;
    }

    console.log({ username: session.un, loggedIn: session.isLoggedIn });
  } catch (err) {
    // if (!['Username not found.', 'Password is required.', 'Authentication failed.'].includes(err.
    // console.error(err);
    // }
    session.isLoggedIn = false;
    console.log({ username: session.un, loggedIn: session.isLoggedIn });

    throw new Error(err.message);
  }
};
