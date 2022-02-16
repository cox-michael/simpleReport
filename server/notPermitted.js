/**
 * Callback for notPermitted.
 * @callback requestCallback
 * @param {string[]} messages - An array of messages to send to the user
 */

/**
 * Check a user's permissions before passing through to the API. Optional: callback response to user
 * @param {object} options - Object containing the following properties
 * @param {string} options.scope - The name of the scope being checked
 * @param {string} options.permission - The name of the permission being checked within the scope
 * @param {object} options.session - Express session object
 * @param {string} [options.friendlyRejection] - You do not have permissions to ${friendlyRejection}
 * @param {requestCallback} [cb] - The callback that handles sending the response to the user.
 * @returns {boolean} true for not permitted and false for permitted
 */
module.exports = (options = {}) => {
  const {
    scope,
    permission,
    session,
    friendlyRejection = (options?.permission) ? options.permission.toLowerCase() : 'do this',
    cb = () => {},
  } = options;

  // If not logged in
  if (!session?.isLoggedIn) {
    cb(['You are not logged in']);
    return true;
  }

  const scopePerms = session?.permissions?.[scope];

  // If no permissions to scope or yes permissions to scope, but not to specific action within scope
  if (!scopePerms || !scopePerms.includes(permission)) {
    cb([`You do not have permissions to ${friendlyRejection}`]);
    return true;
  }

  return false;
};
