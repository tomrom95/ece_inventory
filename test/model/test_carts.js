process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var Cart = require('../../server/model/carts.js');
var assert = require('chai').assert

describe('Carts', function() {
  it('should throw error for incomplete object', function(done) {
    var cart = new Cart({
      items:[
        {
          item: '900000000000000000000000',
          quantity: 100
        }
      ],
      description: "Hello"
      });
    cart.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should throw error for invalid quantity', function(done) {
    var cart = new Cart({
      user: '900000000000000000000000',
      items:[
        {
          item: '900000000000000000000000',
          quantity: -100
        }
      ],
      description: "Hello"
      });
    cart.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should validate a valid object', function(done) {
    var cart = new Cart({
      user: '900000000000000000000000',
      items:[
        {
          item: '900000000000000000000000',
          quantity: 100
        }
      ],
      description: "Hello"
      });
    cart.validate(function (err) {
      assert.isNull(err, 'Valid object');
      done();
    });
  });
  it('should validate a valid object with dates specified', function(done) {
    var cart = new Cart({
      user: '900000000000000000000000',
      items:[
        {
          item: '900000000000000000000000',
          quantity: 100
        }
      ],
      description: "Hello",
      created: "02/14/2017",
      lastModified: "02/14/2017"
      });
    cart.validate(function (err) {
      console.log(err);
      assert.isNull(err, 'Valid object');
      done();
    });
  });
});
