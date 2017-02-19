'use strict'
var Log = require('../model/logs');

module.exports.newItem = function(item) {
  return 'A new item called ' + item.name + ' was created.';
}

module.exports.deletedItem = function(item) {
  return 'The item ' + item.name + ' was deleted from the inventory.';
}

var getDisplayName = function(user) {
  if (user.first_name && user.last_name) {
    return user.first_name + ' ' + user.last_name;
  } else if (user.netid) {
    return user.netid;
  } else {
    return user.username;
  }
}

module.exports.disbursedItem = function(request, items, disbursedFrom, disbursedTo) {
  var description = 'The user ' + getDisplayName(disbursedFrom) + ' disbursed';
  var requestItemMap = {};
  request.items.forEach(function(item) {
    requestItemMap[item.item] = item.quantity;
  });
  items.forEach(function(item, index) {
    if (index !== 0 && items.length !== 2) {
      description += ','
    }
    if (index === items.length - 1) {
      description += ' and';
    }
    var quantity = requestItemMap[item._id];
    var plural = quantity === 1 ? '' : 's';
    description += ' ' + quantity + ' ' + item.name + plural;
  });
  description += ' to the user ' + getDisplayName(disbursedTo) + '.';
  return description;
}
