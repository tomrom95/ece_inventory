'use strict';
var Item = require('../../../model/items');
var Log = require('../../../model/logs');
var CustomField = require('../../../model/customFields');
var QueryBuilder = require('../../../queries/querybuilder');

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
    .searchInArray('tags', req.query.required_tags, req.query.excluded_tags)
    .searchCaseInsensitive('name', req.query.name)
    .searchCaseInsensitive('location', req.query.location)
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
    if (!item) return res.send({error: 'Item does not exist'});
    if (req.user.role === 'STANDARD') {
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
  item.location = req.body.location;
  item.vendor_info = req.body.vendor_info;
  item.description = req.body.description;
  item.tags = trimTags(req.body.tags);
  item.has_instance_objects = req.body.has_instance_objects;
  item.save(function(err){
    if(err)
    return res.send({error: err});
    res.json(item);
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

function logQuantityChange(change, userID, itemID, next) {
  if (change == 0) {
    return next(null);
  }
  var log = new Log({
    created_by: userID,
    type: change > 0 ? 'ACQUISITION' : 'LOSS',
    item: itemID,
    quantity: Math.abs(change),
  });
  log.save(function(err) {
    next(err);
  });
}

module.exports.putAPI = function(req, res){
  Item.findById(req.params.item_id, function (err, old_item){
    if(err) return res.send({error: err});
    if(!old_item)
      return res.send({error: 'Item does not exist'});
    else{
      var old_quantity = old_item.quantity;
      var obj = Object.assign(old_item, req.body)
      obj.tags = trimTags(req.body.tags);
      obj.save((err,item) => {
        if(err) return res.send({error: err});
        if (req.body.quantity) {
          logQuantityChange(req.body.quantity - old_quantity, req.user._id, item._id, function(error) {
            if(err) {
              return res.send({error: err});
            } else {
              res.json(item);
            }
          });
        } else {
          res.json(item);
        }
      });
    }
  });
};

module.exports.deleteAPI = function(req, res){
  Item.findById(req.params.item_id, function(err, item){
    if(err) return res.send({error: err});
    if(!item)
     return res.send({error: 'Item does not exist'});
    else{
      item.remove(function(err){
        if(err) return res.send({error: err});
        res.send({message: 'Delete successful'});
    });
  }
  })
}
