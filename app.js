console.log('\n\nStarting Service');
console.log(new Date());
console.log('Set working directory');
console.log(__dirname);
process.chdir(__dirname);

require('dotenv').config();
console.log('NODE_ENV: ' + process.env.NODE_ENV);

const express = require('express');
const path = require('path'); // this is for serving files
// const util = require('util'); // util is for formatting parameters in strings
// const spawn = require("child_process").spawn;

const session = require('express-session');
var FileStore = require('session-file-store')(session);

const app = express();
app.use(express.json()); // this allows you to send and receive json for API

// var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
// Initialize MongoDB connection once
MongoClient.connect(
	"mongodb://" + process.env.DB_USER +
	":" + process.env.DB_PASSWORD +
	"@" + process.env.DB_HOST +
	"/admin", { useNewUrlParser: true }, function(err, database) {
	if(err) throw err;

	app.dbo = database.db(process.env.DB_NAME);

	// Start the application after the database connection is ready
	app.listen(process.env.POOLING_PORT);
	console.log(`MongoDB listening on port ${process.env.POOLING_PORT}`);
});

var fileStoreOptions = {};
app.use(session({
	name: process.env.NODE_ENV, // ensure your environments don't share cookies
	secret: "try",
	store: new FileStore(fileStoreOptions),
	resave: true,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: (90 * 86400 * 1000),
	},
	// expires: new Date(Date.now() + (90 * 86400 * 1000))
}));
app.use(express.static('static'));

// const apiRouter = express.Router();
// const getLocations = (req, res) => {
// 	res.sendFile(process.cwd() + '/data/locations.json');
// }
// apiRouter.get('/locations', getLocations);
// app.use('/', apiRouter);

const log = require('./server/logger.js')();
const checkPermissions = require('./server/checkPermissions.js')();

//##############################################################################
// SERVING #####################################################################
//##############################################################################

app.get('/', (req, res) => {
	log(req);
	res.sendFile(path.join(__dirname + '/dist/index.html'));
});

app.get('/dist/main.js', (req, res) => {
	log(req);
	res.sendFile(path.join(__dirname + '/dist/main.js'));
});

app.get('/favicon.ico', (req, res) => {
	log(req);
	res.sendFile(path.join(__dirname + '/src/favicon.ico'));
});

app.get('/destroy', (req, res) => {
	log(req);
	req.session.destroy();
	res.end('Session destroyed!');
});

app.get('/removeAnalyst', (req, res) => {
	log(req);
	req.session.analyst = false;
	req.session.save();
	res.end('not an analyst anymore');
});

app.get('/removeSuperpower', (req, res) => {
	log(req);
	req.session.superpower = false;
	req.session.save();
	res.end('not a hero anymore');
});

app.get('/sessionData', (req, res) => {
	log(req);
	res.json(req.session);
});

app.get('/downloadTest/:filename', (req, res) => {
	log(req);
	checkPermissions(req, 2)
	.then(() => {
		const filename = path.join(__dirname + '/tmp/' + req.params.filename);
		res.download(filename);
	});
});

const downloadReport = require('./server/routes/downloadReport.js')();
app.get('/downloadReport/:id', downloadReport); // NON-CONFORMING

const apiHandler = require('./server/apiHandler.js')();
app.all('/api/:handle', apiHandler);



//##############################################################################
// AUTHENTICATION ##############################################################
//##############################################################################

const processLogin = require('./server/processLogin.js')();

app.post('/login', function(req, res) {
	log(req);
	req.session.realUn = req.body.username;
	req.session.superpower = false;

	processLogin(req)
		.then(session => {
			session.realUserid = session.userid;
			req.session = session;
			req.session.save();
		})
		.then(() => res.json({
			username: req.session.un,
			isLoggedIn: req.session.isLoggedIn,
			displayName: req.session.ldap.displayName,
			superpower: req.session.superpower,
			analyst: req.session.analyst,
		}));
});

app.get('/logout', (req, res) => {
	log(req);
	req.session.isLoggedIn = false;
	res.redirect(process.env.API_URL);
});

app.get('/loggedIn', (req, res) => {
	log(req);
	if (req.session.isLoggedIn) {
		console.log(req.session.un + ' is logged in');
		console.log('The displayName is ' + req.session.ldap.displayName);
		console.log('Superpower: ' + req.session.superpower);

		res.json({
			isLoggedIn: req.session.isLoggedIn,
			displayName: req.session.ldap.displayName,
			superpower: req.session.superpower,
			analyst: req.session.analyst,
		});
	} else {
		console.log('not logged in');

		res.json({
			isLoggedIn: req.session.isLoggedIn,
		});
	}
});

// TODO: fix this. It's not working.
// Route.post() requires a callback function but got a [object Object]

// WRAP UP #####################################################################

// TODO: remove this after full production release to public
app.get('//*', (req, res) => { // reroute from old domain
	res.redirect('http://' + process.env.FULL_URL + req.originalUrl.substr(2));
});

// This is for React-Router to work
app.get('*', (req, res) => {
	log(req);
	res.sendFile(path.join(__dirname + '/dist/index.html'));
});

// Run app
app.listen(process.env.PORT, process.env.HOST, () => {
	console.log(`Server running at http://${process.env.HOST}:${process.env.PORT}/`);
});
