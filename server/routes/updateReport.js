const assert = require('assert');
const mongodb = require('mongodb');
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 2;

  module.fn = (req, res) => {
    const id = req.body.report._id;
    delete req.body.report._id;

    req.app.dbo.collection('definitions').findOneAndUpdate({
        _id: mongodb.ObjectId(id)
      }, {
        $set: req.body.report
      }, {
        upsert: 1
      },
      function(err, result) {
        assert.equal(err, null);
        // TODO: find out if this next line is appropriate
        assert.equal(1, result.ok);
        // assert.equal(1, result.ops.length);
        console.log('Updated 1 document in definitions');
        // console.log(result);
        res.json(apiResponse());
      });
  };

  return module;
};
