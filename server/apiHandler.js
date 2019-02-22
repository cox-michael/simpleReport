const log = require('./logger.js')();
const checkPermissions = require('./checkPermissions.js')();
const apiResponse = require('./apiResponse.js')();
// const path = require('path');

module.exports = function() {

  const apiHandler = (req, res) => {
    log(req);

    const handle = req.params.handle;
    const routes = {};

    // Load route if it hasn't already been loaded
    if (!(handle in routes)) {
      try {
        // console.log(`./routes/${handle}.js`);
        // console.log(path.join(__dirname + `/routes/${handle}.js`));
        // routes[handle] = require(path.join(__dirname + `/routes/${handle}.js`))();
        routes[handle] = require(`./routes/${handle}.js`)();
      } catch (err) {
        const errorMsg = `Module not found for "${handle}"`;
        console.error(errorMsg);
        res.status(404);
        res.json(apiResponse({}, false, errorMsg));
        return;
      }
    }

    // Check for appropriate checkPermissions then execute route function
    checkPermissions(req, routes[handle].permissionLevel)
      .then(() => {
        routes[handle].fn(req, res);
      })
      .catch((code, json) => {
        res.status(code);
        res.json(json);
      });
  };

  return apiHandler;
};
