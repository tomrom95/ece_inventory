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
        var message = "Successful import of "+ data.length + " item(s): ";
        data.forEach(function(item){
          message += "\""+item.name+"\" ";
        })
        return res.json({
          message: message
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
     var result = updateCustomFields(data.custom_fields, fieldArray, next);
     if(result.error) return next(result.error, null);
     data.custom_fields = result;
   }
   var item = new Item(data);
   item.save(function(err,item){
     if(err) return next(err,null);
     return next(null, item);//On successful import
   })
 });
};

var importMultipleItems = function(data, next){
  CustomField.find({}).then(function(fieldArray){
    var itemArray = [];
    for(var i in data){
      if(data[i].custom_fields){
          var result = updateCustomFields(data[i].custom_fields, fieldArray, next);
          if(result.error) return next(result.error, null);
          data[i].custom_fields = result;
        }
        itemArray.push(new Item(data[i]));
    }
    Item.insertMany(itemArray, function(err, items){
      console.log(err);
      if(err) return next(err,null);
      return next(null, items); // successfully inserted array
    })
  })
};

var updateCustomFields = function(enteredCustomFields, dataCustomFields, next){
  var draftCustomFieldArray = [];
  console.log(enteredCustomFields);
  console.log(dataCustomFields)
  for(var i in enteredCustomFields){
    var isMatch = false;
    for(var j in dataCustomFields){
          if(enteredCustomFields[i].name === dataCustomFields[j].name){
            isMatch = true;
            let draftField = {
              "field": dataCustomFields[j]._id,
              "value": enteredCustomFields[i].value
            }
            draftCustomFieldArray.push(draftField);
          }
      };
      if(!isMatch) return {error: "The entered custom field "+enteredCustomFields[i].name + " was not found in list of current custom fields"};
  }
  return draftCustomFieldArray;
}
