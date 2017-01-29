'use strict';
var Request = require('../../../model/requests');
var mongoose = require('mongoose');

module.exports.getAPI = function (req, res) {
  // searchable by user_id, item_id, reason, created, quantity, status
  var reason = req.params.reason;
  var quantity = req.params.quantity;
  var status = req.params.status;
  var requestor_comment = req.params.requestor_comment;
  var reviewer_comment = req.params.reviewer_comment;

  var query = {};
  // An admin can GET all requests, but users can only get their requests
  if(!req.user.is_admin) query.user_id = mongoose.Types.ObjectId(req.user._id);
  if(req.params.item_id) query.item_id = mongoose.Types.ObjectId(req.params.item_id);
  if(reason) query.reason = {'$regex': reason, '$options':'i'};
  if(req.params.created) query.created = new Date(req.params.created);
  if(quantity) query.quantity = quantity;
  if(status) query.status = status;
  if(requestor_comment) query.requestor_comment = {'$regex': requestor_comment, '$option': 'i'};
  if(reviewer_comment) query.reviewer_comment = {'$regex': reviewer_comment, '$option': 'i'};
  Request.find(query, function(err, requests){
    if(err) return res.send({error:err});
    res.json(requests);
  });
};

module.exports.postAPI = function(req,res){
  var request = new Request();
  request.user_id = req.user._id;
  request.item_id = mongoose.Types.ObjectId(req.body.item_id);
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
  Request.findById(req.params.request_id, function(err,request){
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
  Request.findById(req.params.request_id, function(err,request){
    if(err) return res.send({error:err});
    if(!request) return res.send({error: 'Request does not exist'});
    else{
      request.remove(function(err){
        if(err) return res.send({error:err});
        res.json({message: 'Delete successful'});
      })
    }
  });
}
