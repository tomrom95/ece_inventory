'use strict';
var Loan = require('../../../model/loans');
var Item = require('../../../model/items');

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

  if(req.query.item_name && req.query.type){
    // TODO
    findLoan(query, res);

  } else if (req.query.item_name){
    var itemQuery = new QueryBuilder();
    itemQuery.searchCaseInsensitive('name',req.query.item_name);
    Item.find(itemQuery.toJSON(), function(err, items){
      if(err) return res.send({error: err});
      var itemIDs = [];
      items.forEach(function(element){
        itemIDs.push(element._id);
      })
      query = query.searchInArrayByMatchingField("items","item",itemIDs);
      findLoan(query, res);
    });

  } else if(req.query.item_type){
    // TODO
    


    findLoan(query, res);
  } else {
    findLoan(query, res);
  };
}

function findLoan(query, res){
  Loan.find(query.toJSON())
      .populate('items.item', ITEM_FIELDS)
      .populate('user', USER_FIELDS)
      .exec(function(error, loans) {
        if (error) return res.send({error: error});
        return res.json(loans);
  });
}

module.exports.getAPIbyID = function (req,res){
  Loan.findById(req.params.loan_id)
      .populate('items.item', ITEM_FIELDS)
      .populate('user', USER_FIELDS)
      .exec(function(error, loan) {
        if (error) return res.send({error: error});
        return res.json(loan);
      });
}
