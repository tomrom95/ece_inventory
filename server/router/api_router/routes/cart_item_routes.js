'use strict';
var Cart = require("../../../model/carts");
var CartHelper = require("./cart_routes");
var QueryBuilder = require('../../../queries/querybuilder');
var itemFieldsToReturn = 'name model_number location description';

module.exports.postAPI = function (req, res){
  CartHelper.createCartIfNotExistent(req.user._id, res, function() {
  // API is /api/cart/items
  if(req.user.role === 'STANDARD' && req.body.user) return res.send({error: "You are not authorized to change the user field"});
  // If you are an admin/manager, then you can add items on behalf of other user.
  // i.e. Acknowledge and use the user field if it exists
  let intendedUserID = CartHelper.setAppropriateUserId(req, res);
  Cart.findOne({user: intendedUserID}, function(err, oldCart){
    if(err) return res.send({error:err});
    if(!req.body.item) return res.send({error: "No item id is entered"});
    if(!req.body.quantity) return res.send({error: "No quantity is entered"});
    let newItem = {
      item: req.body.item,
      quantity: req.body.quantity
    }
    var itemIndex = oldCart.items.findIndex(f=> f.item.equals(req.body.item));
    if(itemIndex >= 0) {
      // item exists already
      return res.send({error: "Item already exists in this cart"});
    } else {
      oldCart.items.push(newItem);
      oldCart.save(function(err, cart){
        if(err) return res.send({error: err});
        Cart.populate(cart,{path: "items.item", select: itemFieldsToReturn}, function(err, cart){
          res.json(cart);
        })
      })
    };
  });
});
};

module.exports.putAPI = function (req, res){
  CartHelper.createCartIfNotExistent(req.user._id, res, function() {
    let intendedUserID = CartHelper.setAppropriateUserId(req, res);
    Cart.findOne({user:intendedUserID}, function (err, cart){
      if(err) return res.send({error: err});
      if(!cart){
        return res.send({error: 'Cart does not exist'});
      } else {
        let itemIndex = cart.items.findIndex(f=> f.item.equals(req.params.item_id));
        if(itemIndex < 0) return res.send({error: "Item does not exist in this cart"});
        if(req.body.quantity) cart.items[itemIndex].quantity = req.body.quantity;
        cart.lastModified = new Date();
        cart.save((err, cart) => {
          if(err) return res.send({error: err});
          Cart.populate(cart,{path: "items.item", select: itemFieldsToReturn}, function(err, cart){
            res.json(cart);
          })
        });
      };
    });
  });
};

module.exports.deleteAPI = function(req,res){
  let intendedUserID = CartHelper.setAppropriateUserId(req, res);
  Cart.findOne({user:intendedUserID}, function (err, cart){
    if(err) return res.send({error: err});
    if(!cart){
      return res.send({error: 'Cart does not exist'});
    } else {
      let itemIndex = cart.items.findIndex(f=> f.item.equals(req.params.item_id));
      if(itemIndex < 0) return res.send({error: "Item does not exist in this cart"});
      cart.items.splice(itemIndex, 1);
      cart.lastModified = new Date();
      cart.save((err, cart) => {
        if(err) return res.send({error: err});
        res.json({message:"Deleted item successfully"});
      });
    }
  });
}
