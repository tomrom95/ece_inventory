'use strict';
var Item = require('../../../model/items');

module.exports.getAPI = function(req, res){
  Item.find({is_deleted: false}).distinct('tags', function(error, results) {
    if (error) {
      return res.send({error: error});
    }
    res.json(results.filter(tag => tag));
  });
}
