'use strict'
var Log = require('../model/logs');
var User = require('../model/users');
var LogDescriptions = require('./log_descriptions');

module.exports.logNewItem = function(item, user, next) {
  var newLog = new Log({
    initiating_user: user._id,
    items: [item._id],
    type: 'ITEM_CREATED',
    description: LogDescriptions.newItem(item)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}

module.exports.logDeletion = function(item, user, next) {
  var newLog = new Log({
    initiating_user: user._id,
    items: [item._id],
    type: 'ITEM_DELETED',
    description: LogDescriptions.deletedItem(item)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}

module.exports.logDisbursement = function(request, items, disbursedFrom, next) {
  User.findById(request.user, function(error, disbursedTo) {
    if (error) return next(error);
    var itemIds = request.items.map(i => i.item);
    var newLog = new Log({
      initiating_user: disbursedFrom._id,
      affected_user: request.user,
      items: itemIds,
      request: request._id,
      type: 'REQUEST_DISBURSED',
      description: LogDescriptions.disbursedItem(request, items, disbursedFrom, disbursedTo)
    });
    newLog.save(function(error) {
      if (error) return next(error);
      next();
    });
  });
}

module.exports.logRequestApprovedOrDenied = function(request, initiatingUser, status, next) {
  User.findById(request.user, function(error, initiatingUser) {
    if (error) return next(error);
    var logType = (status === 'APPROVED') ? 'REQUEST_APPROVED' : 'REQUEST_DENIED';
    var itemIds = request.items.map(i => i.item);
    var newLog = new Log({
      initiating_user: initiatingUser._id,
      affected_user: request.user,
      items: itemIds,
      request: request._id,
      type: logType,
      description: LogDescriptions.requestApprovedOrDenied(request, status, initiatingUser, request.user)
    });
    newLog.save(function(error) {
      if (error) return next(error);
      next();
    });
  })
}

var logRequestCreationHelper = function(request, createdByUser, createdForUser, next) {
  var itemIds = request.items.map(i => i.item._id);
  var newLog = new Log({
    initiating_user: (createdByUser) ? createdByUser._id : createdForUser._id,
    affected_user: (createdByUser) ? createdForUser._id : null, // only include if admin made request for someone else
    items: itemIds,
    request: request._id,
    type: 'REQUEST_CREATED',
    description: LogDescriptions.requestCreated(request, createdByUser, createdForUser)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}

module.exports.logRequestCreation = function(request, createdBy, createdFor, next) {
  User.findById(createdFor, function(error, createdForUser) {
    if (error) return next(error);
    if (String(createdBy) !== String(createdFor)) {
      User.findById(createdBy, function(error, createdByUser) {
        if (error) return next(error);
        return logRequestCreationHelper(request, createdByUser, createdForUser, next);
      });
    } else {
      return logRequestCreationHelper(request, null, createdForUser, next);
    }
  });
}

module.exports.logEditing = function(oldItem, changes, user, next) {
  // First filter changes to remove fields that haven't actually changed
  var filteredKeys = Object.keys(changes)
    .filter(function(key) {
      // stringify values so that you can do equality with things like arrays
      return JSON.stringify(oldItem[key]) != JSON.stringify(changes[key]);
    })
  var filteredChanges = {};
  filteredKeys.forEach(key => filteredChanges[key] = changes[key]);

  // If nothing actually changed, don't log
  if (Object.keys(filteredChanges).length === 0) {
    return next();
  }
  var newLog = new Log({
    initiating_user: user._id,
    items: [oldItem._id],
    type: 'ITEM_EDITED',
    description: LogDescriptions.editedItem(oldItem, filteredChanges, user)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}

module.exports.logItemCustomFieldEdit = function(item, field, oldValue, newValue, user, next) {
  if (oldValue === newValue) {
    return next();
  }
  var newLog = new Log({
    initiating_user: user._id,
    items: [item._id],
    type: 'ITEM_EDITED',
    description: LogDescriptions.editedItemCustomField(item, field, oldValue, newValue)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}
