process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var Loan = require('../../server/model/loans.js');
var assert = require('chai').assert

describe('Loans', function() {
  it('should throw error for invalid object', function(done) {
    var loan = new Loan({
      user: '1234',
      items: [],
      request: '123'
    });
    loan.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should throw error for missing user', function(done) {
    var loanJSON = {
      items: [
        {
          item: '53cb6b9b4f4ddef1ad47f943', // fake valid item id
          quantity: 100,
          status: "LENT"
        }
      ],
      request: "53cb6b9b4f4ddef1ad47f943"
    };
    var loan = new Loan(loanJSON);
    loan.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should throw error for missing item id', function(done) {
    var loanJSON = {
      items: [
        {
          quantity: 100,
          status: "LENT"
        }
      ],
      request: "53cb6b9b4f4ddef1ad47f943",
      user: '53cb6b9b4f4ddef1ad47f943'
    };
    var loan = new Loan(loanJSON);
    loan.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should throw error for missing request id', function(done) {
    var loanJSON = {
      items: [
        {
          item: '53cb6b9b4f4ddef1ad47f943', // fake valid item id
          quantity: 100,
          status: "LENT"
        }
      ],
      user: '53cb6b9b4f4ddef1ad47f943'
    };
    var loan = new Loan(loanJSON);
    loan.validate(function (err) {
      assert.isNotNull(err, 'Invalid object');
      done();
    });
  });
  it('should validate a valid object', function(done) {
    var loanJSON = {
      items: [
        {
          item: '53cb6b9b4f4ddef1ad47f943', // fake valid item id
          quantity: 100,
          status: "LENT"
        }
      ],
      user: '53cb6b9b4f4ddef1ad47f943',
      request: "53cb6b9b4f4ddef1ad47f943"
    };
    var loan = new Loan(loanJSON);
    loan.validate(function (err) {
      assert.isNull(err, 'Valid object');
      done();
    });
  });
});
