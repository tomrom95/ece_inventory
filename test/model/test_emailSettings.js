process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var EmailSettings = require('../../server/model/emailSettings.js');
var chai = require('chai');
let assert = chai.assert;
let should = chai.should();

mongoose.connect('mongodb://localhost/test');

describe('Email Settings', function() {
  beforeEach((done) => {
    EmailSettings.remove({}, (err) => {
      done();
    });
  });

  it('should validate a valid email', function(done) {
    var settings = new EmailSettings({
      subject_tag: 'tag',
      loan_emails: [{
        date: new Date('2017-02-27'),
        body: "body"
      }]
    });
    settings.validate(function (err) {
      assert.isNull(err, 'Valid Object');
      done();
    });
  });

  it('should return a blank settings document if none exists', function(done) {
    EmailSettings.getSingleton(function(error, settings) {
      should.not.exist(error);
      settings.subject_tag.should.be.eql("");
      settings.loan_emails.length.should.be.eql(0);
      done();
    });
  });

  it('if email settings exist, it should return it', function(done) {
    var newSettings = new EmailSettings({
      subject_tag: 'tag',
      loan_emails: [{
        date: new Date('2017-02-27'),
        body: "body"
      }]
    });
    newSettings.save(function(error, settings) {
      should.not.exist(error);
      EmailSettings.getSingleton(function(error, settings) {
        should.not.exist(error);
        settings.subject_tag.should.be.eql('tag');
        settings.loan_emails.length.should.be.eql(1);
        done();
      });
    });
  });

  it('stops a new settings document from being created', function(done) {
    var newSettings = new EmailSettings({});
    newSettings.save(function(error, settings) {
      should.not.exist(error);
      var moreSettings = new EmailSettings({});
      moreSettings.save(function(error, moreSettings) {
        should.exist(error);
        should.not.exist(moreSettings);
        done();
      });
    });
  })
});
