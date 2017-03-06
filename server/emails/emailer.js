'use strict'
var Log = require('../model/logs');
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
