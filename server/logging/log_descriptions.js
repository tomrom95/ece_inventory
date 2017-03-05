'use strict'
var Log = require('../model/logs');
var StringHelpers = require('./string_helpers');

module.exports.newItem = function(item) {
  return 'A new item called ' + item.name + ' was created.';
}

module.exports.deletedItem = function(item) {
  return 'The item ' + item.name + ' was deleted from the inventory.';
}

module.exports.requestCreated = function(request, createdByUser, createdForUser) {
  var description = 'The user ' + StringHelpers.getDisplayName((createdByUser) ? createdByUser : createdForUser) + ' requested';
  description += StringHelpers.createPopulatedRequestItemString(request);
  if (createdByUser) {
    description += ' for the user ' + StringHelpers.getDisplayName(createdForUser) + '.';
  } else {
    description += '.';
  }
  return description;
}

module.exports.deletedRequest = function(request, initiatingUser, requestUser) {
  var description = 'The user ' + StringHelpers.getDisplayName(initiatingUser) + ' cancelled ';
  if (initiatingUser._id.equals(requestUser._id)) {
    description += 'his/her own request.';
  } else {
    description += StringHelpers.getDisplayName(requestUser) + '\'s request.';
  }
  return description;
}

module.exports.disbursedItem = function(request, items, disbursedFrom, disbursedTo) {
  var description = 'The user ' + StringHelpers.getDisplayName(disbursedFrom) + ' disbursed';
  var requestItemMap = {};
  request.items.forEach(function(item) {
    requestItemMap[item.item] = item.quantity;
  });
  description += StringHelpers.createRequestItemString(requestItemMap, items);
  description += ' to the user ' + StringHelpers.getDisplayName(disbursedTo) + '.';
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
    if(key === "quantity") changesString += processQuantityChange(quantity_reason);
  });
  return changesString;
}

module.exports.editedRequest = function(oldRequest, changes, initiatingUser, affectedUser) {
  var description = 'The user ' + StringHelpers.getDisplayName(initiatingUser) + ' edited ';
  if (initiatingUser._id.equals(affectedUser._id)) {
    description += 'his/her own request by changing';
  } else {
    description += StringHelpers.getDisplayName(affectedUser) + '\'s request by changing';
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
