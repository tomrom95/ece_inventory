'use strict'
var Log = require('../model/logs');
var User = require('../model/users');
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

module.exports.logDisbursement = function(request, items, disbursedFrom, next) {
  User.findById(request.user, function(error, disbursedTo) {
    if (error) return next(error);
    var itemIds = request.items.map(i => i.item);
    var newLog = new Log({
      initiating_user: disbursedFrom._id,
      affected_user: request.user,
      items: itemIds,
      type: 'DISBURSED',
      description: LogDescriptions.disbursedItem(request, items, disbursedFrom, disbursedTo)
    });
    newLog.save(function(error) {
      if (error) return next(error);
      next();
    });
  })
}
