'use strict';
var Log = require('../../../model/logs');

module.exports.getAPI = function(req, res) {
  Log
    .find({})
    .populate('item', 'name')
    .exec(function(err, logs) {
      if(err) {
        res.send({error: err});
      } else {
        res.json(logs);
      }
    });
}
