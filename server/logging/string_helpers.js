'use strict'

module.exports.getFilteredChanges = function(oldObject, changes) {
  var filteredKeys = Object.keys(changes)
    .filter(function(key) {
      // stringify values so that you can do equality with things like arrays
      return String(oldObject[key]) != String(changes[key]);
    })
  var filteredChanges = {};
  filteredKeys.forEach((key) => {
    filteredChanges[key] = changes[key]
  });
  if (Object.keys(filteredChanges).length === 0) {
    return null;
  }
  return filteredChanges;
}

module.exports.filterLoanChanges = function(oldLoan, changes) {
  changes = changes.filter(function(itemObj) {
    var oldItem = oldLoan.items.find(function(item) {
      return String(item.item._id) === itemObj.item;
    });
    if (!oldItem) return false;
    return oldItem.status !== itemObj.status;
  });
  if (changes.length === 0) return null;
  return changes;
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

module.exports.itemQuantityString = function(itemName, quantity) {
  var plural = quantity === 1 ? '' : 's';
  return '(' + quantity + ') ' + itemName + plural;
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
    itemString += ' ' + module.exports.itemQuantityString(item.name, quantity);
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

module.exports.getValueString = function(value) {
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

module.exports.createChangesString = function(oldObject, changes) {
  var changesString = "";
  let quantity_reason = changes.quantity_reason;
  delete changes.quantity_reason;
  Object.keys(changes).forEach(function(key, index, keyArray) {
    console.log("key" +key)
    if (index !== 0 && keyArray.length !== 2) {
      changesString += ',';
    }
    if (index === keyArray.length -1 && index !== 0) {
      changesString += ' and';
    }
    changesString += ' ' + key + ' from ' + module.exports.getValueString(oldObject[key])
      + ' to ' + module.exports.getValueString(changes[key]);
    if(key === "quantity") changesString += processQuantityChange(quantity_reason);
  });
  return changesString;
}

module.exports.createLoanEditString = function(oldLoan, changes){
  var changesString = "";
  changes.forEach(function(element, index, array){
    if (index !== 0 && array.length !== 2) {
      changesString += ',';
    }
    if (index === array.length -1 && index !== 0) {
      changesString += ' and';
    }
    let itemObject = oldLoan.items.find(i=> String(i.item._id)=== String(element.item));
    let itemName = itemObject.item.name;
    let oldStatus = itemObject.status;
    changesString += ' item ' + module.exports.getValueString(itemName) + ' from ' + module.exports.getValueString(oldStatus) + ' to ' + module.exports.getValueString(element.status);
  })
  return changesString
}
