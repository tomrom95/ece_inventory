'use strict';
var Cart = require("../../../model/carts");
var Request = require("../../../model/requests");
var QueryBuilder = require('../../../queries/querybuilder');
var itemFieldsToReturn = 'name model_number location description';

module.exports.getAPI = function (req, res) {
  createCartIfNotExistent(req.user._id, res, returnCart);
};

var createCartIfNotExistent = function(user_id, res, next){
  Cart.findOne({user:user_id}, function(err, cart){
    if(err) return res.send({error:error});
    if(!cart){
      var cart = new Cart({
        user: user_id
      });
      return cart.save().then(function(value){
        next(user_id, res);
      })
      .catch(function(err){
        if(err) return res.send({error:err});
      });
    } else {
      // Cart already exists
      next(user_id, res);
    }
  });
};
module.exports.createCartIfNotExistent = createCartIfNotExistent;

var returnCart = function (user_id, res){
  var query = new QueryBuilder();
  query.searchForObjectId('user', user_id);
  Cart.findOne(query.toJSON())
  .populate('items.item', itemFieldsToReturn)
  .exec(function(err, cart){
    if(err) return res.send({error: err});
    res.json(cart);
  });
}

var setAppropriateUserId = function(req, res) {
  return           (req.user.role !== 'STANDARD' &&
                    req.body.user &&
                    req.user._id != req.body.user) ?
                    // If you are admin and the user field exists and is not you
                    req.body.user :
                    // Everyone else uses their own user id
                    req.user._id;
}
module.exports.setAppropriateUserId = setAppropriateUserId;

module.exports.putAPI = function(req,res){
  createCartIfNotExistent(req.user._id, res, function() {
    if(req.user.role === 'STANDARD' && req.body.user) return res.send({error: "You are not authorized to change the user field"});
    var intendedUserID = setAppropriateUserId(req, res);
    Cart.findOne({user: intendedUserID}, function(err, oldCart){
      if(err) return res.send({error:err});
      // If the admin enters items field
      oldCart.user = intendedUserID;
      if(req.user.role !== 'ADMIN' && req.body.items) return res.send({error: "You are not authorized to change the items field"});
      oldCart.items = (req.user.role === 'ADMIN' && req.body.items) ?
                      // Use items if you are an admin and it exists
                      req.body.items :
                      oldCart.items;

      oldCart.description = (req.body.description) ?
                        // Use the body description if it exists
                        req.body.description :
                        oldCart.description;
      oldCart.lastModified = new Date();
      oldCart.save(function(err, cart){
        if(err) return res.send({error:err});
        Cart.populate(cart,{path: "items.item", select: itemFieldsToReturn}, function(err, cart){
          res.json(cart);
        })
      });
    });
  });
};

module.exports.patchAPI = function(req, res){
  if (req.body.action == 'CHECKOUT') {
    checkout(req.user._id, req.body.reason, function(err, request){
      if (err) return res.send({error: err});
      // populate cart items in cart object
        res.json({
          message: 'Request successful',
          request: request
        });
    });
  } else {
    return res.send({error: "Action not recognized"});
  }
}
function checkout (userID, reasonString, next) {
  if(!reasonString) return next('Reason not provided in checkout');
  Cart.findOne({user: userID}, function(err, cart){
    if (err) return next(err);
     // Create Request
     var request = new Request({
       user: userID,
       reason: reasonString,
       status: 'PENDING'
     });
     // Copy array of items
     request.items = [];
     cart.items.forEach(function(item){
       var itemCopy = Object.assign(item, {_id: undefined}); // ID field not copied
       request.items.push(itemCopy);
     })
     request.save(function(err, request){
       if (err) return next(err);
       // populate cart items in requests object
       Cart.populate(request,{path: "items.item", select: itemFieldsToReturn}, function(err, cart){
         // Delete cart, and put in a new one
         Cart.remove({user: userID}, function(err){
           if(err) return next(err);
           var newCart = new Cart({user: userID});
           newCart.save(function(err){
             if(err) return next(err);
             next(null, request);
           })
         })
       })
     })
  })
}
