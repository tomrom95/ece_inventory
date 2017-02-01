var mongoose = require('mongoose');
let Item = require('../server/model/items');
var User = require('../server/model/users');
var demoJSONData = require('../test/api/demo_inventory_data');

mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');
User.findOne({'username': 'admin'}, function(err, user) {
  Item.remove({}, (err)=> {
    console.log(err);
    Item.insertMany(demoJSONData).then(function(obj){
      console.log(obj);
      process.exit();
    });
  });
});
