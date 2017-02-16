'use strict';
var Log = require('../../../model/logs');

module.exports.getAPI = function(req, res) {
  Log
    .find({})
    .populate('items', 'name')
    .populate('initiating_user', 'username netid first_name last_name')
    .populate('affected_user', 'username netid first_name last_name')
    .exec(function(err, logs) {
      if(err) {
        res.send({error: err});
      } else {
        res.json(logs);
      }
    });
}
