'use strict'

/*
Run this script daily to send loan emails and delete old ones
*/

var mongoose = require('mongoose');
var moment = require('moment');
var User = require('../server/model/users');
var Loan = require('../server/model/loans');
var EmailSettings = require('../server/model/emailSettings');
var Emailer = require('../server/emails/emailer');

mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');

var removeOldEmails = function(settings, next) {
  var endToday = moment().endOf('day');
  settings.loan_emails = settings.loan_emails.filter(function(loanObj) {
    return endToday.isAfter(moment(loanObj.date));
  });
  settings.save(function(error) {
    if (error) return next(error);
    next();
  });
}

Emailer.checkForLoanEmailAndSendAll(function(error) {
  if (error) {
    console.log(error);
    process.exit();
  } else {
    removeOldEmails(function(error) {
      if (error) {
        console.log(error);
      }
      process.exit();
    });
  }
});
