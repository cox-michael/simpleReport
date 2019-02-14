const assert = require('assert');
const mongodb = require('mongodb');
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 1;

  module.fn = (req, res) => {
    req.app.dbo.collection("users").findOneAndUpdate({
        _id: mongodb.ObjectId(req.session.userid)
      }, {
        $push: {
          notifications: mongodb.ObjectId(req.body.reportId)
        }
      }, {
        upsert: 1
      },
      function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.ok);
        console.log('Inserted 1 notification into users');
        // console.log(result);
        res.json(apiResponse());
      });
  };

  return module;
};
