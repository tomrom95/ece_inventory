'use strict';
var Item = require('../../../model/items');
var QueryBuilder = require('../../../queries/querybuilder');
var Logger = require('../../../logging/logger');
var mongoose = require("mongoose");

module.exports.postAPI = function (req, res) {
  if(!req.body.threshold) return res.send({error: "Threshold value needed"});
  if(!req.body.isEnabled) return res.send({error: "IsEnabled value needed"});
  Item.update(
     {_id: {$in: req.body.items}},
     {$set: {"minstock.threshold": req.body.threshold,
             "minstock.isEnabled": req.body.isEnabled}},
     {multi: true},
   function(err){
     if(err) return res.send({error: err});
     Item.find({
       '_id': {$in: req.body.items}
     }, function(err, items){
       if(err) return res.send({error: err});
       res.json(items);
    });
  });
}
