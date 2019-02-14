const mongodb = require('mongodb');
const apiHandler = require('./../apiHandler.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 3;

  module.fn = (req, res) => {
    if (req.body._id === '') {
      req.app.dbo.collection("dataSources").insertOne({
          name: req.body.name,
          connectionString: req.body.connectionString,
        })
        .then(() => {
          req.params = {};
          req.params.handle = 'getDataSourcesFull';
          apiHandler(req, res);
        })
        .catch(err => {
          console.log('\n\nthere was an error:\n');
          console.log(err);
        });
    } else {
      req.app.dbo.collection("dataSources").findOneAndUpdate({
          _id: mongodb.ObjectId(req.body._id)
        }, {
          $set: {
            name: req.body.name,
            connectionString: req.body.connectionString,
          }
        }, {
          upsert: true,
        })
        .then(() => {
          req.params = {};
          req.params.handle = 'getDataSourcesFull';
          apiHandler(req, res);
        })
        .catch(err => {
          console.log('\n\nthere was an error:\n');
          console.log(err);
        });
    }
  };

  return module;
};
