'use strict';
var Item = require('../../../model/items');
var Instance = require('../../../model/instances');
var mongoose = require('mongoose');
var QueryBuilder = require('../../../queries/querybuilder');

module.exports.getAPI = function (req, res) {
  // queryable by serial number, condition and status
  var query = new QueryBuilder();
  query
    .searchExact('instances.serial_number', req.query.serial_number, true)
    .searchExact('instances.condition', req.query.condition, true)
    .searchExact('instances.status', req.query.status, true);

  var item_id = req.params.item_id;
  Item.aggregate(
    // Find the Item
    [{$match: { _id: mongoose.Types.ObjectId(item_id)}},
    // Separate item for each instance it has
    {$unwind: '$instances'},
    // Filter out each separated item according to instance query
    {$match: query.toJSON()},
    // Regroup separated items into one object with list of instances
    {$group: {_id:'$_id', filteredList:{$push: '$instances'}}}],
    function(err, result){
      if(err) return res.send({error: err});
      else {
          // Result is Array with 1 object
          res.json(result.length ? result[0].filteredList : []);
      }
  });
};

// Route: /inventory/:item_id/:instance_id
module.exports.getAPIbyID = function(req,res){
  Item.findById(req.params.item_id, function (err, item){
    if(err) return res.send({error: err});
    if(!item){
      res.send({error: 'Item does not exist'});
    } else {
      // find instance from contained schema
      // Handle if the id doesn't exist
      var instance = item.instances.id(req.params.instance_id);
      res.json(instance ? instance : {error: "Instance does not exist in item"});
    }
  });
};

// Route: /inventory/:item_id/:instance_id
module.exports.putAPI = function(req,res){
  Item.findById(req.params.item_id, function (err, item){
    if(err) return res.send({error: err});
    if(!item){
      return res.send({error: 'Item does not exist'});
    } else {
      // find instance from contained schema
      // Handle if the id doesn't exist
      var instance = item.instances.id(req.params.instance_id);
      if(!instance){
        return res.send({error: "Instance does not exist in item"});
      } else {
        Object.assign(instance, req.body);
        item.save((err, item) => {
          if(err) return res.send({error:err});
          res.json(instance);
        })
      }
    }
  });
};

module.exports.postAPI = function(req, res){
  Item.findById(req.params.item_id, function (err, item){
    if(err) return res.send({error: err});
    if (!item) return res.send({error: 'Item does not exist'})
    else {
      var instance = new Instance();
      var serial_number = req.body.serial_number;
      var condition = req.body.condition;
      var status = req.body.status;
      if (!serial_number){
        return res.send({error: 'Serial number is required'});
      } else {
        instance.serial_number = serial_number;
      }
      instance.condition = req.body.condition;
      instance.status = req.body.status;
      if(!item.instances.length) item.has_instance_objects = true;
      item.instances.push(instance);
      item.save(function(err, item){
        if(err) return res.send({error:err});
        res.json(item.instances.id(instance.id));
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
      var instance = item.instances.id(req.params.instance_id);
      if(!instance){
        return res.send({error: "Instance does not exist in item"});
      } else {
        instance.remove(function(err){
          if (err) return res.send({error: err});
          if(!item.instances.length) item.has_instance_objects = false;
          item.save(function(err){
            if(err) return res.send({error: err});
            res.send({message: 'Delete successful'});
          });
        });
      }
    }
  })
}
