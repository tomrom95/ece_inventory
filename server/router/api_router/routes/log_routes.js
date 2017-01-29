'use strict';
var Log = require('../../../model/logs');

module.exports.getLogs = function(req, res) {
  Log
    .find({})
    .populate('created_by', 'username')
    .populate('item', 'name')
    .exec(function(err, logs) {
      if(err) {
        res.send({error: err});
      } else {
        res.json(logs);
      }
    });
}
