'use strict';
var CustomField = require('../../../model/customFields');

var isInvalidFieldValue = function(value, type) {
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
  CustomField.find({perInstance: perInstance}, function(error, fields) {
    if (error) return next(error);
    fieldMap = {};
    fields.forEach(function(field) {
      fieldMap[field._id] = field;
    });
    for (newFieldObj in newFieldValues) {
      if (!fieldMap[newFieldObj.field]) return next(null, false);
      if (isInvalidFieldValue(newFieldObj.value, fieldMap[newFieldObj.field].type)) {
        return next(null, false);
      }
    }
    return next(null, true);
  });
}

module.exports.validateCustomFields = validateCustomFields;
