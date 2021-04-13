const { MongoClient } = require('mongodb');

module.exports = () => {
  const connectToMongoDB = app => new Promise(resolve => {
    MongoClient.connect(
      `mongodb://${process.env.DB_USER
      }:${process.env.DB_PASSWORD
      }@${process.env.DB_HOST
      }/admin`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      (err, database) => {
        if (err) throw err;

        // eslint-disable-next-line no-param-reassign
        app.dbo = database.db(process.env.DB_NAME);

        console.log('Connected to MongoDB');
        resolve();
      },
    );
  });

  return connectToMongoDB;
};
