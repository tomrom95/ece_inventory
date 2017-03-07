'use strict';
var Request = require('../../../model/requests');
var Item = require('../../../model/items');
var User = require('../../../model/users');
var Cart = require('../../../model/carts');
var mongoose = require('mongoose');
var QueryBuilder = require('../../../queries/querybuilder');
var Emailer = require('../../../emails/emailer');
var Logger = require('../../../logging/logger');
// fields within the item to return
var itemFieldsToReturn = 'name model_number description';
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
  } else {
    query.searchForObjectId('user', req.query.user);
  }

  query
  .searchBoolean('is_cancelled', false)
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
          processAndPost(request, req.user, user, req, res);
        });
      } else {
        // Post the user's requst as the admin user
        processAndPost(request, req.user, req.user, req, res);
      }
    } else {
      // Standard user here
      if(req.body.user && req.user._id != req.body.user){
        // If the user field is filled and the user id of the user doesn't match what's given in the field
        return res.send({error:"You are not authorized to modify another user's request"});
      }
      // Post the user's request as the standard user
      processAndPost(request, req.user, req.user, req, res);
    }

  }
};

function processAndPost(request, createdBy, createdFor, req, res){
  request.user = createdFor._id;
  if(!req.body.items || req.body.items.length === 0){
    return res.send({error: "Items not specified in request"});
  } else {
    request.items = req.body.items;
  }
  request.reason = req.body.reason;
  if(req.body.created) request.created = new Date(req.body.created);
  request.status = req.body.status;
  request.requestor_comment = req.body.requestor_comment;
  request.reviewer_comment = req.body.reviewer_comment;
  if(req.body.action === 'DISBURSEMENT') request.action = 'DISBURSEMENT';
  if(req.body.action === 'LOAN') request.action = 'LOAN';
  request.save(function(err, request){
    if(err) return res.send({error:err});
    Request.populate(request,{path: "items.item", select: itemFieldsToReturn}, function(err, request){
      Emailer.sendNewRequestEmail(request, createdBy, createdFor, function(error) {
        if (error) return res.send({error: error});
        Logger.logRequestCreation(request, createdBy, createdFor, function(error) {
          if (error) return res.send({error: error});
          return res.json(request);
        });
      });
    });
  });
};


module.exports.getAPIbyID = function(req, res){
  Request.findById(req.params.request_id)
  .populate('items.item', itemFieldsToReturn)
  .populate('user', 'username')
  .exec(function(err,request){
    if(err) return res.send({error:err});
    if(!request) return res.send({error: 'Request does not exist'});
    else if (req.user.role === 'STANDARD' && !request.user.equals(req.user._id)) {
      return res.send({error: "You cannot view another user's request"});
    }
    else{
      res.json(request);
    }
  });
};

module.exports.putAPI = function(req,res){
  Request.findById(req.params.request_id, function(err,request){
    if(err) return res.send({error:err});
    if(!request) return res.send({error: 'Request does not exist'});
    else if (request.status !== 'FULFILLED' && req.body.status === 'FULFILLED') {
      return res.send({error: 'You cannot fulfill a request through this endpoint. Use PATCH'});
    } else if (req.user.role === 'STANDARD' && String(req.user._id) !== String(request.user)) {
      return res.send({error: "You are not authorized to modify another user's request"});
    } else if (request.is_cancelled) {
      return res.send({error: "You cannot edit a cancelled request"});
    }
    else{
      var obj;
      var fieldsToEdit = new Set();
      if (String(req.user._id) === String(request.user)) {
        fieldsToEdit.add('reason')
      }
      if (req.user.role === 'MANAGER') {
        ['status', 'reviewer_comment', 'action']
        .forEach(field => fieldsToEdit.add(field));
      }
      if (req.user.role === 'ADMIN') {
        ['reason', 'status', 'user', 'items', 'created', 'requestor_comment', 'reviewer_comment', 'action']
        .forEach(field => fieldsToEdit.add(field));
      }
      // admins and managers can only edit reason if it's their own
      var changes = {};
      Array.from(fieldsToEdit).forEach(function(field) {
        if (req.body.hasOwnProperty(field)) {
          changes[field] = req.body[field];
        }
      });
      if (changes.user) {
        User.findById(changes.user, function(error, user) {
          if (error || !user) return res.send({error: 'There is no such user'});
          saveRequest(request, changes, res, req.user);
        });
      } else {
        saveRequest(request, changes, res, req.user);
      }
    }
  });
};

function saveRequest(oldRequest, changes, res, user){
  var oldRequestCopy = new Request(oldRequest);
  var obj = Object.assign(oldRequest, changes);
  obj.save((err,request)=>{
    if(err) return res.send({error:err});
    Request.populate(oldRequestCopy, {path: "items.item", select: itemFieldsToReturn}, function(error, populatedRequest){
      if(error) return res.send({error: error});
      Emailer.sendRequestChangeEmail(populatedRequest, changes, user, function(error) {
        if(error) return res.send({error: error});
        Logger.logRequestEdit(oldRequestCopy, changes, user, function(error) {
          if(error) return res.send({error: error});
          return res.json(request);
        });
      });
    });
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
        if (request.is_cancelled) {
          return res.send({error: "Request has already been cancelled"})
        }
        request.is_cancelled = true;
        request.save(function(error, updatedRequest) {
          if(error) return res.send({error: error});
          Request.populate(updatedRequest, {path: "items.item", select: itemFieldsToReturn}, function(error, request){
            if(error) return res.send({error: error});
            Emailer.sendCancelledRequestEmail(request, req.user, function(error) {
              if(error) return res.send({error: error});
              Logger.logCancelledRequest(request, req.user, function(error) {
                if(error) return res.send({error: error});
                res.json({message: 'Delete successful'});
              });
            });
          });
        });
      } else {
        res.json({error: "You are not authorized to remove this request"});
      }
    }
  });
};


function fulfill(requestID, next) {
  Request.findById(requestID, function(err, request) {
    if (err) return next(err);
    if (!request) return next('Request does not exist');
    if (request.status === 'FULFILLED') {
      return next('Request has already been fulfilled');
    }
    if (request.is_cancelled) {
      return next('You cannot fulfill a cancelled request');
    }
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
            if(request.action === "LOAN") {
              var loan = new Loan({
                user: updatedRequest.user,
                items: updatedRequest.items,
                request: updatedRequest._id,
              });
              loan.save(function(err, updatedLoan){
                if (err) return next(err);
                next(null, updatedRequest, updatedCart);
              })
            } else if (request.action === "DISBURSEMENT"){
              next(null, updatedRequest, updatedCart);
            }
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
  if (req.body.action == 'FULFILL') {
    fulfill(req.params.request_id, function(err, request, cart) {
      if (err) return res.send({error: err});
      Cart.populate(cart,{path: "items.item", select: itemFieldsToReturn}, function(err, cart){
        if (err) res.send({error: err});

        if(request.action === 'DISBURSEMENT'){
          Emailer.sendDisbursementEmail(request, cart, req.user, function(error) {
            if (error) return res.send({error: error});
            Logger.logDisbursement(request, cart, req.user, function(err) {
              if (err) return res.send({error: err});
              return res.json({
                message: 'Disbursement successful',
                request: request,
                items: cart
              });
            });
          });
        } else if (request.action === 'LOAN'){
          return res.json({
            message: 'Loan creation successful',
            // Should return loan
            request: request,
            items: cart
          });
        }
      })
    });
  } else {
    return res.send({error: "Action not recognized"});
  }
}
