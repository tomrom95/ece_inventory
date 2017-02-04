'use strict';
var Request = require('../../../model/requests');
var Item = require('../../../model/items');
var mongoose = require('mongoose');
var itemFieldsToReturn = 'name model_number location description';

module.exports.getAPI = function (req, res) {
  // searchable by user, item_id, reason, created, quantity, status
  var reason = req.query.reason;
  var quantity = req.query.quantity;
  var status = req.query.status;
  var requestor_comment = req.query.requestor_comment;
  var reviewer_comment = req.query.reviewer_comment;

  var query = {};
  // An admin can GET all requests, but users can only get their requests
  if(!req.user.is_admin) query.user = mongoose.Types.ObjectId(req.user._id);
  if(req.query.item_id) query.item = mongoose.Types.ObjectId(req.query.item_id);
  if(reason) query.reason = {'$regex': reason, '$options':'i'};
  if(req.query.created) query.created = new Date(req.query.created);
  if(quantity) query.quantity = quantity;
  if(status) query.status = {'$regex': status, '$options': 'i'};
  if(requestor_comment) query.requestor_comment = {'$regex': requestor_comment, '$options': 'i'};
  if(reviewer_comment) query.reviewer_comment = {'$regex': reviewer_comment, '$options': 'i'};
  Request.find(query)
    .populate('item', itemFieldsToReturn)
    .populate('user', 'username')
    .exec(function(err, requests){
      if(err) return res.send({error:err});
      res.json(requests);
  });
};

module.exports.postAPI = function(req,res){
  var request = new Request();
  if(!req.user._id) {
    return res.send({error: "User ID null"})
  }  else {
    request.user = req.user._id;
  }
  if(!req.body.item_id && !req.body.item) {
    return res.send({error: "Item ID null"});
  } else {
    if(req.body.item) request.item = mongoose.Types.ObjectId(req.body.item);
    else if(req.body.item_id) request.item = mongoose.Types.ObjectId(req.body.item_id);
  }
  request.reason = req.body.reason;

  if(req.body.created) request.created = new Date(req.body.created);
  request.quantity = req.body.quantity;
  request.status = req.body.status;
  request.requestor_comment = req.body.requestor_comment;
  request.reviewer_comment = req.body.reviewer_comment;
  request.save(function(err){
    if(err) return res.send({error:err});
    res.json(request);
  })
};

module.exports.getAPIbyID = function(req, res){
  Request.findById(req.params.request_id)
         .populate('item', itemFieldsToReturn)
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
      Object.assign(request, req.body).save((err,request)=>{
        if(err) return res.send({error:err});
        res.json(request);
      })
    }
  });
};

module.exports.deleteAPI = function(req,res){
  // Non-admin users can only delete their own requests.
  Request.findById(req.params.request_id, function(err,request){
    if(err) return res.send({error:err});
    if(!request) return res.send({error: 'Request does not exist'});
    else{
      // If id of current user matches the one in the request, or user is an admin
      if(req.user._id.toString() == request.user_id.toString() || req.user.is_admin){
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

function disperse(requestID, next) {
  Request.findById(requestID, function(err, request) {
    if (err) return next(err);
    if (!request) return next('Request does not exist');
    Item.findById(request.item, function(err, item) {
      if (item.quantity < request.quantity) {
        return next('Insufficient quantity');
      }
      item.quantity -= request.quantity;
      item.save(function(err, updatedItem) {
        if (err) return next(err);
        if (!updatedItem) return next('Item does not exist');

        // Only update request if item quantity change was successful.
        // This prevents a request from being fulfilled if there isn't enough
        // of a certain item to disburse.
        request.status = "FULFILLED";
        request.save(function(err, updatedRequest) {
          next(null, updatedRequest, updatedItem);
        });
      });
    });
  });
}

module.exports.patchAPI = function(req, res) {
  if (req.body.action == 'DISBURSE') {
    disperse(req.params.request_id, function(err, request, item) {
      if (err) return res.send({error: err});
      res.json({
        message: 'Disbursement successful',
        request: request,
        item: item
      });
    });
  }
}
