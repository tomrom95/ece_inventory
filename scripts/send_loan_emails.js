'use strict'

var mongoose = require('mongoose');
var moment = require('moment');
var User = require('../server/model/users');
var Loan = require('../server/model/loans');
var EmailSettings = require('../server/model/emailSettings');
var Emailer = require('../server/emails/emailer');

mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');

var removeOldEmails = function(settings) {
  var endToday = moment().endOf('day');
  settings.loan_emails = settings.loan_emails.filter(function(loanObj) {
    return endToday.isAfter(moment(loanObj.date));
  });
  settings.save(function(error) {
    if (error) console.log(error);
    process.exit();
  })
}

EmailSettings.getSingleton(function(error, settings) {
  if (error) {
    console.log(error);
    process.exit();
  }
  var today = new Date();
  var loanEmailObj = settings.loan_emails.find((loanObj) => {
    return loanObj.date.toDateString() === today.toDateString()
  });
  if (loanEmailObj) {
     Loan.find({'items.status': 'LENT'}, function(error, loans) {
       if (error) {
         console.log(error);
         process.exit();
       }
       var emailPromises = [];
       var userLoanMap = {};
       loans.forEach(function(loan) {
         if (userLoanMap[loan.user]) {
           userLoanMap[loan.user].push(loan);
         } else {
           userLoanMap[loan.user] = [loan];
         }
       });
       Object.keys(userLoanMap).forEach(function(user) {
         emailPromises.push(new Promise((resolve, reject) => {
           Emailer.sendLoanReminderEmail(user, userLoanMap[user], loanEmailObj, function(error) {
             if (error) {
               reject(error);
             } else {
               resolve();
             }
           });
         }));
       });

       Promise.all(emailPromises).then(function(obj) {
         console.log('all emails sent');
         removeOldEmails();
         process.exit();
       }).catch(function(reason) {
         console.log(reason);
         process.exit();
       });
     });
  }
  removeOldEmails();
});
