'use strict';
var Item = require('../../../model/items');
var Instance = require('../../../model/instances');
var mongoose = require('mongoose');
var QueryBuilder = require('../../../queries/querybuilder');
var CustomFieldHelpers = require('../../../customfields/custom_field_helpers');
var Emailer = require('../../../emails/emailer');

module.exports.getAPI = function (req, res) {
  var query = new QueryBuilder();
  query
    .searchBoolean('in_stock', req.query.in_stock)
    .searchForObjectId('item', req.params.item_id);

  Instance.find(query.toJSON(), function(error, instances) {
    if (error) return res.send({error: error});
    return res.json(instances);
  });
};

module.exports.putAPI = function(req,res) {
  Instance.findById(req.params.instance_id, function(error, instance) {
    if (error) return res.send({error: error});
    if (!instance) return res.send({error: 'Could not find instance'});
    CustomFieldHelpers.validateCustomFields(req.body.custom_fields, true, function(error, isValid) {
      if (error) return res.send({error: error});
      if (!isValid) return res.send({error: 'Invalid custom fields'});

      if (req.body.tag) instance.tag = req.body.tag;
      if (req.body.custom_fields) instance.custom_fields = req.body.custom_fields;

      instance.save(function(error, newInstance) {
        if (error) return res.send({error: error});
        return res.json(newInstance);
      });
    });
  });
};

module.exports.postAPI = function(req, res) {
  Item.findById(req.params.item_id, function(error, item) {
    if (error) return res.send({error: error});
    if (!item) return res.send({error: 'Item specified does not exist'});
    if (!item.is_asset) return res.send({error: 'This item is not an asset'});
    if (req.body.in_stock === false) return res.send({error: 'You cannot add an instance that is not in stock'});

    // assign item id to the instance from the url params
    req.body.item = req.params.item_id;
    CustomFieldHelpers.validateCustomFields(req.body.custom_fields, true, function(error, isValid) {
      if (error) return res.send({error: error});
      if (!isValid) return res.send({error: 'Invalid custom fields'});
      var instance = new Instance(req.body);
      instance.save(function(error, instance) {
        if (error) return res.send({error: error});
        item.quantity += 1;
        item.save(function(error, item) {
          if (error) return res.send({error: error});
          return res.json(instance);
        });
      });
    });
  });
};

module.exports.deleteAPI = function(req, res){
  Instance.findById(req.params.instance_id, function(error, instance) {
    if (error) return res.send({error: error});
    if (!instance) return res.send({error: 'Instance does not exist'});
    var itemId = instance.item;
    instance.remove(function(error) {
      if (error) return res.send({error: error});
      Item.findByIdAndUpdate(
        req.params.item_id,
        {$inc: {quantity: -1}},
        function(error, item) {
          if (error) return res.send({error: error});
          Emailer.sendStockBelowThresholdEmail(item, function(error){
            return res.json({message: "Successful"});
          })
        }
      );
    });
  })
}
