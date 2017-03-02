'use strict';
var Request = require('../../../model/requests');
var Item = require('../../../model/items');
var User = require('../../../model/users');
var mongoose = require('mongoose');

module.exports.postAPI = function (req, res) {
    // Check if req.body exists, non-null

    // Check if object or array
    if(req.body instanceof Array){
      // Also need to Log successful completion of import
    } else {

    }
};

var importData = function(data, next) {
  // resolveCustomFields.then()

}


var resolveCustomFields = function(customFieldArray, next){
  // generateCustomFieldPromisesArray()

  // return Promise.all()
};

var generateCustomFieldPromisesArray = function(customFieldArray, next){
  // return array of CustomFieldPromises
};
