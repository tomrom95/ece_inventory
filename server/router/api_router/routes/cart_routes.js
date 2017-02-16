'use strict';
var Cart = require("../../../model/carts");
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


module.exports.putAPI = function(req,res){
  createCartIfNotExistent(req.user._id, res, function() {
    var intendedUserID;
    if(req.user.role !== 'ADMIN' && req.body.user) return res.send({error: "You are not authorized to change the user field"});
    intendedUserID = (req.user.role === 'ADMIN' &&
                      req.body.user &&
                      req.user._id != req.body.user) ?
                      // If you are admin and the user field exists and is not you
                      req.body.user :
                      // Everyone else uses their own user id
                      req.user._id;

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
      oldCart.save(function(err, cart){
        if(err) return res.send({error:err});
        res.json(cart);
      });
    });
  });


};
