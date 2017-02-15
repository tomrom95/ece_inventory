'use strict';
var Cart = require("../../../model/cart");
var QueryBuilder = require('../../../queries/querybuilder');
var itemFieldsToReturn = 'name model_number location description';

module.exports.getAPI = function (req, res) {
    // Admin only - get all carts
      Cart.find()
          .populate('item', itemFieldsToReturn)
          .exec(function(err, cart){
            if(err) return res.send({error: err});
            res.json(cart);
          });
};
