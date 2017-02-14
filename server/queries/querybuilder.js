'use strict';
var mongoose = require('mongoose');

function QueryBuilder() {
  this.queryObject = {};
}

QueryBuilder.prototype.searchExact = function(name, value) {
  if (value != null) {
    this.queryObject[name] = value;
  }
  return this;
}

QueryBuilder.prototype.searchForObjectId = function(name, objectId) {
  if (objectId) return this.searchExact(name, mongoose.Types.ObjectId(objectId));
  return this;
}

QueryBuilder.prototype.searchForDate = function(name, date) {
  if (date) return this.searchExact(name, new Date(date));
  return this;
}

QueryBuilder.prototype.searchCaseInsensitive = function(name, value, trim=true) {
  if (value) {
    value = trim ? value.trim() : value;
    this.queryObject[name] = {'$regex': value, '$options':'i'};
  }
  return this;
}

QueryBuilder.prototype.searchCaseSensitive = function(name, value, trim=true) {
  if (value) {
    value = trim ? value.trim() : value;
    this.queryObject[name] = {'$regex': value};
  }
  return this;
}

function trimArray(arrayToTrim) {
  return arrayToTrim.map(function(elem){
    return elem.trim();
  });
}

function createArrayMatchingRegex(array) {
  var arrayRegex = [];
  array.forEach(function(opt){
    // '^-----$' regex matches whole string
    arrayRegex.push(new RegExp('^'+opt+'$', "i"));
  });
  return arrayRegex;
}

QueryBuilder.prototype.searchInArray = function(name, requiredItems, excludedItems, trim=true) {
  var requiredRegex; var excludedRegex;
  if (requiredItems) {
    requiredRegex = createArrayMatchingRegex(trimArray(requiredItems.split(',')));
  }
  if (excludedItems) {
    excludedRegex = createArrayMatchingRegex(trimArray(excludedItems.split(',')));
  }
  if(requiredItems && excludedItems) {
    this.queryObject[name] = {$all : requiredRegex, $nin : excludedRegex};
  } else if(requiredItems) {
    this.queryObject[name] = {$all : requiredRegex};
  } else if(excludedItems) {
    this.queryObject[name] = {$nin : excludedRegex};
  }
  return this;
}

QueryBuilder.prototype.toJSON = function() {
  return this.queryObject;
}

module.exports = QueryBuilder;
