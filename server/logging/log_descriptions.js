'use strict'
var Log = require('../model/logs');

module.exports.newItem = function(item) {
  return 'A new item called ' + item.name + ' was created.';
}

module.exports.deletedItem = function(item) {
  return 'The item ' + item.name + ' was deleted from the inventory.';
}

module.exports.editedItem = function(oldItem, changes, user) {
  var description = 'The item ' + oldItem.name + ' was edited by changing';
  Object.keys(changes).forEach(function(key, index, keyArray) {
    if (index !== 0 && keyArray.length !== 2) {
      description += ',';
    }
    if (index === keyArray.length -1) {
      description += ' and';
    }
    description += ' ' + key + ' from ' + oldItem[key] + ' to ' + changes[key];
  });
  description += '.';
  return description;
}
