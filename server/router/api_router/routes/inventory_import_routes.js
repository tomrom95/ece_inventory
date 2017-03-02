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
  getCustomFieldArrayPromise(data.custom_fields, next);
}

var getCustomFieldArrayPromise = function(customFieldData, next){
  var draftCustomFieldArray = [];

   CustomField.find({}).then(function(err, fieldArray){
    for(var enteredField in customFieldData){
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
};
