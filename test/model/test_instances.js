process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var Instance = require('../../server/model/instances.js');
var assert = require('chai').assert

describe('Instance', function() {
  it('should throw error for invalid object', function(done) {
    var instance = new Instance({
      item: '1234'
    });
    instance.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should validate a valid object', function(done) {
    var instance = new Instance({
      item: '53cb6b9b4f4ddef1ad47f943',
      custom_fields: [{
        field: '53cb6b9b4f4ddef1ad47f943',
        value: '3'
      }]
    });
    instance.validate(function (err) {
      assert.isNull(err, 'Valid object');
      done();
    });
  });
});
