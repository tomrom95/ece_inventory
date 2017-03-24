'use strict'
var Log = require('../model/logs');
var User = require('../model/users');
var Item = require('../model/items');
var LogDescriptions = require('./log_descriptions');
var StringHelpers = require('./string_helpers');

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

var noFilteredChanges = function(changes){
  // Allows quantity_reason to be passed, while checking whether
  // original fields are changed.
  for(var change in changes){
    if(Object.keys(Item.schema.paths).includes(change)) return false;
  }
  return true;
}

module.exports.logEditing = function(oldItem, changes, user, next) {
  // First filter changes to remove fields that haven't actually changed
  var filteredChanges = StringHelpers.getFilteredChanges(oldItem, changes);
  // If nothing actually changed, don't log
  if (noFilteredChanges(filteredChanges)) {
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

module.exports.logLoanEditing = function(oldLoan, changes, user, next) {
  // First filter changes to remove fields that haven't actually changed
  var filteredChanges = StringHelpers.filterLoanChanges(oldLoan, changes);
  // If nothing actually changed, don't log
  if (!filteredChanges) {
    return next();
  }
  var itemIds = oldLoan.items.map(i => i.item);
  console.log(LogDescriptions.editedLoan(oldLoan, filteredChanges, user));
  var newLog = new Log({
    initiating_user: user._id,
    items: itemIds,
    type: 'LOAN_EDITED',
    description: LogDescriptions.editedLoan(oldLoan, filteredChanges, user)
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

module.exports.logFulfill = function(request, items, disbursedFrom, next) {
  User.findById(request.user, function(error, disbursedTo) {
    if (error) return next(error);
    var itemIds = request.items.map(i => i.item);
    var newLog = new Log({
      initiating_user: disbursedFrom._id,
      affected_user: request.user,
      items: itemIds,
      request: request._id,
      type: 'REQUEST_FULFILLED',
      description: LogDescriptions.fulfilledItem(request, items, disbursedFrom, disbursedTo)
    });

    newLog.save(function(error) {
      if (error) return next(error);
      next();
    });
  });
}

module.exports.logRequestCreation = function(request, createdBy, createdFor, next) {
  var itemIds = request.items.map(i => i.item._id);
  var newLog = new Log({
    initiating_user: createdBy._id,
    affected_user: (createdBy._id.equals(createdFor._id)) ? null : createdFor._id, // only include if admin made request for someone else
    items: itemIds,
    request: request._id,
    type: 'REQUEST_CREATED',
    description: LogDescriptions.requestCreated(request, createdBy, createdFor)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}

module.exports.logRequestEdit = function(oldRequest, changes, initiatingUser, next) {
  var filteredChanges = StringHelpers.getFilteredChanges(oldRequest, changes);
  // If nothing actually changed, don't log
  if (!filteredChanges) {
    return next();
  }

  User.findById(oldRequest.user, function(error, affectedUser) {
    if (error) return next(error);
    var itemIds = oldRequest.items.map(i => i.item);
    var newLog = new Log({
      initiating_user: initiatingUser._id,
      affected_user: affectedUser._id.equals(initiatingUser._id) ? null : affectedUser._id,
      items: itemIds,
      request: oldRequest._id,
      type: 'REQUEST_EDITED',
      description: LogDescriptions.editedRequest(oldRequest, filteredChanges, initiatingUser, affectedUser)
    });
    newLog.save(function(error) {
      if (error) return next(error);
      next();
    });
  })
}

module.exports.logCancelledRequest = function(request, initiatingUser, next) {
  var itemIds = request.items.map(i => i.item);
  User.findById(request.user, function(error, requestUser) {
    if (error) return next(error);
    var newLog = new Log({
      initiating_user: initiatingUser._id,
      affected_user: request.user.equals(initiatingUser._id) ? null : request.user,
      items: itemIds,
      type: 'REQUEST_DELETED',
      description: LogDescriptions.deletedRequest(request, initiatingUser, requestUser)
    });
    newLog.save(function(error) {
      if (error) return next(error);
      next();
    });
  });
}
module.exports.logCustomFieldCreation = function(field, initiatingUser, next) {
  var newLog = new Log({
    initiating_user: initiatingUser._id,
    custom_field: field._id,
    type: 'FIELD_CREATED',
    description: LogDescriptions.fieldCreated(field)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}

module.exports.logCustomFieldEdit = function(field, changes, initiatingUser, next) {
  var filteredChanges = StringHelpers.getFilteredChanges(field, changes);
  if (!filteredChanges) {
    return next();
  }
  var newLog = new Log({
    initiating_user: initiatingUser._id,
    custom_field: field._id,
    type: 'FIELD_EDITED',
    description: LogDescriptions.fieldEdited(field, filteredChanges)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}

module.exports.logCustomFieldDeletion = function(field, initiatingUser, next) {
  var newLog = new Log({
    initiating_user: initiatingUser._id,
    custom_field: field._id,
    type: 'FIELD_DELETED',
    description: LogDescriptions.fieldDeleted(field)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}
