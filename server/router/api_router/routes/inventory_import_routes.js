'use strict';
var Request = require('../../../model/requests');
var Item = require('../../../model/items');
var Instance = require('../../../model/instances');
var User = require('../../../model/users');
var CustomField = require('../../../model/customFields.js');
var CustomFieldHelpers = require('../../../customfields/custom_field_helpers');
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

var autoCreateInstances = function(quantity, itemID, importId, next, inStock=true) {
  var instances = new Array(quantity);
  for (var i = 0; i < quantity; i++) {
    var newInstance = new Instance({item: itemID, in_stock: inStock});
    instances[i] = newInstance;
  }
  Instance.insertMany(instances, next);
}

var importSingleItem = function(data, next) {
  if(data.quantity && data.instances && data.instances.length !== 0) return next("Cannot specify both quantity and instances at the same time", null);
  CustomField.find({}).then(function(fieldArray){
   if(data.custom_fields){
     var result = updateCustomFields(data.custom_fields, fieldArray, false, next);
     if(result.error) return next(result.error, null);
     data.custom_fields = result;
   }
   let importId = mongoose.Types.ObjectId();
   data.import_id = importId;
   // Set quantity if quantity field is not specified
   let instances = data.instances;
   let quantityNotSpecified = data.quantity === undefined || data.quantity === null;
   if(quantityNotSpecified) data.quantity = instances.length;
   delete data.instances;
   var item = new Item(data);
   item.save(function(err,item){
     if(err) return next(err,null);
     // Instances are created here as they require the item to be inserted first
     if(quantityNotSpecified){
       importInstances(instances, item._id, importId, function(err, instances){
         return err ? rollBackAll(importId, err, next) : next(null, item);
       })
     } else {
       autoCreateInstances(data.quantity, item._id, importId, function(err, instances){
         return err ? rollBackAll(importId, err, next) : next(null, item);
       })
     }
   })
 });
};

var importInstances = function(instancesData, itemId, importId, next){
  CustomField.find({}).then(function(fieldArray){
    console.log(fieldArray);
    var instancesArray = [];
    for(var i in instancesData){
      if(instancesData[i].custom_fields){
        var result = updateCustomFields(instancesData[i].custom_fields, fieldArray, true, next);
        if(result.error) return next(result.error, null);
        instancesData[i].custom_fields = result;
      }
      instancesData[i].import_id = importId;
      instancesData[i].item = itemId;
      instancesArray.push(new Instance(instancesData[i]));
    }
    Instance.insertMany(instancesArray, function(err, instances){
      console.log(err);
      console.log(instances);
      if(err){
        rollBackAll(importId, err, next);
      } else {
        next(null, instances);
      }
    })
  });
}

var importMultipleItems = function(data, next){
  CustomField.find({}).then(function(fieldArray){
    var itemArray = [];
    var quantityNotSpecifiedArray = [];
    var instancesDataArray = [];
    let importId = mongoose.Types.ObjectId();
    for(var i in data){
      if(data[i].custom_fields){
          var result = updateCustomFields(data[i].custom_fields, fieldArray, false, next);
          if(result.error) return next(result.error, null);
          data[i].custom_fields = result;
      }
      console.log("hit");
      data[i].import_id = importId;
      // Set quantity if quantity field is not specified
      instancesDataArray.push(data[i].instances);
      let instances = data[i].instances;
      delete data[i].instances;
      let quantityNotSpecified = data[i].quantity === undefined || data[i].quantity === null;
      if(quantityNotSpecified) data[i].quantity = instances.length;
      quantityNotSpecifiedArray.push(quantityNotSpecified);
      console.log(instancesDataArray);
      console.log(quantityNotSpecifiedArray);
      itemArray.push(new Item(data[i]));
    }
    Item.insertMany(itemArray, function(err, items){
      if(err){
        // Rollback
        Item.remove({import_id: importId}, function(rollBackErr){
          return rollBackErr ? next(rollBackErr, null) : next(err,null);
        })
      } else {
        // Insert all instances here
        for(var i in instancesDataArray){
          // validate custom fields
          if(instancesDataArray[i].custom_fields){
            var result = updateCustomFields(instancesDataArray[i].custom_fields, fieldArray, true, next);
            if(result.error) return next(result.error, null);
            instancesDataArray[i].custom_fields = result;
          }
          if(quantityNotSpecifiedArray[i]){
            importInstances(instancesDataArray[i], items[i]._id, importId, function(err, instances){
              if(err) rollBackAll(importId, err, next);
            })
          } else {
            autoCreateInstances(items[i].quantity, items[i]._id, importId, function(err, instances){
              if(err) rollBackAll(importId, err, next);
            });
          }
        }
        return next(null, items); // successfully inserted both items and instances
      }
    })
  })
};

var rollBackAll = function(importId, err, next){
  Item.remove({import_id: importId}, function(rollBackErr){
    if(rollBackErr) next(rollBackErr, null);
      Instance.remove({import_id: importId}, function(rollBackErr){
        rollBackErr ? next(rollBackErr, null) : next(err,null);
      });
  })
}

var updateCustomFields = function(enteredCustomFields, dataCustomFields, perInstance, next){
  var draftCustomFieldArray = [];
  for(var i in enteredCustomFields){
    var isMatch = false;
    for(var j in dataCustomFields){
          if(enteredCustomFields[i].name === dataCustomFields[j].name){
            isMatch = true;
            let draftField = {
              "field": dataCustomFields[j]._id,
              "value": enteredCustomFields[i].value
            }
            if (!CustomFieldHelpers.validateSingleField(draftField, dataCustomFields[j], perInstance)) {
              return {error: "The entered custom field "+enteredCustomFields[i].name + " has a value "+ enteredCustomFields[i].value +" not matching type " + dataCustomFields[j].type};
            }
            draftCustomFieldArray.push(draftField);
          }
      };
      if(!isMatch) return {error: "The entered custom field "+enteredCustomFields[i].name + " was not found in list of current custom fields"};
  }
  return draftCustomFieldArray;
}
