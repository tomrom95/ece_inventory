'use strict'

var StringHelpers = require('../logging/string_helpers');

module.exports.requestCreated = function(request, createdBy, createdFor) {
  var text = 'Hello ' + StringHelpers.getDisplayName(createdFor) + ',\n\n';
  if (createdBy._id.equals(createdFor._id)) {
    text += 'You requested the following inventory items:\n\n';
  } else {
    text += StringHelpers.getDisplayName(createdBy) + ' requested the following inventory items for you:\n\n';
  }

  text += StringHelpers.createPopulatedRequestItemString(request);
  text += '\n\nYou will be notified of any status changes for this request.';
  return text;
}

module.exports.requestFulfilled = function(request, items, initiator, createdFor) {
  var requestItemMap = {};
  request.items.forEach(function(item) {
    requestItemMap[item.item] = item.quantity;
  });

  var text = 'Hello ' + StringHelpers.getDisplayName(createdFor) + ',\n\n';
  text += 'Your request for ' + StringHelpers.createRequestItemString(requestItemMap, items);
  text += ' has been fulfilled as a ' + request.action.toLowerCase();
  text += ' to you by ' + StringHelpers.getDisplayName(initiator) + '.';
  return text;
}

module.exports.requestChanged = function(request, changes, initiator, affectedUser) {
  var text = 'Hello ' + StringHelpers.getDisplayName(affectedUser) + ',\n\n';
  text += 'Your request for' +  StringHelpers.createPopulatedRequestItemString(request);
  text += ' has been updated by ' + StringHelpers.getDisplayName(initiator);
  text += ' by changing ' + StringHelpers.createChangesString(request, changes) + '.';
  return text;
}

module.exports.requestCancelled = function(request, initiatingUser, requestUser) {
  var text = 'Hello ' + StringHelpers.getDisplayName(requestUser) + ',\n\n';
  text += 'Your request for ' + StringHelpers.createPopulatedRequestItemString(request);
  text += ' has been cancelled';
  if (!initiatingUser._id.equals(requestUser._id)) {
    text += ' by ' + StringHelpers.getDisplayName(initiatingUser);
  }
  text += '.';
  return text;
}
