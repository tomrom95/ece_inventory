'use strict';
var Item = require('../../../model/items');
var QueryBuilder = require('../../../queries/querybuilder');

module.exports.getAPI = function (req, res) {
  // required_tags and excluded_tags: CSV separated values
  // Remove required_tags and excluded_tags first
  var query = new QueryBuilder();
  query
    .searchBoolean('is_deleted', false)
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
        res.json(obj.docs);
      });
  } else {
    let projection = {
      instances: 0
    }
    Item.find(query.toJSON(), projection, function (err, items){
      if(err) return res.send({error: err});
      res.json(items);
    })
  }
};

// Route: /inventory/:item_id
module.exports.getAPIbyID = function(req,res){
  Item.findById(req.params.item_id, function (err, item){
    if(err) return res.send({error: err});
    if (!item) {
      res.send({error: 'Item does not exist'});
    }
    if (req.user.role === 'STANDARD' && item.is_deleted) {
      return res.status(403).send({error: 'You do not have privileges to view this item'});
    }
    res.json(item);
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

module.exports.putAPI = function(req, res){
  if (req.body.is_deleted !== null && req.body.is_deleted !== undefined) {
    return res.send({error: 'You cannot update the delete field'})
  }
  Item.findById(req.params.item_id, function (err, old_item){
    if(err) return res.send({error: err});
    if(!old_item || old_item.is_deleted)
      return res.send({error: 'Item does not exist or has been deleted'});
    else{
      var old_quantity = old_item.quantity;
      var obj = Object.assign(old_item, req.body)
      obj.tags = trimTags(req.body.tags);
      obj.save((err,item) => {
        if(err) return res.send({error: err});
        res.json(item);
      });
    }
  });
};

module.exports.deleteAPI = function(req, res){
  Item.findByIdAndUpdate(
    req.params.item_id,
    {$set: {is_deleted: true}},
    function(err, item) {
      if (err) return res.send(err);
      return res.json({message: "Delete successful"});
    }
  );
}
