'use strict';

let nodemailer = require('nodemailer');
var User = require('../model/users');
let EmailSettings = require('../model/emailSettings');
var QueryBuilder = require('../queries/querybuilder');

function EmailBuilder() {
  this.message = {};
  this.transport = nodemailer.createTransport(
    {
      service: 'Gmail',
      auth: {
          user: 'USERNAME',
          pass:  'PASSWORD'
      },
    },
    {from: 'ECE Inventory'}
  );
}

EmailBuilder.prototype.setToEmails = function(emailArray) {
  this.message.to = emailArray.join();
  return this;
}

EmailBuilder.prototype.setCCEmails = function(emailArray) {
  this.message.cc = emailArray.join();
  return this;
}

EmailBuilder.prototype.setBCCEmails = function(emailArray) {
  this.message.bcc = emailArray.join();
  return this;
}

EmailBuilder.prototype.setToEmails = function(emailArray) {
  this.message.to = emailArray.join();
  return this;
}

EmailBuilder.prototype.setSubject = function(subjectString) {
  this.message.subject = subjectString;
  return this;
}

EmailBuilder.prototype.setBody = function(bodyString) {
  this.message.text = bodyString;
  return this;
}

var validateMessage = function(message) {
  if (!message.to && !message.cc && !message.bcc) {
    return 'Need to specify someone to send to';
  }
  if (!message.text) {
    return 'Need to specify body';
  }
  return null;
}

var getManagerEmails = function(next) {
  var query = new QueryBuilder();
  query
    .searchNotEqual('role', 'STANDARD')
    .searchBoolean('subscribed', true);
  User.find(query.toJSON(), function(error, managers) {
    if (error) return next(error);
    return next(null, managers.map(m => m.email));
  });
}

var sendHelper = function(next) {
  var error = validateMessage(this.message);
  if (error) {
    return next(error);
  }
  this.transport.sendMail(this.message, (error, info) => {
    try {
      // If transport is not mocked, close it
      this.transport.close();
    } catch (e) {
      // don't do anything
    }
    if (error) return next(error);
    return next(null, info.response);
  });
}

EmailBuilder.prototype.send = function(next, ccManagers=true) {
  EmailSettings.getSingleton((error, settings) => {
    if (error) return next(error);
    // Add global message subject tag
    this.message.subject = settings.subject_tag + ' ' + this.message.subject;
    if (ccManagers) {
      getManagerEmails((error, managerEmails) => {
        if (error) return next(error);
        // the case where emails should be sent to managers, but none are subscribed
        if (managerEmails.length === 0 && !this.message.to && !this.message.cc && !this.message.bcc) {
          // just do nothing, don't throw error
          return next();
        }
        // add all subscribed managers in bcc
        if (this.message.bcc) {
          this.message.bcc += ',' + managerEmails.join();
        } else {
          this.message.bcc = managerEmails.join();
        }
        return sendHelper.call(this, next);
      });
    } else {
      return sendHelper.call(this, next);
    }
  });
}

module.exports = EmailBuilder;
