// Generation of inventory items for insertManyItems method (in addition to existing JSON items in demo data file).
var willInsertManyItems = true;
var itemQuantity = 1000;

var mongoose = require('mongoose');
let Item = require('../server/model/items');
var User = require('../server/model/users');
var demoJSONData = require('../test/api/demo_inventory_data');

mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');
User.findOne({'username': 'admin'}, function(err, user) {
  Item.remove({}, (err)=> {
    // JSON Data with different field values will be inserted
    Item.insertMany(demoJSONData).then(function(obj){
      console.log("Successful insert from demo inventory data file");
      if(willInsertManyItems){
        // A set of N items will then be added to test pagination and show more item entries.
        insertManyItems(itemQuantity, function(){
         process.exit();
       });
     } else {
       process.exit();
      }
    });
  });
});

var insertManyItems = function(quantity, callback){
  var itemArray = [];
  let item = {
    "location": "HUDSON",
    "quantity": 1000,
    "has_instance_objects": false,
    "vendor_info": "Qualcomm",
    "tags": [
      "component",
      "electric",
    ],
    "instances": [
      {
        "serial_number": "11111",
        "status": "IN_USE",
        "condition": "GOOD"
      }
    ]
  };
  for(i = 0; i<quantity; i++){
    var item_copy = JSON.parse(JSON.stringify(item));
    item_copy.name = (i + 1) +" V Function Generator";
    item_copy.tags.push((i%3==0) ? "heavy" : "large");
    item_copy.tags.push((i%2==0) ? "white" : "maroon");
    itemArray.push(item_copy);
  }
  Item.insertMany(itemArray).then(function(obj){
    console.log("Successful insert for "+quantity+" inventory items (insertManyItems())");
    callback();
  })
}

module.exports.insertManyItems = insertManyItems;
