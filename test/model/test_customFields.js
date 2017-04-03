process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var CustomField = require('../../server/model/customFields.js');
let chai = require('chai');
let should = chai.should();

describe('CustomField', function() {
  it('should throw error for incomplete object', function(done) {
      var customField = new CustomField({
        name: "Hello"
      });
      customField.save(function(err, field){
        should.exist(err);
        err.errors.type.name.should.be.eql("ValidatorError");
        should.not.exist(field);
        done();
      })
  });
  it('should throw error for invalid type', function(done) {
      var customField = new CustomField({
        name: "Hello",
        type: "NONE",
        isPrivate: true,
        assetField: false
      });
      customField.save(function(err, field){
        should.exist(err);
        err.errors.type.name.should.be.eql("ValidatorError");
        err.errors.type.kind.should.be.eql("enum");
        should.not.exist(field);
        done();
      })
  });
  it('should successful save for valid object', function(done) {
      var customField = new CustomField({
        name: "Hello",
        type: "INT",
        isPrivate: true,
        assetField: false
      });
      customField.save(function(err, field){
        should.not.exist(err);
        should.exist(field);
        field.name.should.be.eql("Hello");
        field.type.should.be.eql("INT");
        field.isPrivate.should.be.eql(true);
        done();
      })
  });
});
