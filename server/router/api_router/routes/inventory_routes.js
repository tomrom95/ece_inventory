'use strict';
var Item = require('../../../model/items');
var Instance = require('../../../model/instances');
var CustomField = require('../../../model/customFields');
var QueryBuilder = require('../../../queries/querybuilder');
var Logger = require('../../../logging/logger');
var Emailer = require('../../../emails/emailer');
var CustomFieldHelpers = require('../../../customfields/custom_field_helpers');
var moment = require('moment');
const quantityReasonStrings = ["LOSS", "MANUAL", "DESTRUCTION", "ACQUISITION"];

var getPrivateFields = function(next) {
  CustomField.find({isPrivate: true}, function(error, fields) {
    if (error) return next(error);
    fields = fields.map((field) => {return field._id.toString()});
    next(null, new Set(fields));
  });
}

var filterPrivateFields = function(fieldIds, item) {
  item.custom_fields = item.custom_fields.filter(function(obj) {
    return !fieldIds.has(obj.field.toString());
  });
  return item;
}

var getAndRemovePrivateFieldsFromItem = function(item, next) {
  getPrivateFields(function(error, fieldIds) {
    if (error) return next(error);
    next(null, filterPrivateFields(fieldIds, item));
  });
}

var getAndRemovePrivateFieldsFromList = function(itemList, next) {
  getPrivateFields(function(error, fieldIds) {
    if (error) return next(error);
    itemList = itemList.map(function(item) {
      return filterPrivateFields(fieldIds, item);
    });
    next(null, itemList);
  });
}

module.exports.getAPI = function (req, res) {
  // required_tags and excluded_tags: CSV separated values
  // Remove required_tags and excluded_tags first
  var query = new QueryBuilder();
  query
    .searchBoolean('is_deleted', false)
    .searchInArray('tags', req.query.required_tags, req.query.excluded_tags)
    .searchCaseInsensitive('name', req.query.name)
    .searchCaseInsensitive('vendor_info', req.query.vendor_info)
    .searchCaseInsensitive('model_number', req.query.model_number)

  if(req.query.lessThanThreshold) query.searchThreshold('minstock_threshold', 'quantity');
  // isNaN - checks whether object is not a number
  if(req.query.page && req.query.per_page && !isNaN(req.query.per_page)){
    let paginateOptions = {
      // page number (not offset)
      select: {instances:0},
      page: req.query.page,
      limit: Number(req.query.per_page)
    }
    Item.paginate(query.toJSON(), paginateOptions, function(err, obj){
        if(err) return res.send({error: err});
        if (req.user.role === 'STANDARD') {
          getAndRemovePrivateFieldsFromList(obj.docs, function(error, filteredItems) {
            if (error) return res.send({error: error});
            return res.json(filteredItems);
          });
        } else {
          res.json(obj.docs);
        }
      });
  } else {
    let projection = {
      instances: 0
    }
    Item.find(query.toJSON(), projection, function (err, items){
      if(err) return res.send({error: err});
      if (req.user.role === 'STANDARD') {
        getAndRemovePrivateFieldsFromList(items, function(error, filteredItems) {
          if (error) return res.send({error: error});
          return res.json(filteredItems);
        });
      } else {
        res.json(items);
      }
    })
  }
};

// Route: /inventory/:item_id
module.exports.getAPIbyID = function(req,res){
  Item.findById(req.params.item_id, function (err, item){
    if(err) return res.send({error: err});
    if (!item) {
      return res.send({error: 'Item does not exist'});
    }
    if (req.user.role === 'STANDARD') {
      if (item.is_deleted) {
        return res.status(403).send({error: 'You do not have privileges to view this item'});
      }
      getAndRemovePrivateFieldsFromItem(item, function(error, filteredItem) {
        if (error) return res.send({error: error});
        return res.json(filteredItem);
      });
    } else {
      res.json(item);
    }
  });
};
// TODO: Add import_Id for bulk import
var autoCreateInstances = function(quantity, itemID, next) {
  var instances = new Array(quantity);
  for (var i = 0; i < quantity; i++) {
    var newInstance = new Instance({item: itemID});
    instances[i] = newInstance;
  }
  Instance.insertMany(instances, next);
}

module.exports.postAPI = function(req, res){
  var item = new Item();
  item.name = req.body.name;
  item.quantity = req.body.quantity;
  item.model_number = req.body.model_number;
  item.vendor_info = req.body.vendor_info;
  item.description = req.body.description;
  item.tags = trimTags(req.body.tags);
  item.is_asset = req.body.is_asset;
  item.custom_fields = req.body.custom_fields;
  item.minstock_threshold = req.body.minstock_threshold;
  item.minstock_isEnabled = req.body.minstock_isEnabled;
  CustomFieldHelpers.validateCustomFields(item.custom_fields, false, function(error, isValid) {
    if (error) return res.send({error: error});
    if (!isValid) return res.send({error: 'Invalid custom fields'});
    item.save(function(err, newItem){
      if(err)
      return res.send({error: err});
      autoCreateInstances(newItem.quantity, newItem._id, function(error, instances) {
        if (error) return res.send({error: error});
        Logger.logNewItem(newItem, req.user, function(error) {
          if (error) return res.send({error: error});
          Emailer.sendStockBelowThresholdEmail(newItem, function(error){
            if (error) return res.send({error: error});
            return res.json(newItem);
          });
        });
      });
    });
  });
};

function trimTags(tagArray){
  var fieldObj;
  if(tagArray){
    fieldObj = tagArray.map(function(tag){
        return tag.trim();
    });
  } else {
    fieldObj = [];
  }
  return fieldObj;
}

var isQuantityProvidedWithoutReason = function(newQuantity, oldQuantity, quantity_reason){
  return newQuantity &&
         newQuantity != oldQuantity &&
        (quantity_reason === null ||
         quantity_reason === undefined);
}

var isQuantityReasonProvidedWithoutQuantity = function(newQuantity, quantity_reason){
  return quantity_reason &&
        (newQuantity === null ||
         newQuantity === undefined);
}

var isQuantityReason = function(enteredString){
  return quantityReasonStrings.includes(enteredString);
}

var filterFieldsByArray = function(obj, array){
  var result = {};
  array.forEach(function(field){
    if(obj.hasOwnProperty(field)){
      result[field] = obj[field];
    }
  })
  return result;
}



module.exports.putAPI = function(req, res){
  if (req.body.is_deleted !== null && req.body.is_deleted !== undefined) {
    return res.send({error: 'You cannot update the delete field'})
  }
  Item.findById(req.params.item_id, function (err, old_item){
    if(err) return res.send({error: err});
    if(!old_item || old_item.is_deleted) {
      return res.send({error: 'Item does not exist or has been deleted'});
    } else if (req.body.quantity !== old_item.quantity && old_item.is_asset) {
      return res.send({error: 'You cannot directly edit the quantity of an asset'});
    } else if (isQuantityProvidedWithoutReason(req.body.quantity, old_item.quantity, req.body.quantity_reason)){
      return res.send({error:'Reason for quantity change not provided'});
    } else if (isQuantityReasonProvidedWithoutQuantity(req.body.quantity, req.body.quantity_reason)){
      return res.send({error:'Quantity not provided with reason'});
    } else if(req.body.quantity_reason && !isQuantityReason(req.body.quantity_reason)){
      return res.send({error:'Invalid reason provided for quantity change'});
    } else {
      var oldItemCopy = new Item(old_item);
      // Filter out invalid body fields
      var changes = filterFieldsByArray(req.body, Object.keys(Item.schema.paths));
      var createInstances = oldItemCopy.is_asset === false && changes.is_asset === true;
      // Pass forward the quantity reason
      changes.quantity_reason = req.body.quantity_reason;
      CustomFieldHelpers.validateCustomFields(changes.custom_fields, false, function(error, isValid) {
        if (error) return res.send({error: error});
        if (!isValid) return res.send({error: 'Invalid custom fields'});
        var obj = Object.assign(old_item, changes);
        obj.tags = trimTags(req.body.tags);
        obj.save((err,item) => {
          if(err) return res.send({error: err});
          Emailer.sendStockBelowThresholdEmail(item, function(error){
            if(error) return res.send({error: error});
            Logger.logEditing(oldItemCopy, changes, req.user, function(err) {
              if(err) return res.send({error: err});
              if (createInstances){
                autoCreateInstances(item.quantity, item._id, function(error, instances) {
                  if(error) return res.send({error: error});
                  res.json(item);
                });
              } else {
                res.json(item);
              }
            });
          })
        });
      })
    }
  });
};

module.exports.deleteAPI = function(req, res){
  Item.findById(req.params.item_id, function(error, item) {
    if (error) return res.send({error: error});
    if (item.is_deleted) {
      res.send({error: 'Item has already been marked as deleted'})
    }
    var itemCopy = new Item(item);
    item.is_deleted = true;
    // adds '- deleted year-month-day hour:minute:second' to name to allow for
    // new items with same name
    item.name = item.name + ' - deleted ' + moment().format('YYYY-MM-DD hh:mm:ssa');

    item.save(function(error, newItem) {
      if (error) return res.send(error);
      Logger.logDeletion(itemCopy, req.user, function(error) {
        if (error) return res.send({error: error});
        return res.json({message: "Delete successful"});
      });
    })
  });
}
