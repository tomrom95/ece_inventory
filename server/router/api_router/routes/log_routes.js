'use strict';
var Log = require('../../../model/logs');
var QueryBuilder = require('../../../queries/querybuilder');

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

  if (req.body.items)

  query
    .searchInArray('items', req.body.items) // check this
    .searchExact('type', req.body.type)
    .searchInDateRange('time_stamp', req.body.start_date, req.body.end_date);

  Log
    .find(query.toJSON())
    .or([initiatingUserQuery, affectedUserQuery])
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

function isInvalidDate(date) {
  return date && (Date.parse(date) === NaN);
}
