'use strict';
var Item = require('../../../model/items');
var CustomField = require('../../../model/customFields');
var LogHelpers = require('../../../logging/log_helpers');
var mongoose = require('mongoose');

module.exports.postAPI = function(req, res){
  createOrUpdateField(
    req.params.item_id,
    req.body.field,
    req.body.value,
    req.user,
    function(error, item) {
      if (error) return res.send({error: error});
      res.json(item);
    }
  );
};

module.exports.putAPI = function(req, res){
  createOrUpdateField(
    req.params.item_id,
    req.params.field_id,
    req.body.value,
    req.user,
    function(error, item) {
      if (error) return res.send({error: error});
      res.json(item);
    }
  );
};

var createOrUpdateField = function(itemId, fieldId, value, user, next) {
  CustomField.findById(fieldId, function(error, field) {
    if (error) return next(error);
    if (!field) return next('Invalid field id');
    Item.findById(itemId, function(error, item) {
      if (error) return next(error);
      if (!item) return next('Item does not exist');
      var fieldIndex = item.custom_fields.findIndex(f => f.field.equals(fieldId));
      var oldValue = "null"; var newValue = value;
      if (fieldIndex >= 0) { // field exists
        oldValue = item.custom_fields[fieldIndex].value;
        item.custom_fields[fieldIndex].value = value;
      } else {
        item.custom_fields.push({
          field: fieldId,
          value: value
        });
      }
      item.save(function(error, newItem) {
        if (error) return next(error);
        LogHelpers.logItemCustomFieldEdit(newItem, field, oldValue, newValue, user, function(error) {
          if (error) return next(error);
          next(null, newItem);
        });
      });
    });
  });
}

module.exports.deleteAPI = function(req, res){
  CustomField.findById(req.params.field_id, function(error, field) {
    if (error) return next(error);
    if (!field) return next('Invalid field id');
    Item.findByIdAndUpdate(
      req.params.item_id,
      {
        '$pull': {
            custom_fields: { field: mongoose.Types.ObjectId(req.params.field_id) }
        }
      },
      function(error, oldItem) {
        if (error) return res.send({error: error});
        var oldValue = oldItem.custom_fields.find(f => String(f.field) === req.params.field_id).value;
        LogHelpers.logItemCustomFieldEdit(
          oldItem,
          field,
          oldValue,
          "null",
          req.user,
          function(error) {
            if (error) return res.send({error: error});
            return res.json({message: "Successful"});
          }
        );
      }
    );
  });
}
