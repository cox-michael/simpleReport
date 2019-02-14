const mongodb = require('mongodb');
const apiHandler = require('./../apiHandler.js')();
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 3;

  module.fn = (req, res) => {
    req.app.dbo.collection("dataSources").deleteOne(
      { _id: mongodb.ObjectId(req.body._id) }
    )
      .then(() => {
        req.params = {};
        req.params.handle = 'getDataSourcesFull';
        apiHandler(req, res);
      })
      .catch(err => {
        console.log('\n\nthere was an error:\n');
        console.log(err);
        apiResponse(data={}, success=false, messages=[err]);
      });
  };

  return module;
};
