'use strict';
var Cart = require("../../../model/carts");
var QueryBuilder = require('../../../queries/querybuilder');
var itemFieldsToReturn = 'name model_number location description';

module.exports.postAPI = function (req, res){
  // API is /api/cart/items
  // If you are an admin/manager, then you can add items on behalf of other user.
  // i.e. Acknowledge and use the user field if it exists
  if(req.user.role !== 'STANDARD' && req.body.user && req.user._id != req.body.user)

};
