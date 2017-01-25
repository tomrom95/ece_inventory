var mongoose = require('mongoose');
var Log = require('../model/logs.js');
var Item = require('../model/items.js');
var assert = require('chai').assert

describe('Instance', function() {
  it('should throw error for invalid object', function(done) {
    var log = new Log({
      created_by: '1234',
      type: 'ACQUISITION',
      quantity: 2
    });
    log.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should validate a valid object', function(done) {
    var log = new Log({
      created_by: '1234',
      item: '53cb6b9b4f4ddef1ad47f943',
      type: 'ACQUISITION',
      quantity: 2
    });
    log.validate(function (err) {
      assert.isNull(err, 'Valid object');
      done();
    });
  });
});
