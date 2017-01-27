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
