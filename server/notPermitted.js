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

  if (!session.isLoggedIn) {
    console.log('Not logged in');
    if (sendResponse && cb) cb(['You are not logged in']);
    return true;
  }

  let scopePerms;
  if (session && session.permissions) scopePerms = session.permissions[scope];

  if (!scopePerms || !scopePerms.includes(permission)) {
    console.log('Not permitted');
    // console.log({ scopePerms, session, n: session.ldap.displayName });
    if (sendResponse && cb) cb([`You do not have permissions to ${friendlyRejection}`]);
    return true;
  }
  return false;
};
