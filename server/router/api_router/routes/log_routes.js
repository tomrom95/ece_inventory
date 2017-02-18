'use strict';
var Log = require('../../../model/logs');
var QueryBuilder = require('../../../queries/querybuilder');

const ITEM_FIELDS = 'name';
const USER_FIELDS = 'username netid first_name last_name';

module.exports.getAPI = function(req, res) {
  var query = new QueryBuilder();
  if (isInvalidDate(req.body.start_date) || isInvalidDate(req.body.end_date)) {
    return res.send({error: 'Invalid date format'});
  }

  var initiatingUserQuery = new QueryBuilder()
    .searchForObjectId('initiating_user', req.body.user)
    .toJSON();

  var affectedUserQuery = new QueryBuilder()
    .searchForObjectId('affected_user', req.body.user)
    .toJSON();

  query
    .searchInArrayForObjectId('items', req.body.item)
    .searchExact('type', req.body.type)
    .searchInDateRange('time_stamp', req.body.start_date, req.body.end_date);

  Log
    .find(query.toJSON())
    .or([initiatingUserQuery, affectedUserQuery])
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

function isInvalidDate(date) {
  return date && (Date.parse(date) === NaN);
}
