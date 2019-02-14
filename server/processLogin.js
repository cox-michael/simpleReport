// I've written authenticate.js that is specific to my company to authenticate
// against our Active Directory.
var { getUser, auth } = require('./authenticate.js');

module.exports = function () {

  const processLogin = (req) => {
  	return new Promise((resolve, reject) => {
  		console.log('processLogin');
  		// console.log(session);
  		// console.log(body);

      var session = req.session;
      var body = req.body;

  		session.un = body.username;

  		getUser(body.username, body.password)
  			.then(ldap => {
  				session.ldap = ldap.ldap;
  				return Promise.resolve(ldap);
  			})
  			.then(auth)
  			.then(success => {
  				session.isLoggedIn = true;

  				if (session.ldap.dn.toLowerCase().includes(process.env.ANALYST_DEPT)) {
    				// TODO: this is a temporary change until I figure out
    				// who I want to have superpowers
    				// if (session.un == process.env.ADMIN) {
  					session.superpower = true;
  				}
  				if (session.ldap.dn.toLowerCase().includes(process.env.ANALYST_DEPT)) {
  					session.analyst = true;
  				} else {
  					session.analyst = false;
  				}

  				if (session.ldap.department == 'Executive Senior Management') {
  					session.permissionLevel = 'L4'
  				} else if (session.ldap.title.toLowerCase().includes("chief") ||
  									 session.ldap.title.toLowerCase().includes("ceo")) {
  					session.permissionLevel = 'L4'
  				} else if (session.ldap.title.toLowerCase().includes("vp") ||
  									 session.ldap.title.toLowerCase().includes("president")) {
  					session.permissionLevel = 'L3'
  				} else if (session.ldap.title.toLowerCase().includes("manage") ||
  									 session.ldap.title.toLowerCase().includes("supervisor") ||
  									 session.ldap.title.toLowerCase().includes("coord")) {
  					session.permissionLevel = 'L2'
  				} else {
  					session.permissionLevel = 'L1'
  				}
  				// req.session.save();
  				req.app.dbo.collection("users").findOneAndUpdate({ // FILTER
  				    username: session.un
  				  }, { // UPDATE
  				    $set: {
  				      ldap: session.ldap,
  				    },
  				    $setOnInsert: {
  				      subscriptions: [],
  				      notifications: [],
  				      starred: [],
  				    }
  				  }, { // OPTIONS
  				    projection: {
  				      _id: 1
  				    },
  				    upsert: true,
  				    returnNewDocument: true
  				  },
  				  function(err, result) {
              if(err) {
                console.log(err);
              }
  				    if (result.lastErrorObject.updatedExisting) {
  				      session.userid = result.value._id;
  				    } else {
  				      session.userid = result.lastErrorObject.upserted;
  				    }

  				    console.log('username: ' + session.un + '; loggedIn: ' + session.isLoggedIn);
  				    resolve(session);
  				  }
  				);
  			})
  			.catch(failure => {
  				session.isLoggedIn = false;
  				console.log('username: ' + session.un + '; loggedIn: ' + session.isLoggedIn);
  				resolve(session);
  			});
  		});
  };

  return processLogin;
}
