'use strict';
var Request = require('../../../model/requests');
var Item = require('../../../model/items');
var User = require('../../../model/users');
var Cart = require('../../../model/carts');
var mongoose = require('mongoose');
var QueryBuilder = require('../../../queries/querybuilder')
// fields within the item to return
var itemFieldsToReturn = 'name model_number location description';
var userFieldsToReturn = 'username netid first_name last_name';
module.exports.getAPI = function (req, res) {
  // searchable by user, item_id, reason, created, status
  var reason = req.query.reason;
  var status = req.query.status;
  var requestor_comment = req.query.requestor_comment;
  var reviewer_comment = req.query.reviewer_comment;

  var query = new QueryBuilder();

  // An admin can GET all requests, but users can only get their requests
  if(req.user.role === 'STANDARD') {
    query.searchForObjectId('user', req.user._id);
  }

  query
  .searchInArrayForObjectId('items', 'item', req.query.item_id)
  .searchCaseInsensitive('reason', req.query.reason)
  .searchForDate('created', req.query.created)
  .searchExact('status', req.query.status)
  .searchCaseInsensitive('requestor_comment', req.query.requestor_comment)
  .searchCaseInsensitive('reviewer_comment', req.query.reviewer_comment)

  if(req.query.page && req.query.per_page && !isNaN(req.query.per_page)){
    let paginateOptions = {
      // page number (not offset)
      page: req.query.page,
      limit: Number(req.query.per_page),
      populate: [{path:'items.item', select: itemFieldsToReturn}, {path:'user', select: userFieldsToReturn}]
    }
    Request.paginate(query.toJSON(), paginateOptions, function(err, obj){
      if(err) return res.send({error: err});
      res.json(obj.docs);
    });
  } else {
    Request.find(query.toJSON())
    .populate('items.item', itemFieldsToReturn)
    .populate('user', userFieldsToReturn)
    .exec(function(err, requests){
      if(err) return res.send({error:err});
      res.json(requests);
    });
  };
};

module.exports.postAPI = function(req,res){
  var request = new Request();
  if(!req.user._id) {
    return res.send({error: "User ID null"})
  } else {

    if(req.user.role === 'ADMIN' || req.user.role === 'MANAGER'){
      // if user is admin, find user id if the user field is entered
      if(req.body.user){
        // set user id to .user field
        User.findById(req.body.user, function(error, user) {
          if (error) return res.send({error: error});
          if (!user) return res.send({error: "There is no such user"});
          request.user = req.body.user;
          processAndPost(request, req, res);
        });
      } else {
        // Post the user's requst as the admin user
        request.user = req.user._id;
        processAndPost(request, req, res);
      }
    } else {
      // Standard user here
      if(req.body.user && req.user._id != req.body.user){
        // If the user field is filled and the user id of the user doesn't match what's given in the field
        return res.send({error:"You are not authorized to modify another user's request"});
      }
      // Post the user's request as the standard user
      request.user = req.user._id;
      processAndPost(request, req, res);
    }

  }
};

function processAndPost(request, req, res){
  if(!req.body.items.length){
    return res.send({error: "Items not specified in request"});
  } else {
    request.items = req.body.items;
  }
  request.reason = req.body.reason;
  if(req.body.created) request.created = new Date(req.body.created);
  request.status = req.body.status;
  request.requestor_comment = req.body.requestor_comment;
  request.reviewer_comment = req.body.reviewer_comment;
  request.save(function(err, request){
    if(err) return res.send({error:err});
    Request.populate(request,{path: "items.item", select: itemFieldsToReturn}, function(err, request){
      res.json(request);
    })
  });
};


module.exports.getAPIbyID = function(req, res){
  Request.findById(req.params.request_id)
  .populate('items.item', itemFieldsToReturn)
  .populate('user', 'username')
  .exec(function(err,request){
    if(err) return res.send({error:err});
    if(!request) return res.send({error: 'Request does not exist'});
    else{
      res.json(request);
    }
  });
};

module.exports.putAPI = function(req,res){
  Request.findById(req.params.request_id, function(err,request){
    if(err) return res.send({error:err});
    if(!request) return res.send({error: 'Request does not exist'});
    else{
      var obj;
      if(req.user.role === 'STANDARD'){
        // if the current user's id is not equal to the user id in the request, or if the current user id is not equal
        // to the user id in the PUT body
        if(req.user._id != request.user || req.user._id != req.body.user){
          // Standard user cannot modify the user_id
          return res.send({error: "You are not authorized to modify another user's request"});
        } else {
          // Standard user must keep its id in its own request.
          obj = Object.assign(request, req.body);
          obj.user = req.user._id;
          saveObject(obj, res);
        }
      } else {
        // Admin can take in username
        obj = Object.assign(request, req.body);
        if(req.body.user){
          User.findById(req.body.user, function(error, user) {
            if (error) return res.send({error: error});
            if (!user) return res.send({error: "There is no such user"});
            obj.user = req.body.user;
            saveObject(obj, res);
          });
        } else {
          saveObject(obj, res);
        }
      }
    }
  });
};

function saveObject(obj, res){
  obj.save((err,request)=>{
    if(err) return res.send({error:err});
    res.json(request);
  });
}

module.exports.deleteAPI = function(req,res){
  // Non-admin users can only delete their own requests.
  Request.findById(req.params.request_id, function(err,request){
    if(err) return res.send({error:err});
    if(!request) return res.send({error: 'Request does not exist'});
    else{
      // If id of current user matches the one in the request, or user is an admin
      if(req.user._id.toString() == request.user.toString() || req.user.role === 'ADMIN' || req.user.role == 'MANAGER'){
        request.remove(function(err){
          if(err) return res.send({error:err});
          res.json({message: 'Delete successful'});
        });
      } else {
        res.json({error: "You are not authorized to remove this request"});
      }
    }
  });
};

function disburse(requestID, next) {
  Request.findById(requestID, function(err, request) {
    if (err) return next(err);
    if (!request) return next('Request does not exist');

    var checkQuantityPromises = [];
    for (var i = 0; i < request.items.length; i++){
      // Pass down index i into the closure for async call
      (function(i){
        // Push each promise to an array
        checkQuantityPromises.push(new Promise((resolve, reject) => {
          Item.findById(request.items[i].item, function(err, item) {
            if(err) return next(err);
            // Check that all items have sufficient quantity
            if (item.quantity < request.items[i].quantity) {
              return next('Insufficient quantity of item: '+item.name);
            }
            resolve();
          });
        }));
      })(i);

    }
    // Resolve array of promises sequentially
    Promise.all(checkQuantityPromises).then(function(obj) {
      // returned
      var updatedCart = [];
      var disbursePromises = [];
      for (var i = 0; i < request.items.length; i++){
        // Pass down index i into the closure for async call
        (function(i){
          disbursePromises.push(new Promise((resolve, reject) => {
            Item.findById(request.items[i].item, function(err, item) {
              item.quantity -= request.items[i].quantity;
              item.save(function(err, updatedItem) {
                if (err) return next(err);
                if (!updatedItem) return next('Item does not exist');
                Item.populate(updatedItem,{path: "item", select: itemFieldsToReturn}, function(err, item){
                  updatedCart.push(updatedItem);
                  resolve();
                })
              });
            });
          }))
        })(i);

      }
      Promise.all(disbursePromises).then(function(){
        // Only update request if item quantity change was successful.
        // This prevents a request from being fulfilled if there isn't enough
        // of a certain item in the cart to disburse.
        request.status = "FULFILLED";
        request.save(function(err, updatedRequest) {
          if (err) return next(err);
          next(null, updatedRequest, updatedCart);
        });
      }, function(err){
        return next(err);
      });
    }, function(err){
      return next(err);
    });
  });
}

module.exports.patchAPI = function(req, res) {
  if (req.body.action == 'DISBURSE') {
    disburse(req.params.request_id, function(err, request, cart) {
      if (err) return res.send({error: err});
      Cart.populate(cart,{path: "items.item", select: itemFieldsToReturn}, function(err, cart){
        res.json({
          message: 'Disbursement successful',
          request: request,
          items: cart
        });
      })
    });
  } else {
    return res.send({error: "Action not recognized"});
  }
}
