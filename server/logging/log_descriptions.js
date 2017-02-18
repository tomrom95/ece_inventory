'use strict'
var Log = require('../model/logs');

module.exports.newItem = function(item) {
  return 'A new item called ' + item.name + ' was created.';
}

module.exports.deletedItem = function(item) {
  return 'The item ' + item.name + ' was deleted from the inventory.';
}
