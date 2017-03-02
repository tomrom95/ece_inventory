'use strict';
var Request = require('../../../model/requests');
var Item = require('../../../model/items');
var User = require('../../../model/users');
var CustomField = require('../../../model/customFields.js');
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
  var draftCustomFieldArray = [];
  getCustomFieldArayPromise(next).then(function(err, fieldArray)){
    for(var enteredField in data.custom_fields){
      var isMatch = false;
      for(var dataField in fieldArray){
          if(enteredField.name === dataField.name){
            isMatch = true;
            let draftField = {
              "field": dataField._id,
              "value": enteredField.value
            }
            draftCustomFieldArray.push(draftField);
          }
      }
      if(!isMatch) return next(enteredField.name + " was not found in list of current custom fields");
    }
  });
}

var getCustomFieldArrayPromise = function(next){
  return CustomField.find({});
};
