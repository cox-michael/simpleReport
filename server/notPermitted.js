module.exports = options => {
  const defaults = {
    friendlyRejection: (options && options.permission) ?
      options.permission.toLowerCase() :
      'do this',
    sendResponse: true,
  };

  const {
    scope, permission, friendlyRejection, sendResponse, cb, session,
  } = { ...defaults, ...options };

  const scopePerms = session.permissions[scope];

  if (!scopePerms || !scopePerms.includes(permission)) {
    console.log('Not permitted');
    // console.log({ scopePerms, session, n: session.ldap.displayName });
    if (sendResponse && cb) cb([`You do not have permissions to ${friendlyRejection}`]);
    return true;
  }
  return false;
};
