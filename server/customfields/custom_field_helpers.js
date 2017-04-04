'use strict';
var CustomField = require('../model/customFields');
var validator = require('validator');

var isInvalidFieldValue = function(value, type) {
  if (!value) return false;
  value = String(value);
  switch(type) {
    case 'LONG_STRING':
    case 'SHORT_STRING':
      return false;
    case 'FLOAT':
      return !validator.isFloat(value);
    case 'INT':
      return !validator.isInt(value);
    default:
      return true;
  }
}

var validateCustomFields = function(newFieldValues, perInstance, next) {
  if (!newFieldValues) return next(null, true);
  CustomField.find({}, function(error, fields) {
    if (error) return next(error);
    var fieldMap = {};
    fields.forEach(function(field) {
      fieldMap[field._id] = field;
    });
    var isValid = true;
    newFieldValues.forEach(function(fieldValuePair) {
      if (!validateSingleField(fieldValuePair, fieldMap[fieldValuePair.field], perInstance)) {
        isValid = false;
      }
    });
    return next(null, isValid);
  });
}

var validateSingleField = function(fieldValuePair, customField, perInstance) {
  if (!customField) return false;
  if (customField.perInstance !== perInstance) return false;
  if (isInvalidFieldValue(fieldValuePair.value, customField.type)) {
    return false;
  }
  return true;
}

module.exports.validateCustomFields = validateCustomFields;
module.exports.validateSingleField = validateSingleField
