const apiResponse = require('./../apiResponse.js')();
const assert = require('assert');

module.exports = function() {
  const module = {};
  module.permissionLevel = 2;

  module.fn = (req, res) => {
    req.app.dbo.collection('definitions').insertOne(
      req.body.report,
      function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.result.n);
        assert.equal(1, result.ops.length);
        console.log('Inserted 1 document into definitions');
        // console.log(result.insertedId)
        // console.log(result);
        res.json(apiResponse(result));
      });
  };

  return module;
};
