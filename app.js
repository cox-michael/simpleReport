console.log(`\n\nStarting Service (${new Date()})`);
console.log(`Set working directory: ${__dirname}`);
process.chdir(__dirname);

require('dotenv').config();

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

const express = require('express');
const path = require('path'); // this is for working with directories
const fs = require('fs');
// const util = require('util'); // util is for formatting parameters in strings
// const spawn = require("child_process").spawn;

const session = require('express-session');
// const FileStore = require('session-file-store')(session);
// const MongoStore = require('connect-mongo')(session);
const MongoStore = require('connect-mongo');

const app = express();
app.use(express.json({ limit: '200mb' })); // this allows you to send and receive json for API

// Initialize MongoDB connection once
// const connectToMongoDB = require('./server/connectToMongoDB.js')();
// connectToMongoDB(app);

const { MongoClient } = require('mongodb');

// Initialize MongoDB connection once
// const dboPromise = new Promise((resolve, reject) => {
//   MongoClient.connect(
//     `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/admin`,
//     { useNewUrlParser: true, useUnifiedTopology: true },
//     (err, database) => {
//       if (err) reject(err);
//       console.log('Connected to MongoDB');
//       resolve(database);
//     },
//   );
// });

app.dboPromise = new Promise((resolve, reject) => {
  MongoClient.connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/admin`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, database) => {
      if (err) reject(err);
      console.log('Connected to MongoDB');
      resolve(database);
    },
  );
});

app.dboPromise.then(dbo => {
  app.dbo = dbo.db(process.env.DB_NAME);
  app.close = () => dbo.close();
  // eslint-disable-next-line global-require
  require('./server/agenda')(app);
});

// const fileStoreOptions = {};
const expressSession = session({
  name: process.env.NODE_ENV, // ensure your environments don't share cookies
  secret: 'try',
  // store: new FileStore(fileStoreOptions),
  store: MongoStore.create({
    clientPromise: app.dboPromise,
    dbName: 'mongoSessionStore',
  }),
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false,
    maxAge: (90 * 86400 * 1000),
  },
  // expires: new Date(Date.now() + (90 * 86400 * 1000))
});
app.use(expressSession);
app.use(express.static('static'));

// const apiRouter = express.Router();
// const getLocations = (req, res) => {
//   res.sendFile(process.cwd() + '/data/locations.json');
// }
// apiRouter.get('/locations', getLocations);
// app.use('/', apiRouter);

// const checkPermissions = require('./server/checkPermissions.js')();

const log = require('./server/logger.js')();
const apiResponse = require('./server/apiResponse.js');
const notPermitted = require('./server/notPermitted.js');

app.use(log);
app.use(apiResponse());
app.use((req, res, next) => {
  res.notPermitted = options => notPermitted({
    ...options,
    session: req.session,
    cb: messages => res.status(403).success(false).messages(messages).apiRes(),
  });

  next();
});

app.routeFromName = filename => `/api/${path.basename(filename).replace('.js', '')}`;

// ##############################################################################
// SERVING #####################################################################
// ##############################################################################

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/dist/index.html`));
});

app.get('*/dist/:js', (req, res) => {
  const { js } = req.params;
  res.sendFile(path.join(`${__dirname}/dist/${js}`));
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(`${__dirname}/src/favicon.ico`));
});

app.get('/destroy', (req, res) => {
  req.session.destroy();
  res.end('Session destroyed!');
});

app.get('/sessionData', (req, res) => {
  res.json(req.session);
});

app.get('/downloadTest/:filename', (req, res) => {
  // checkPermissions(req, 2)
  // .then(() => {
  const filename = path.join(`${__dirname}/tmp/${req.params.filename}`);
  res.download(filename);
  // });
});

// read all routes from /server/routes
fs.readdirSync('./server/routes').forEach(file => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  if (file.endsWith('.js')) require(`./server/routes/${file}`)(app);
});

app.all('/api/:handle', (req, res) => {
  const { handle } = req.params;
  const errorMsg = `Module not found for "${handle}"`;
  console.error(errorMsg);
  res.status(404);
  res.json(apiResponse({}, false, [errorMsg]));
});

// ##############################################################################
// AUTHENTICATION ##############################################################
// ##############################################################################

const processLogin = require('./server/processLogin.js');

app.post('/login', async (req, res) => {
  try {
    req.session.realUn = req.body.username;
    req.session.superpower = false;

    await processLogin(req);

    req.session.realUserid = session.userid;
    req.session.save();

    const result = await app.dbo.collection('users').findOne(
      {
        username: req.session.un,
      }, {
        ldap: 1,
        permissions: 1,
        preferences: 1,
      },
    );

    req.session.userid = result._id;
    req.session.ldap = result.ldap;
    req.session.permissions = result.permissions;
    req.session.preferences = result.preferences ? result.preferences : {};

    res.json({
      username: req.session.un,
      isLoggedIn: req.session.isLoggedIn,
      displayName: req.session.ldap.displayName,
      userid: req.session.userid,
      permissions: req.session.permissions,
      preferences: req.session.preferences,
    });
  } catch (err) {
    res.status(500).success(false).messages([err.message]).apiRes([]);
  }
});

app.get('/logout', (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect(process.env.API_URL);
});

app.get('/loggedIn', (req, res) => {
  if (req.session && req.session.isLoggedIn) {
    app.dbo.collection('users').findOne({
      username: req.session.un,
    }, {
      ldap: 1,
      permissions: 1,
      preferences: 1,
    }, (err, result) => {
      if (err) { console.error(err); return; }

      if (!result) {
        res.json({
          isLoggedIn: false,
          displayName: '',
          userid: '',
          permissions: {},
          preferences: {},
        });
        return;
      }

      req.session.userid = result._id;
      req.session.ldap = result.ldap;
      req.session.permissions = result.permissions;
      req.session.preferences = result.preferences ? result.preferences : {};

      console.log(`${req.session.un} (${req.session.ldap.displayName}) is logged in`);
      // console.log('req.session.id', req.session.id);

      res.json({
        isLoggedIn: req.session.isLoggedIn,
        displayName: req.session.ldap.displayName,
        userid: req.session.userid,
        permissions: req.session.permissions,
        preferences: req.session.preferences,
      });
    });
    return;
  }

  res.json({ isLoggedIn: req.session.isLoggedIn });
});

// WRAP UP #####################################################################

// TODO: remove this after full production release to public
app.get('//*', (req, res) => { // reroute from old domain
  res.redirect(`http://${process.env.FULL_URL}${req.originalUrl.substr(2)}`);
});

// This is for React-Router to work
app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/dist/index.html`));
});

// Run app
// app.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
//   console.log(`Server running at http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/`);
// });

module.exports = app;

// server.listen(process.env.SERVER_PORT, process.env.SERVER_HOST, () => {
//   console.log(`Server running at http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/`);
// });
