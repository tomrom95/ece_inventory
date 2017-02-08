'use strict';
var Item = require('../../../model/items');

module.exports.getAPI = function(req, res){
  Item.distinct('tags', function(error, results) {
    if (error) {
      return res.send({error: error});
    }
    res.json(results);
  });
}
