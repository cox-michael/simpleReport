module.exports = function() {

  const notLoggedIn = {
    isLoggedIn: false,
    success: false,
    messages: ['Not logged in'],
    data: {},
  }
  const notPermitted = {
    isLoggedIn: true,
    success: false,
    messages: ['You do not have permissions to do this'],
    data: {},
  }

  const checkPermissions = (req, level) => {
    // level 1 => user must be logged in
    // level 2 => user must be an analyst
    // level 3 => user must have superpowers
    return new Promise((resolve, reject) => {
      if (level >= 1 && !req.session.isLoggedIn) {
        reject(401, notLoggedIn);
      } else if (level >= 2 && !req.session.analyst) {
        reject(403, notPermitted);
      } else if (level >= 3 && !req.session.superpower) {
        reject(403, notPermitted);
      } else {
        resolve(true);
      }
    });
  }

  return checkPermissions;
}
