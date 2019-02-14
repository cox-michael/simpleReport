const assert = require('assert');
const mongodb = require('mongodb');
const apiResponse = require('./../apiResponse.js')();

module.exports = function() {
  const module = {};
  module.permissionLevel = 1;

  module.fn = (req, res) => {
    var update;

    if (req.body.direction == 'up') {
      update = {
        $pull: {
          downvotes: mongodb.ObjectId(req.session.userid)
        },
        $addToSet: {
          upvotes: mongodb.ObjectId(req.session.userid)
        },
      };
    } else if (req.body.direction == 'down') {
      update = {
        $pull: {
          upvotes: mongodb.ObjectId(req.session.userid)
        },
        $addToSet: {
          downvotes: mongodb.ObjectId(req.session.userid)
        },
      };
    } else {
      update = {
        $pull: {
          upvotes: mongodb.ObjectId(req.session.userid),
          downvotes: mongodb.ObjectId(req.session.userid)
        },
      };
    }

    req.app.dbo.collection("requests").findOneAndUpdate({
        _id: mongodb.ObjectId(req.body.request_id)
      },
      update, {
        upsert: 1
      },
      function(err, result) {
        assert.equal(err, null);
        assert.equal(1, result.ok);
        console.log(req.body.direction + ' vote (request)');
        // console.log(result);
        res.json(apiResponse());
      });
  };

  return module;
};
