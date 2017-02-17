'use strict';
var Cart = require("../../../model/carts");
var CartHelper = require("./cart_routes");
var QueryBuilder = require('../../../queries/querybuilder');
var itemFieldsToReturn = 'name model_number location description';

module.exports.postAPI = function (req, res){
  // API is /api/cart/items
  if(req.user.role === 'STANDARD' && req.body.user) return res.send({error: "You are not authorized to change the user field"});
  // If you are an admin/manager, then you can add items on behalf of other user.
  // i.e. Acknowledge and use the user field if it exists
  var intendedUserID = CartHelper.setAppropriateUserId(req, res);
  Cart.findOne({user: intendedUserID}, function(err, oldCart){
    if(err) return res.send({error:err});
    oldCart.user = intendedUserID;
    if(!req.body.item) return res.send({error: "No item id is entered"});
    if(!req.body.quantity) return res.send({error: "No quantity is entered"});
    let newItem = {
      item: req.body.item,
      quantity: req.body.quantity
    }
    oldCart.update({user: intendedUserID},
                   {$addToSet: {items: newItem}},
                   function(err, obj){
          if(err) return res.send({error:err});
          Cart.findOne({user: intendedUserID})
              .populate('items.item', itemFieldsToReturn)
              .exec(function(err, cart){
                if(err) return res.send({error:err});
                res.json(cart);
          });
    });
  });
};
