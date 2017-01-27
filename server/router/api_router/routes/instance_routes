'use strict';
var Item = require('../../../model/items');
var Instance = require('../../../model/instances');
var helper = require('../api_helpers');

module.exports.getAPI = function (req, res) {
  // queryable by serial number, condition and status
  var serial_number = req.query.serial_number;
  var condition = req.query.condition;
  var status = req.query.status;

  var query = {};
  if(serial_number) query.serial_number = serial_number;
  if(condition)     query.condition = condition;
  if(status)        query.status = status;

  Item.find(query, function(err, items){
    if(err) res.send({error: err});
    res.json(items);
  });
});

module.exports.postAPI = function(req, res){
  var instance = new Instance();
  instance.serial_number = req.body.serial_number;
  instance.condition = req.body.condition;
  instance.status = req.body.status;
  instance.save(function(err){
    if(err)
    return res.send({error:err});
    res.json(item);
  })

}
