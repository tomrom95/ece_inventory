'use strict';
var Item = require('../../../model/items');
var Instance = require('../../../model/instances');

module.exports.getAPI = function (req, res) {
  // queryable by serial number, condition and status
  var serial_number = req.query.serial_number;
  var condition = req.query.condition;
  var status = req.query.status;

  var query = {};
  if(serial_number) query.serial_number = serial_number;
  if(condition)     query.condition = condition;
  if(status)        query.status = status;

  Item.findById(req.params.item_id, function (err, item){
    if(err) return res.send({error: err});
    if (!item) return res.send({error: 'Item does not exist'})
    else {
      res.json(item.instances);
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
      res.send({error: 'Item does not exist'});
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
        instance.remove();
        item.save(function(err){
          if(err) return res.send({error: err});
          res.send({message: 'Delete successful'});
        })
      }
    }
  })
}
