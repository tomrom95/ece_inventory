var mongoose = require('mongoose');
let Item = require('../server/model/items');
let Request = require('../server/model/requests');
var User = require('../server/model/users');
var fakeJSONData = require('../test/api/test_requests_data');

mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');

User.findOne({'username': 'admin'}, function(err, user) {
  Item.findOne({'name':'1k resistor'}, function(err,item_one){
    item_one_id = item_one._id;
    Item.findOne({'name':'2k resistor'}, function(err, item_two){
      item_two_id = item_two._id;
      for (var i = 0; i < fakeJSONData.length; i++) {
        if (i%2 == 0) {
          fakeJSONData[i].item = item_one_id;
          fakeJSONData[i].user = user._id;
        } else {
          fakeJSONData[i].item = item_two_id;
          fakeJSONData[i].user = user._id;
        }
      }
      Request.insertMany(fakeJSONData, function(obj){
        process.exit();
      });
    });
  });
});
