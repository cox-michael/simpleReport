module.exports = () => (req, res, next) => {
  res.notPermitted = options => {
    const defaults = {
      friendlyRejection: options.permission.toLowerCase(),
      sendResponse: true,
    };

    const {
      scope, permission, friendlyRejection, sendResponse,
    } = { ...defaults, ...options };

    const scopePerms = req.session.permissions[scope];

    if (!scopePerms || !scopePerms.includes(permission)) {
      console.log('Not permitted');
      if (sendResponse) {
        res.status(403)
          .success(false)
          .messages([`You do not have permissions to ${friendlyRejection}`])
          .apiRes();
      }
      return true;
    }
    return false;
  };

  next();
};
