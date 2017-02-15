'use strict';
var Item = require('../../../model/items');
var mongoose = require('mongoose');

module.exports.postAPI = function(req, res){
  Item.findById(req.params.item_id, function(error, item) {
    if (error) return res.send({error: error});
    if (!item) return res.send({error: 'Item does not exist'});
    var fieldExists = item.custom_fields.some(function (obj) {
        return obj.field.equals(req.body.field);
    });
    if (fieldExists) return res.send({error: 'Field already exists in item'});
    item.custom_fields.push({
      field: req.body.field,
      value: req.body.value
    });
    item.save(function(error, newItem) {
      if (error) return res.send({error: error});
      return res.json(newItem);
    });
  });
};

module.exports.putAPI = function(req, res){
  Item.findOneAndUpdate(
    {
      "_id": req.params.item_id,
      "custom_fields.field": mongoose.Types.ObjectId(req.params.field_id)
    },
    {
        "$set": {
            "custom_fields.$.value": req.body.value
        }
    },
    {new: true},
    function(error, item) {
      if (error) return res.send({error: error});
      return res.json(item);
    }
  );
};

module.exports.deleteAPI = function(req, res){
  Item.findByIdAndUpdate(
    req.params.item_id,
    {
      '$pull': {
          custom_fields: { field: mongoose.Types.ObjectId(req.params.field_id) }
      }
    },
    {new: true},
    function(error, item) {
      if (error) return res.send({error: error});
      return res.json(item);
    }
  );
}
