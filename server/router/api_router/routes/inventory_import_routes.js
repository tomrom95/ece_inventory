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

var autoCreateInstances = function(quantity, itemID, importId, next) {
  var instances = new Array(quantity);
  for (var i = 0; i < quantity; i++) {
    var newInstance = new Instance({item: itemID, in_stock: true});
    instances[i] = newInstance;
  }
  Instance.insertMany(instances, next);
}

var importSingleItem = function(data, next) {
  CustomField.find({}).then(function(fieldArray){
   if(data.custom_fields){
     var result = updateCustomFields(data.custom_fields, fieldArray, false, next);
     if(result.error) return next(result.error, null);
     data.custom_fields = result;
   }
   let instances = data.instances;
   delete data.instances;
   var item = new Item(data);
   item.save(function(err,item){
     if(err) return next(err,null);

     // 
    //  // If specify quantity, then autoCreate all
    //  // Otherwise instances array specifies quantity of item
    //
    //  if(instances && instances.length === item.quantity){
    //    // Call importInstances
     //
    //
    //  } else {
    //    // Handle cases where they specify more instances than quantity or less
    //    autoCreateInstances(item.quantity, item._id, null, )
    //    // auto generate
     //
    //  }
     return next(null, item);//On successful import
   })
 });
};

var importInstances = function(instancesData, next){
  CustomField.find({}).then(function(fieldArray){
    var instancesArray = [];
    let importId = mongoose.Types.ObjectId();
    for(var i in instancesData){
      if(instancesData[i].custom_fields){
        var result = updateCustomFields(data[i].custom_fields, fieldArray, true, next);
        if(result.error) return next(result.error, null);
        instancesData[i].custom_fields = result;
      }
      instancesData[i].import_id = importId;
      instancesArray.push(new Instance(instancesData[i]));
    }
    Instances.insertMany(instancesArray, function(err, instances){
      if(err){
        // Rollback
        Instances.remove({import_id: importId}, function(rollBackErr){
          return rollBackErr ? next(rollBackErr, null) : next(err,null);
        })
      } else {
        return next(null, instances); // successfully inserted array
      }
    })
  });
}

var importMultipleItems = function(data, next){
  CustomField.find({}).then(function(fieldArray){
    var itemArray = [];
    let importId = mongoose.Types.ObjectId();
    for(var i in data){
      if(data[i].custom_fields){
          var result = updateCustomFields(data[i].custom_fields, fieldArray, false, next);
          if(result.error) return next(result.error, null);
          data[i].custom_fields = result;
      }
      data[i].import_id = importId;
      // TODO: Remove the instances array field
      itemArray.push(new Item(data[i]));
    }
    Item.insertMany(itemArray, function(err, items){
      if(err){
        // Rollback
        Item.remove({import_id: importId}, function(rollBackErr){
          return rollBackErr ? next(rollBackErr, null) : next(err,null);
        })
      } else {
        return next(null, items); // successfully inserted array
      }
    })
  })
};

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
