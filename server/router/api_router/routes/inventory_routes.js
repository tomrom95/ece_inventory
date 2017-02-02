'use strict';
var Item = require('../../../model/items');
var Log = require('../../../model/logs');

module.exports.getAPI = function (req, res) {
  // required_tags and excluded_tags: CSV separated values
  // Remove required_tags and excluded_tags first
  var required_tags = req.query.required_tags;
  var excluded_tags = req.query.excluded_tags;
  if(required_tags){
    required_tags = required_tags.split(',').map(function(item){
      return item.trim();
    });
    var required_tags_regex = []; // case-insensitive
    required_tags.forEach(function(opt){
      required_tags_regex.push(new RegExp(opt, "i"));
    });
  }
  if(excluded_tags) {
    excluded_tags = excluded_tags.split(',').map(function(item){
      return item.trim();
    });
    var excluded_tags_regex = []; // case-insensitive
    excluded_tags.forEach(function(opt){
      excluded_tags_regex.push(new RegExp(opt, "i"));
    });
  }
  var location = req.query.location;
  var query = {};
  if(req.query.name)
  query.name = {'$regex': req.query.name, '$options':'i'};
  if(required_tags_regex && excluded_tags_regex)
  query.tags = { $all : required_tags_regex, $nin : excluded_tags_regex};
  else if(required_tags_regex)
  query.tags = { $all : required_tags_regex};
  else if(excluded_tags_regex)
  query.tags = { $nin : excluded_tags_regex};
  if(req.query.location) query.location = {'$regex': req.query.location, '$options':'i'};
  if(req.query.vendor_info) query.vendor_info = {'$regex': req.query.vendor_info, '$options':'i'};
  if(req.query.model_number) query.model_number = {'$regex': req.query.model_number, '$options':'i'};

  let projection = {
    instances: 0
  }

  let paginateOptions = {
    // page number (not offset)
    page: req.query.page,
    limit: Number(req.query.per_page)
  }
  // isNaN - checks whether object is not a number
  if(req.query.page && req.query.per_page && !isNaN(req.query.per_page)){
    Item.paginate(query, paginateOptions, function(err, obj){
        if(err) return res.send({error: err});
        res.json(obj.docs);
      });
  } else {
    Item.find(query, projection, function (err, items){
      if(err) return res.send({error: err});
      res.json(items);
    })
  }
};

// Route: /inventory/:item_id
module.exports.getAPIbyID = function(req,res){
  Item.findById(req.params.item_id, function (err, item){
    if(err) return res.send({error: err});
    (!item) ? res.send({error: 'Item does not exist'}) : res.json(item);
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
  item.tags = req.body.tags;
  item.has_instance_objects = req.body.has_instance_objects;
  item.save(function(err){
    if(err)
    return res.send({error: err});
    res.json(item);
  })
};

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
      Object.assign(old_item, req.body).save((err,item) => {
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
