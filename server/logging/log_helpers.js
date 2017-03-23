'use strict'
var Log = require('../model/logs');
var User = require('../model/users');
var Item = require('../model/items');
var LogDescriptions = require('./log_descriptions');

var getFilteredChanges = function(oldObject, changes) {
  var filteredKeys = Object.keys(changes)
    .filter(function(key) {
      // stringify values so that you can do equality with things like arrays
      return String(oldObject[key]) != String(changes[key]);
    })
  var filteredChanges = {};
  filteredKeys.forEach(key => filteredChanges[key] = changes[key]);
  if (Object.keys(filteredChanges).length === 0) {
    return null;
  }
  return filteredChanges;
}


module.exports.filterLoanChanges = function(oldLoan, changes) {
  changes = changes.filter(function(itemObj) {
    var oldItem = oldLoan.items.find(function(item) {
      return String(item.item._id) === itemObj.item;
    });
    if (!oldItem) return false;
    return oldItem.status !== itemObj.status;
  });
  if (changes.length === 0) return null;
  return changes;
}

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
  var filteredChanges = getFilteredChanges(oldItem, changes);
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

module.exports.logRequestEdit = function(oldRequest, changes, initiatingUser, next) {
  var filteredChanges = getFilteredChanges(oldRequest, changes);
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
  var filteredChanges = getFilteredChanges(field, changes);
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
