'use strict'
var Log = require('../model/logs');

module.exports.logNewItem = function(item, user, next) {
  var description = 'A new item called ' + item.name + ' was created.';
  var newLog = new Log({
    initiating_user: user._id,
    items: [item._id],
    type: 'NEW',
    description: description
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}

module.exports.logDeletion = function(item, user, next) {
  var description = 'The item ' + item.name + ' was deleted from the inventory.';
  var newLog = new Log({
    initiating_user: user._id,
    items: [item._id],
    type: 'DELETED',
    description: description
  });
  newLog.save(function(error) {
    if (error) return next(error);
    next();
  });
}
