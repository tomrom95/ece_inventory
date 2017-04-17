'use strict';
var mongoose = require('mongoose');

function QueryBuilder() {
  this.queryObject = {};
}

QueryBuilder.prototype.searchBoolean = function(name, value) {
  if (value !== null && value !== undefined) {
    this.queryObject[name] = value;
  }
  return this;
}

QueryBuilder.prototype.searchExact = function(name, value) {
  if (value) {
    this.queryObject[name] = value;
  }
  return this;
}

QueryBuilder.prototype.searchForObjectId = function(name, objectId) {
  if (objectId) return this.searchExact(name, mongoose.Types.ObjectId(objectId));
  return this;
}

QueryBuilder.prototype.searchInIdArrayForIdList = function(name, objectIds){
  if(objectIds) {
    this.queryObject[name] = {
      $in: objectIds
    }
  }
  return this;
}

QueryBuilder.prototype.searchInArrayForObjectId = function(arrayName, fieldName, objectId){
  if(objectId) {
    this.queryObject[arrayName] = {
        $elemMatch: {
            [fieldName]: objectId
        }
      }
  }
  return this;
}

QueryBuilder.prototype.searchForDate = function(name, date) {
  if (date) return this.searchExact(name, new Date(date));
  return this;
}

QueryBuilder.prototype.searchInDateRange = function(name, startDate, endDate) {
  if (!startDate && !endDate) return this;

  var dateQuery = {};
  if (startDate) {
    dateQuery['$gte'] = new Date(startDate);
  }
  if (endDate) {
    dateQuery['$lte'] = new Date(endDate);
  }
  this.queryObject[name] = dateQuery;
  return this;
}

QueryBuilder.prototype.searchThreshold = function() {
  this.queryObject['$where']= "this.minstock_threshold > this.quantity && this.minstock_isEnabled === true";
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

QueryBuilder.prototype.searchInArrayByMatchingField = function(arrayName, fieldName, match){
  // Search for a field value within an array that is a field of the schema
  if(match instanceof Array){
    this.queryObject[arrayName] = {$elemMatch: {[fieldName]: {$in: match}}};
  } else {
    this.queryObject[arrayName] = {$elemMatch: {[fieldName]: match}};
  }
  return this;
}

QueryBuilder.prototype.searchNotEqual = function(name, value) {
  if (value) {
    this.queryObject[name] = {$ne: value};
  }
  return this;
}

QueryBuilder.prototype.toJSON = function() {
  return this.queryObject;
}

module.exports = QueryBuilder;
