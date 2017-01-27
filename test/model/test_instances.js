process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var Instance = require('../../model/instances.js');
var assert = require('chai').assert

describe('Instance', function() {
  it('should throw error for invalid object', function(done) {
    var instance = new Instance();
    instance.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should validate a valid object', function(done) {
    var instance = new Instance({
      serial_number: '1234',
      condition: 'NEEDS_REPAIR'
    });
    instance.validate(function (err) {
      assert.isNull(err, 'Valid object');
      done();
    });
  });
});
