module.exports = function() {
  const getUsers = app => {
    return new Promise(resolve => {
      console.log('\tGet users with subscriptions');

      const query = [{
        '$match': {
          '$expr': {
            '$or': [{
                '$gte': [{
                  '$size': '$subscriptions'
                }, 1]
              },
              {
                '$gte': [{
                  '$size': '$notifications'
                }, 1]
              }
            ]
          }
        }
      }];

      app.dbo.collection('users')
        .aggregate(query)
        .toArray((err, docs) => {
          // console.log(docs);
          app.users = docs;
          console.log(
            '\tUsers with subscriptions:',
            docs.map(doc => doc.username)
          );
          resolve();
        });

    });
  };

  return getUsers;
};
