'use strict';
var Loan = require('../../../model/loans');
var QueryBuilder = require('../../../queries/querybuilder');

const ITEM_FIELDS = 'name';
const USER_FIELDS = 'username netid first_name last_name';

module.exports.getAPI = function(req, res) {
  var query = new QueryBuilder();

  if (req.user.role === 'STANDARD') {
    query = query.searchForObjectId('user', req.user._id);
  } else {
    query = query.searchForObjectId('user', req.query.user_id)
  }

  Loan.find(query.toJSON())
      .populate('items.item', ITEM_FIELDS)
      .populate('user', USER_FIELDS)
      .exec(function(error, loans) {
        if (error) return res.send({error: error});
        return res.json(loans);
      });
}
