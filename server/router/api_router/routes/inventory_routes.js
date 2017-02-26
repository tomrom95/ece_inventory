'use strict';
var Item = require('../../../model/items');
var CustomField = require('../../../model/customFields');
var QueryBuilder = require('../../../queries/querybuilder');
var LogHelpers = require('../../../logging/log_helpers');
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

module.exports.postAPI = function(req, res){
  var item = new Item();
  item.name = req.body.name;
  item.quantity = req.body.quantity;
  item.model_number = req.body.model_number;
  item.vendor_info = req.body.vendor_info;
  item.description = req.body.description;
  item.tags = trimTags(req.body.tags);
  item.has_instance_objects = req.body.has_instance_objects;
  item.save(function(err, newItem){
    if(err)
    return res.send({error: err});
    LogHelpers.logNewItem(newItem, req.user, function(error) {
      if (error) return res.send({error: error});
      return res.json(newItem);
    });
  })
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

module.exports.putAPI = function(req, res){
  if (req.body.is_deleted !== null && req.body.is_deleted !== undefined) {
    return res.send({error: 'You cannot update the delete field'})
  }
  Item.findById(req.params.item_id, function (err, old_item){
    if(err) return res.send({error: err});
    if(!old_item || old_item.is_deleted)
      return res.send({error: 'Item does not exist or has been deleted'});
    else if (isQuantityProvidedWithoutReason(req.body.quantity, old_item.quantity, req.body.quantity_reason)){
      return res.send({error:'Reason for quantity change not provided'})
    } else if (isQuantityReasonProvidedWithoutQuantity(req.body.quantity, req.body.quantity_reason)){
      return res.send({error:'Quantity not provided with reason'})
    } else if(!isQuantityReason(req.body.quantity_reason)){
      return res.send({error:'Invalid reason provided for quantity change'})
    } else {
      var oldItemCopy = new Item(old_item);
      var obj = Object.assign(old_item, req.body)
      obj.tags = trimTags(req.body.tags);
      obj.save((err,item) => {
        if(err) return res.send({error: err});
        LogHelpers.logEditing(oldItemCopy, req.body, req.user, function(err) {
          if(err) return res.send({error: err});
          res.json(item);
        });
      });
    }
  });
};

module.exports.deleteAPI = function(req, res){
  Item.findById(req.params.item_id, function(error, item) {
    if (error) return res.send({error: error});
    if (item.is_deleted) {
      res.send({error: 'Item has already been marked as deleted'})
    }
    item.is_deleted = true;
    item.save(function(error, newItem) {
      if (error) return res.send(error);
      LogHelpers.logDeletion(newItem, req.user, function(error) {
        if (error) return res.send({error: error});
        return res.json({message: "Delete successful"});
      });
    })
  });
}
