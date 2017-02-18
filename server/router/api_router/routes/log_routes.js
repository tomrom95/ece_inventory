'use strict';
var Log = require('../../../model/logs');
var QueryBuilder = require('../../../queries/querybuilder');
var Item = require('../../../model/items');

const ITEM_FIELDS = 'name';
const USER_FIELDS = 'username netid first_name last_name';

module.exports.getAPI = function(req, res) {
  var query = new QueryBuilder();
  if (isInvalidDate(req.query.start_date) || isInvalidDate(req.query.end_date)) {
    return res.send({error: 'Invalid date format'});
  }

  var initiatingUserQuery = new QueryBuilder()
    .searchForObjectId('initiating_user', req.query.user_id)
    .toJSON();

  var affectedUserQuery = new QueryBuilder()
    .searchForObjectId('affected_user', req.query.user_id)
    .toJSON();

  query
    .searchExact('type', req.query.type)
    .searchInDateRange('time_stamp', req.query.start_date, req.query.end_date);

  if (req.query.item_id) {
    query.searchForObjectId('items', req.query.item_id)
  }

  if (req.query.item_name) {
    /*
    If item name specified, first search for the items that match the name
    The search the logs to find any log with an item that matches the name
    */
    var itemQuery = new QueryBuilder()
      .searchCaseInsensitive('name', req.query.item_name)
      .toJSON();
    Item.find(itemQuery, function(error, items) {
      if (error) return res.send({error: error});
      var itemIdList = items.map(i => i._id);
      query.searchInIdArrayForIdList('items', itemIdList);

      queryLog(query.toJSON(), initiatingUserQuery, affectedUserQuery, function (error, logs) {
        if (error) return res.send({error: error});
        return res.json(logs);
      });
    });
  } else {
    queryLog(query.toJSON(), initiatingUserQuery, affectedUserQuery, function (error, logs) {
      if (error) return res.send({error: error});
      return res.json(logs);
    });
  }

}

function queryLog(logQuery, initiatingUserQuery, affectedUserQuery, next) {
  Log
    .find(logQuery)
    .or([initiatingUserQuery, affectedUserQuery])
    .populate('items', ITEM_FIELDS)
    .populate('initiating_user', USER_FIELDS)
    .populate('affected_user', USER_FIELDS)
    .exec(function(err, logs) {
      if(err) {
        next(err);
      } else {
        next(null, logs);
      }
    });
}

function isInvalidDate(date) {
  if (!date) {
    return false;
  }
  return Date.parse(date) === NaN;
}
