'use strict';

let nodemailer = require('nodemailer');

function EmailBuilder() {
  this.message = {};
  this.transport = nodemailer.createTransport(
    {
      service: 'Gmail',
      auth: {
          user: 'nullstrings458',
          pass:  'ece458duke'
      },
    },
    {from: 'ECE Inventory <nullstrings458@gmail.com>'}
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

EmailBuilder.prototype.send = function(next) {
  var error = validateMessage(this.message);
  if (error) {
    return next(error);
  }
  this.transport.sendMail(this.message, (error, info) => {
    transport.close();
    next(error, info.response);
  });
}

module.exports = EmailBuilder;
