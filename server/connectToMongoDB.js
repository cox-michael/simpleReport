var MongoClient = require('mongodb').MongoClient;

module.exports = function() {
  const connectToMongoDB = (app) => {
    return new Promise(resolve => {
      MongoClient.connect(
        "mongodb://" + process.env.DB_USER +
        ":" + process.env.DB_PASSWORD +
        "@" + process.env.DB_HOST +
        "/admin", {
          useNewUrlParser: true
        },
        function(err, database) {
          if (err) throw err;

          app.dbo = database.db(process.env.DB_NAME);

          console.log('Connected to MongoDB');
          resolve();
        });
    });
  };

  return connectToMongoDB;
};
