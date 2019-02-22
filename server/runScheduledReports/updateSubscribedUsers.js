module.exports = function() {
  const updateSubscribedUsers = (report, app) => {
    return new Promise(resolve => {
      console.log('\t\tFind subscribbed users');

      const usersToUpdate = [];
      app.users.forEach(user => {
        user.subscriptions.forEach(sub => {
          if (sub.equals(report._id)) usersToUpdate.push(user._id);
        });
      });

      console.log('\t\tUpdate users');
      app.dbo.collection('users').updateMany(
        // Filter
        {
          '_id': {
            '$in': usersToUpdate
          }
        },
        // Update
        {
          '$addToSet': {
            'undelivered': report._id
          }
        },
        // Callback
        resolve());
    });
  };

  return updateSubscribedUsers;
};
