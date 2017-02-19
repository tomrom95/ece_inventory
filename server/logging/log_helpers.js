'use strict'
var Log = require('../model/logs');
var LogDescriptions = require('./log_descriptions');

module.exports.logNewItem = function(item, user, next) {
  var newLog = new Log({
    initiating_user: user._id,
    items: [item._id],
    type: 'NEW',
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
    type: 'DELETED',
    description: LogDescriptions.deletedItem(item)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
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
    next();
  }
  var newLog = new Log({
    initiating_user: user._id,
    items: [oldItem._id],
    type: 'EDIT',
    description: LogDescriptions.editedItem(oldItem, filteredChanges, user)
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}
