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
