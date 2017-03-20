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
  if(req.query.item_type){
    appendItemTypeQuery(query, req.query.item_type);
  }
  if(req.query.item_name){
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
  } else {
    findLoan(query, res);
  }
}

function appendItemTypeQuery(query, item_type){
  if(item_type === 'OUTSTANDING'){
    query.searchExact("items.status",  'LENT');
  } else if (item_type === 'COMPLETE'){
    query.searchExact("items.status", {$nin: 'LENT'});
  }
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

module.exports.putAPI = function (req, res){
  if(req.user.role === 'STANDARD') return res.send({error: "You are not authorized"});
  var newItems = req.body.items;
  // Error checking with items array;
  if(newItems instanceof Array === false) return res.send({error:'Items must be an array'});
  if(newItems.length <= 0) return res.send({error: 'You must enter at least one item to change'});
  Loan.findById(req.params.loan_id, function(err, loan){
    if(err) return res.send({error:err});
    // list of items to return by promises
    var returnPromises = [];
    // Iterate through items array provided in the body
    for(var i = 0; i < newItems.length; i++){
      // Find in the loan item array the id
      var matchedIndex = loan.items.findIndex(function(element){
        return element.item.toString() === newItems[i].item.toString();
      })
      if(matchedIndex === -1) return res.send({error: 'Item at index '+i+' does not exist'});
      if(newItems[i].status === 'DISBURSED') {
        loan.items[matchedIndex].status = 'DISBURSED';
      } else if (newItems[i].status === 'RETURNED'){
        loan.items[matchedIndex].status = 'RETURNED';
        addReturnPromises(returnPromises, loan, matchedIndex);
      }
    }
    Promise.all(returnPromises).then(function() {
      loan.save(function(error, loan){
        if (error) return res.send({error: error});
        Loan.populate(loan, {path: "items.item", select: ITEM_FIELDS}, function(error, populatedLoan){
          if (error) return res.send({error: error});
          return res.json(populatedLoan);
        })
      });
    }, function(error){
      return res.send({error: error});
    });
  })
}

function addReturnPromises(returnPromises, loan, index){
  returnPromises.push(new Promise((resolve, reject) => {
    Item.findById(loan.items[index].item, function(err, item) {
      if (err) return reject(err);
      item.quantity += loan.items[index].quantity;
      item.save(function(err, updatedItem) {
        if (err) return reject(err);
        if (!updatedItem) return reject('Item does not exist');
        Item.populate(updatedItem,{path: "item", select: ITEM_FIELDS}, function(err, item){
          if (err) return reject(err);
          resolve();
        })
      });
    });
  }));
}
