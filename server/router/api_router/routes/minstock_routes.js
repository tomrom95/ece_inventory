'use strict';
var Item = require('../../../model/items');
var QueryBuilder = require('../../../queries/querybuilder');
var Logger = require('../../../logging/logger');
var mongoose = require("mongoose");

module.exports.postAPI = function (req, res) {
  var minStockPromises = [];
  var itemIDs = [];
  for(var i = 0 ; i < req.body.items.length ; i++){
    minStockPromises.push(createMinStockPromise(req.body.items[i].item, req.body.items[i].threshold, req.body.items[i].isEnabled));
    itemIDs.push(mongoose.Types.ObjectId(req.body.items[i].item));
  }
  Promise.all(minStockPromises).then(function(){
    // return list of updated items
   Item.find({
     '_id': {$in: itemIDs}
   }, function(err, items){
     if(err) return res.send({error: err});
     res.json(items);
  });
  }, function(err){
    return res.send({error: err});
  });
}

function createMinStockPromise(item, threshold, isEnabled){
  return new Promise((resolve, reject) => {
    Item.findById(item, function(err, itemObj) {
      if(err) return reject(err);
      itemObj.minstock.threshold = threshold;
      itemObj.minstock.isEnabled = isEnabled;
      itemObj.save(function(err,item){
        if(err) return reject(err);
        resolve();
      })
    });
  });
}
