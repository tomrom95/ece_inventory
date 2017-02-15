'use strict';
var Cart = require("../../../model/cart");
var QueryBuilder = require('../../../queries/querybuilder');
var itemFieldsToReturn = 'name model_number location description';

module.exports.getAPI = function (req, res) {
    createCartIfNotExistent(req.user._id);
    var query = new QueryBuilder();
    query.searchForObjectId('user', req.user._id);
    Cart.findOne(query.toJSON())
        .populate('item', itemFieldsToReturn)
        .exec(function(err, cart){
            if(err) return res.send({error: err});
            res.json(cart);
        });
};

module.exports.putAPI = function(req,res){
  var obj = {};
  var intendedUserID;
  intendedUserID = (req.user.role === 'ADMIN' &&
                    req.body.user &&
                    req.user._id != req.body.user) ?
                    // If you are admin and the user field exists and is not you
                    req.body.user :
                    // Everyone else uses their own user id
                    req.user._id;
  obj.user = intendedUserID;

  Cart.findOne({user: intendedUserID}, function(err, oldCart){
      if(err) return res.send({error:err});
      // If the admin enters items field
      obj.items = (req.user.role === 'ADMIN' && req.body.items) ?
                  // Use items if you are an admin and it exists
                   req.body.items :
                   oldCart.items;
     obj.description = (req.body.description) ?
                      // Use the body description if it exists
                       req.body.description :
                       oldCart.description;
     obj.save(function(err, cart)=>{
       if(err) return res.send({error:err});
       res.json(cart);
     });
    });
  };

var createCartIfNotExistent = function(user_id){
  Cart.insert({user: user_id})
      .then(function(value){
        console.log("Successfully created cart for user "+user_id);
        return;
      })
      .catch(function(error){
        return res.send({error:error});
      })
};
