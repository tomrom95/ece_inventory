'use strict'
var Log = require('../model/logs');
var User = require('../model/users');
var EmailSettings = require('../model/emailSettings');
var Loan = require('../model/loans');
var Item = require('../model/items');
var StringHelpers = require('../logging/string_helpers');
var EmailBuilder = require('./emailbuilder');
var EmailBodies = require('./email_bodies');

module.exports.sendNewRequestEmail = function(request, createdBy, createdFor, next) {
  var builder = new EmailBuilder();
  if (!createdBy._id.equals(createdFor._id)) {
    builder = builder.setCCEmails([createdBy.email]);
  }
  builder
    .setToEmails([createdFor.email])
    .setSubject('New Inventory Request Created')
    .setBody(EmailBodies.requestCreated(request, createdBy, createdFor))
    .send(function(error, info) {
      if (error) return next(error);
      return next(null, info);
    });
}

module.exports.sendFulfillEmail = function(request, items, disbursedFrom, next) {
  var builder = new EmailBuilder();
  User.findById(request.user, function(error, affectedUser) {
    if (error) return next(error);
    builder
      .setToEmails([affectedUser.email])
      .setCCEmails([disbursedFrom.email])
      .setSubject('Inventory Request Fulfilled')
      .setBody(EmailBodies.requestFulfilled(request, items, disbursedFrom, affectedUser))
      .send(function(error, info) {
        if (error) return next(error);
        return next(null, info);
      });
  });
}

module.exports.sendRequestChangeEmail = function(oldRequest, changes, initiator, next) {
  var filteredChanges = StringHelpers.getFilteredChanges(oldRequest, changes);
  if (!filteredChanges) return next();

  var builder = new EmailBuilder();
  User.findById(oldRequest.user, function(error, affectedUser) {
    if (error) return next(error);
    builder
      .setToEmails([affectedUser.email])
      .setCCEmails([initiator.email])
      .setSubject('Inventory Request Updated')
      .setBody(EmailBodies.requestChanged(oldRequest, filteredChanges, initiator, affectedUser))
      .send(function(error, info) {
        if (error) return next(error);
        return next(null, info);
      });
  });
}

module.exports.sendLoanChangeEmail = function(oldLoan, changes, initiator, next) {
  var filteredChanges = StringHelpers.filterLoanChanges(oldLoan, changes);
  if (!filteredChanges) return next();
  var builder = new EmailBuilder();
  User.findById(oldLoan.user, function(error, affectedUser) {
    if (error) return next(error);
    builder
      .setToEmails([affectedUser.email])
      .setCCEmails([initiator.email])
      .setSubject('Inventory Loan Updated')
      .setBody(EmailBodies.loanChanged(oldLoan, filteredChanges, initiator, affectedUser))
      .send(function(error, info) {
        if (error) return next(error);
        return next(null, info);
      });
  });
}

module.exports.sendCancelledRequestEmail = function(request, initiatingUser, next) {
  var builder = new EmailBuilder();
  User.findById(request.user, function(error, requestUser) {
    if (error) return next(error);
    if (!requestUser._id.equals(initiatingUser._id)) {
      builder = builder.setCCEmails([initiatingUser.email]);
    }
    builder
      .setToEmails([requestUser.email])
      .setSubject('Inventory Request Cancelled')
      .setBody(EmailBodies.requestCancelled(request, initiatingUser, requestUser))
      .send(function(error, info) {
        if (error) return next(error);
        return next(null, info);
      });
  });
}

var sendSingleLoanEmail = function(userId, loans, loanEmailObj, next) {
  var builder = new EmailBuilder();
  User.findById(userId, function(error, loanUser) {
    if (error) return next(error);
    if (!loanUser) return next();
    builder
      .setToEmails([loanUser.email])
      .setSubject('ECE Inventory Loans Reminder')
      .setBody(EmailBodies.loanReminder(loanUser, loans, loanEmailObj.body))
      .send(function(error, info) {
        if (error) return next(error);
        return next(null, info);
      });
  });
}

var sendAllLoanEmails = function(loanEmailObj, next) {
  // Find all loans that have lent items
  Loan.find({'items.status': 'LENT'})
      .populate('items.item', 'name')
      .exec(function(error, loans) {
        if (error) {
          next(error);
        }
        var emailPromises = [];
        var userLoanMap = {};
        // create map of users to the loans they owe
        loans.forEach(function(loan) {
          if (userLoanMap[loan.user]) {
            userLoanMap[loan.user].push(loan);
          } else {
            userLoanMap[loan.user] = [loan];
          }
        });
        // for each user, send them an email with their loan items
        Object.keys(userLoanMap).forEach(function(user) {
          emailPromises.push(new Promise((resolve, reject) => {
            sendSingleLoanEmail(user, userLoanMap[user], loanEmailObj, function(error) {
              if (error) {
                reject(error);
              } else {
                resolve();
              }
            });
          }));
        });

        Promise.all(emailPromises).then(function() {
          next();
        }, function(error) {
          next(error);
        });
      });
}

module.exports.checkForLoanEmailAndSendAll = function(next) {
  EmailSettings.getSingleton(function(error, settings) {
    if (error) return next(error);
    // check if there's a loan email to send today
    var today = new Date();
    var loanEmailObj = settings.loan_emails.find((loanObj) => {
      return loanObj.date.getUTCDate() === today.getUTCDate()
        && loanObj.date.getUTCMonth() === today.getUTCMonth()
        && loanObj.date.getUTCFullYear() === today.getUTCFullYear();
    });

    if (loanEmailObj) {
      sendAllLoanEmails(loanEmailObj, function(error) {
       if (error) return next(error);
       next();
      });
    } else {
      return next();
    }
  });
}

module.exports.sendBackupFailureEmail = function(backupError, stderr, next) {
  User.findOne({username: 'admin'}, function(error, adminUser) {
    if (error) return next(error);
    var builder = new EmailBuilder();
    builder
      .setToEmails([adminUser.email])
      .setSubject('ECE Inventory Database Backup Failed')
      .setBody(EmailBodies.backupFailure(adminUser, backupError, stderr))
      .send(function(error, info) {
        if (error) return next(error);
        return next(null, info);
      }, false);
  });
}

module.exports.sendBackupSuccessEmail = function(filename, expiry, next) {
  User.findOne({username: 'admin'}, function(error, adminUser) {
    if (error) return next(error);
    var builder = new EmailBuilder();
    builder
      .setToEmails([adminUser.email])
      .setSubject('ECE Inventory Database Backup Taken Successfully')
      .setBody(EmailBodies.backupSuccess(adminUser, filename, expiry))
      .send(function(error, info) {
        if (error) return next(error);
        return next(null, info);
      }, false);
  });
}
