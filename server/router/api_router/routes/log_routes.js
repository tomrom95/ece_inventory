'use strict';
var Log = require('../../../model/logs');

const ITEM_FIELDS = 'name';
const USER_FIELDS = 'username netid first_name last_name';

module.exports.getAPI = function(req, res) {
  Log
    .find({})
    .populate('items', ITEM_FIELDS)
    .populate('initiating_user', USER_FIELDS)
    .populate('affected_user', USER_FIELDS)
    .exec(function(err, logs) {
      if(err) {
        res.send({error: err});
      } else {
        res.json(logs);
      }
    });
}
