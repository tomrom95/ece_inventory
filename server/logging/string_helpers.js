'use strict'

module.exports.getFilteredChanges = function(oldObject, changes) {
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

module.exports.getDisplayName = function(user) {
  if (user.first_name && user.last_name) {
    return user.first_name + ' ' + user.last_name;
  } else if (user.netid) {
    return user.netid;
  } else {
    return user.username;
  }
}

module.exports.createRequestItemString = function(requestItemMap, items) {
  var itemString = "";
  items.forEach(function(item, index) {
    if (index !== 0 && items.length !== 2) {
      itemString += ','
    }
    if (index === items.length - 1 && index !== 0) {
      itemString += ' and';
    }
    var quantity = requestItemMap[item._id];
    var plural = quantity === 1 ? '' : 's';
    itemString += ' (' + quantity + ') ' + item.name + plural;
  });
  return itemString;
}

module.exports.createPopulatedRequestItemString = function(request) {
  var requestItemMap = {};
  request.items.forEach(function(item) {
    requestItemMap[item.item._id] = item.quantity;
  });
  var itemNames = request.items.map(obj => obj.item);
  return module.exports.createRequestItemString(requestItemMap, itemNames);
}
