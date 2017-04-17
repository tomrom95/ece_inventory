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
    requestItemMap[item.item._id] = item.quantity;
  });

  var text = 'Hello ' + StringHelpers.getDisplayName(createdFor) + ',\n\n';
  text += 'Your request for ' + StringHelpers.createRequestItemString(requestItemMap, items);
  text += ' has been fulfilled as a ' + request.action.toLowerCase();
  text += ' to you by ' + StringHelpers.getDisplayName(initiator) + '.';
  return text;
}

module.exports.requestChanged = function(request, changes, initiator, affectedUser) {
  var text = 'Hello ' + StringHelpers.getDisplayName(affectedUser) + ',\n\n';
  text += 'Your request for ' +  StringHelpers.createPopulatedRequestItemString(request);
  text += ' has been updated by ' + StringHelpers.getDisplayName(initiator);
  text += ' by changing ' + StringHelpers.createChangesString(request, changes) + '.';
  return text;
}

module.exports.loanChanged = function(oldLoan, changes, initiator, affectedUser) {
  var text = 'Hello ' + StringHelpers.getDisplayName(affectedUser) + ',\n\n';
  text += 'Your loan for' + StringHelpers.createPopulatedRequestItemString(oldLoan);
  text += ' has been updated by ' + StringHelpers.getDisplayName(initiator);
  text += ' by changing the statuses of:\n';
  changes.forEach(function(change) {
    var itemObj = oldLoan.items.find(function(item) {
      return String(item.item._id) === change.item;
    });
    if (!itemObj) return;
    text += ' - ' + StringHelpers.itemQuantityString(itemObj.item.name, itemObj.quantity);
    text += ' from ' + itemObj.status + ' to ' + change.status + '\n';
  });
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

module.exports.loanReminder = function(loanUser, loans, bodyPrepend) {
  var text = 'Hello ' + StringHelpers.getDisplayName(loanUser) + ',\n\n';
  text += bodyPrepend + '\n\n';
  text += 'The following items are due in your loans: \n\n';
  loans.forEach(function(loan) {
    loan.items.forEach(function(itemObj) {
      if (itemObj.status === 'LENT') {
        text += ' - ' + StringHelpers.itemQuantityString(itemObj.item.name, itemObj.quantity) + '\n';
      }
    });
  });
  return text;
}

module.exports.stockBelowThreshold = function(item){
  var text = 'Hello, \n\n';
  text += 'The item ' + item.name + ' has a quantity ('+item.quantity+') below the threshold ('+item.minstock_threshold+').';
  return text;
}

module.exports.backupFailure = function(adminUser, backupError, stderr) {
  var text = 'Hello ' + StringHelpers.getDisplayName(adminUser) + ',\n\n';
  text += 'A backup failed to be taken today. The following error was returned ';
  text += 'during the backup process. \nError: \n';
  text += backupError + '\n\n';
  if (stderr) {
    text += 'stderr: \n';
    text += stderr + '\n\n';
  }
  return text;
}

module.exports.backupSuccess = function(adminUser, filename, expiry) {
  var text = 'Hello ' + StringHelpers.getDisplayName(adminUser) + ',\n\n';
  text += 'A backup was successfully taken today and transferred to the backup vm.\n\n';
  text += 'Filename: ' + filename + '\n';
  text += 'Expiry: ' + expiry + ' days\n';
  return text;
}
