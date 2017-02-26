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

function createRequestItemString(requestItemMap, items) {
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

module.exports.requestCreated = function(request, createdByUser, createdForUser) {
  var description = 'The user ' + getDisplayName((createdByUser) ? createdByUser : createdForUser) + ' requested';
  var requestItemMap = {};
  request.items.forEach(function(item) {
    requestItemMap[item.item._id] = item.quantity;
  });
  var itemNames = request.items.map(obj => obj.item);
  description += createRequestItemString(requestItemMap, itemNames);
  if (createdByUser) {
    description += ' for the user ' + getDisplayName(createdForUser) + '.';
  } else {
    description += '.';
  }
  return description;
}

module.exports.deletedRequest = function(request, initiatingUser, requestUser) {
  var description = 'The user ' + getDisplayName(initiatingUser) + ' cancelled ';
  if (initiatingUser._id.equals(requestUser._id)) {
    description += 'his/her own request.';
  } else {
    description += getDisplayName(requestUser) + '\'s request.';
  }
  return description;
}

module.exports.disbursedItem = function(request, items, disbursedFrom, disbursedTo) {
  var description = 'The user ' + getDisplayName(disbursedFrom) + ' disbursed';
  var requestItemMap = {};
  request.items.forEach(function(item) {
    requestItemMap[item.item] = item.quantity;
  });
  description += createRequestItemString(requestItemMap, items);
  description += ' to the user ' + getDisplayName(disbursedTo) + '.';
  return description;
}

var getValueString = function(value) {
  if (value === null || value === undefined) {
    return 'undefined';
  }
  return JSON.stringify(value);
}

var processQuantityChange = function(changeEnum){
  var snippet = " due to ";
  switch(changeEnum){
    case "MANUAL":
      snippet += "manual override";
      break;
    case "LOSS":
      snippet += "loss of item";
      break;
    case "ACQUISITION":
      snippet += "acquisition of item";
      break;
    case "DESTRUCTION":
      snippet += "destruction of item";
      break;
    default:
      snippet += "undefined reason";
      break;
  }
  return snippet;
}

var createChangesString = function(oldObject, changes) {
  var changesString = "";
  let quantity_reason = changes.quantity_reason;
  delete changes.quantity_reason;
  Object.keys(changes).forEach(function(key, index, keyArray) {
    if (index !== 0 && keyArray.length !== 2) {
      changesString += ',';
    }
    if (index === keyArray.length -1 && index !== 0) {
      changesString += ' and';
    }
    changesString += ' ' + key + ' from ' + getValueString(oldObject[key])
      + ' to ' + getValueString(changes[key]);
    if(key == "quantity") changesString += processQuantityChange(quantity_reason);
  });
  return changesString;
}

module.exports.editedRequest = function(oldRequest, changes, initiatingUser, affectedUser) {
  var description = 'The user ' + getDisplayName(initiatingUser) + ' edited ';
  if (initiatingUser._id.equals(affectedUser._id)) {
    description += 'his/her own request by changing';
  } else {
    description += getDisplayName(affectedUser) + '\'s request by changing';
  }
  description += createChangesString(oldRequest, changes);
  description += '.';
  return description;
}

module.exports.editedItem = function(oldItem, changes, user) {
  var description = 'The item ' + oldItem.name + ' was edited by changing';
  description += createChangesString(oldItem, changes);
  description += '.';
  return description;
}

module.exports.editedItemCustomField = function(item, field, oldValue, newValue) {
  return 'The item ' + item.name + ' was edited by changing the custom field '
    + field.name + ' from ' + oldValue + ' to ' + newValue + '.';
}

module.exports.fieldCreated = function(field) {
  return 'A new field called ' + field.name + ' was created.';
}

module.exports.fieldEdited = function(field, changes) {
  var description = 'The field ' + field.name + ' was edited by changing';
  description += createChangesString(field, changes) + '.';
  return description;
}

module.exports.fieldDeleted = function(field) {
  return 'The field ' + field.name + ' was deleted.';
}
