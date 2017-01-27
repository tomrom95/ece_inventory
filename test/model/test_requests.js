process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var Request = require('../../server/model/requests.js');
var Item = require('../../server/model/items.js');
var assert = require('chai').assert

describe('Requests', function() {
  it('should throw error for invalid object', function(done) {
    var request = new Request({
      user_id: '1234',
      reason: 'dunno',
      quantity: 2
    });
    request.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should validate a valid object', function(done) {
    var requestJSON = {
      item_id: '53cb6b9b4f4ddef1ad47f943', // fake valid item id
      user_id: '53cb6b9b4f4ddef1ad47f943',
      reason: 'dunno',
      quantity: 2
    };
    var request = new Request(requestJSON);
    request.validate(function (err) {
      assert.isNull(err, 'Valid object');
      done();
    });
  });
});
