'use strict';
var Request = require('../../../model/requests');
var Item = require('../../../model/items');
var User = require('../../../model/users');
var CustomField = require('../../../model/customFields.js');
var mongoose = require('mongoose');

module.exports.postAPI = function (req, res) {
    if(req.body === undefined || req.body === null) return res.send({error: "Null or undefined body"});
    if(req.body instanceof Array){
      importMultipleItems(req.body, function(err, data){
        if(err) return res.send({error:err});
        return res.json({
          message: "Successful import of "+ data.length + " items"
        });
      });
    } else {
      importSingleItem(req.body, function(err, data){
        if(err) return res.send({error:err});
        return res.json({
          message: "Successful import of item "+ data.name
        });
      });
    }
};

var importSingleItem = function(data, next) {
  CustomField.find({}).then(function(fieldArray){
   if(data.custom_fields){
     data.custom_fields = updateCustomFields(data.custom_fields, fieldArray, next);
   }
   var item = new Item(data);
   item.save(function(err,item){
     if(err) return next(err);
     return next(null, item);//On successful import
   })
 });
};

var importMultipleItems = function(data, next){
  CustomField.find({}).then(function(fieldArray){
    var itemArray = [];
    data.forEach(function(item){
      if(item.custom_fields){
        item.custom_fields = updateCustomFields(item.custom_fields, fieldArray, next);
      }
      itemArray.push(new Item(item));
    });
    Item.insertMany(itemArray, function(err, items){
      console.log(err);
      if(err) return next(err);
      return next(null, items); // successfully inserted array
    })
  });
}

var updateCustomFields = function(enteredCustomFields, dataCustomFields, next){
  var draftCustomFieldArray = [];
  console.log(enteredCustomFields);
  console.log(dataCustomFields)
  enteredCustomFields.forEach(function(enteredField){
   var isMatch = false;
   dataCustomFields.forEach(function(dataField){
       if(enteredField.name === dataField.name){
         isMatch = true;
         let draftField = {
           "field": dataField._id,
           "value": enteredField.value
         }
         draftCustomFieldArray.push(draftField);
       }
   });
   if(!isMatch){
     return next("The entered custom field "+enteredField.name + " was not found in list of current custom fields");
   }
  });
  return draftCustomFieldArray;
}
