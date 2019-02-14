const assert = require('assert');
const mongodb = require('mongodb');
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 1;

  module.fn = (req, res) => {
    const request = {
      description: req.body.description,
      upvotes: [],
      downvotes: [],
      author: mongodb.ObjectId(req.session.userid),
      completed: false,
    };
    req.app.dbo.collection("requests").insertOne(
      request,
      function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log('Inserted 1 document into requests');
        // console.log(result.insertedId)
        // console.log(result);
        res.json(apiResponse(result));
      });
  };

  return module;
};
