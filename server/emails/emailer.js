'use strict'
var Log = require('../model/logs');
var User = require('../model/users');
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
