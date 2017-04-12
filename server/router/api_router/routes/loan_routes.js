'use strict';
var Loan = require('../../../model/loans');
var Item = require('../../../model/items');
var Instance = require('../../../model/instances');
var QueryBuilder = require('../../../queries/querybuilder');
var Emailer = require('../../../emails/emailer');
var Logger = require('../../../logging/logger');
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
  if(req.query.item_id){
    // You do not need item name query if searching by itemID
    Item.findById(req.query.item_id, function(err, item){
      if(err) return res.send({error: err});
      query = query.searchInArrayByMatchingField("items","item", item._id);
      returnLoans(query, req, res);
    });
  } else if(req.query.item_name){
    var itemQuery = new QueryBuilder();
    itemQuery.searchCaseInsensitive('name',req.query.item_name);
    Item.find(itemQuery.toJSON(), function(err, items){
      if(err) return res.send({error: err});
      var itemIDs = [];
      items.forEach(function(element){
        itemIDs.push(element._id);
      })
      query = query.searchInArrayByMatchingField("items","item",itemIDs);
      returnLoans(query, req, res);
    });
  } else {
    returnLoans(query, req, res);
  }
}

function appendItemTypeQuery(query, item_type){
  if(item_type === 'OUTSTANDING'){
    query.searchExact("items.status",  'LENT');
  } else if (item_type === 'COMPLETE'){
    query.searchExact("items.status", {$nin: 'LENT'});
  }
}

function returnLoans(query, req, res){
  if(req.query.page && req.query.per_page && !isNaN(req.query.per_page)){
    let paginateOptions = {
      page: req.query.page,
      limit: Number(req.query.per_page),
      sort: {"created": -1},
      populate: [{path:'items.item', select: ITEM_FIELDS}, {path:'user', select: USER_FIELDS}]
    }
    Loan.paginate(query.toJSON(), paginateOptions, function(err,obj){
      if(err) return res.send({error:err});
      res.json(obj.docs);
    })
  } else {
    Loan.find(query.toJSON())
        .populate('items.item', ITEM_FIELDS)
        .populate('user', USER_FIELDS)
        .sort({"created": -1})
        .exec(function(error, loans) {
          if (error) return res.send({error: error});
          return res.json(loans);
    });
  }
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
  var newItems = req.body.items;
  // Error checking with items array;
  if(newItems instanceof Array === false) return res.send({error:'Items must be an array'});
  if(newItems.length <= 0) return res.send({error: 'You must enter at least one item to change'});
  Loan.findById(req.params.loan_id, function(err, loan){
    if(err) return res.send({error:err});
    if (!loan) return res.send({error: 'Loan does not exist'});
    var oldLoanCopy = JSON.parse(JSON.stringify(loan));
    // list of items to return by promises
    var returnPromises = [];
    // Iterate through items array provided in the body
    for(var i = 0; i < newItems.length; i++){
      // Find in the loan item array the id
      var matchedIndex = loan.items.findIndex(function(element){
        return element.item.toString() === newItems[i].item.toString();
      })
      if(matchedIndex === -1) return res.send({error: 'Item at index '+i+' does not exist'});
      if(!newItems[i].backfill_rejected) loan.items[matchedIndex].backfill_rejected = newItems[i].backfill_rejected;
      if(newItems[i].status === 'DISBURSED') {
        if(req.user.role === 'STANDARD') return res.send({error: "You are not authorized"});
        // marked as disbursed if pending backfill means request not rejected
        if(loan.items[matchedIndex].status==='BACKFILL_REQUESTED') loan.items[matchedIndex].backfill_rejected = false;
        loan.items[matchedIndex].status = 'DISBURSED';
        addDisbursePromises(returnPromises, loan, matchedIndex);
      } else if (newItems[i].status === 'RETURNED'){
        if(req.user.role === 'STANDARD') return res.send({error: "You are not authorized"});
        loan.items[matchedIndex].status = 'RETURNED';
        addReturnPromises(returnPromises, loan, matchedIndex);
      } else if (newItems[i].status === 'LENT'){
        if(req.user.role === 'STANDARD') return res.send({error: "You are not authorized"});
        // marked as lent if pending backfill means request rejected
        if(loan.items[matchedIndex].status==='BACKFILL_REQUESTED') loan.items[matchedIndex].backfill_rejected = true;
        loan.items[matchedIndex].status = 'LENT';
      } else if (newItems[i].status === 'BACKFILL_REQUESTED' && req.user.role === 'STANDARD' && loan.items[matchedIndex].status === 'LENT'){
        loan.items[matchedIndex].status = 'BACKFILL_REQUESTED';
      } else if (newItems[i].status === 'BACKFILL_REQUESTED'){
        if(req.user.role === 'STANDARD') return res.send({error: "You are not authorized"});
        loan.items[matchedIndex].status = 'BACKFILL_REQUESTED';
      }
    }
    loan.lastModified = new Date();
    if(loan.manager_comment) loan.manager_comment = req.body.manager_comment;
    Promise.all(returnPromises).then(function() {
      loan.save(function(error, loan){
        if (error) return res.send({error: error});
        Loan.populate(loan, {path: "items.item", select: ITEM_FIELDS}, function(error, populatedLoan){
          if (error) return res.send({error: error});
          Loan.populate(oldLoanCopy, {path: "items.item", select: ITEM_FIELDS}, function(error, populatedOldLoan) {
            if (error) return res.send({error: error});
            Emailer.sendLoanChangeEmail(populatedOldLoan, newItems, req.user, function(error) {
              if (error) return res.send({error: error});
              Logger.logLoanEditing(populatedOldLoan, newItems, req.user, function(error){
                if (error) return res.send({error: error});
                return res.json(populatedLoan);
              })
            });
          });
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
          Instance.update(
            {_id: {$in: loan.items[index].instances}},
            {$set: {in_stock: true}},
            {multi: true},
            function(error) {
              if (error) return reject(error);
              resolve();
            }
          );
        })
      });
    });
  }));
}

function addDisbursePromises(returnPromises, loan, index){
  returnPromises.push(new Promise((resolve, reject) => {
    Instance.remove(
      {_id: {$in: loan.items[index].instances}},
      function(error) {
        if (error) return reject(error);
        resolve();
      }
    );
  }));
}
