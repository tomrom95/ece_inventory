var Db = require('mongodb').Db,
  Server = require('mongodb').Server;
var mongoose = require('mongoose');
let Item = require('../server/model/items');
var helpers = require('../server/auth/auth_helpers');

var db = new Db('inventory', new Server('localhost', 27017));
var fakeJSONData = require('../test/api/test_inventory_data');

db.open(function(err, db) {
  if (err) { console.log(err); }
  db.addUser('admin', 'ece458duke', {
        roles: [
            "readWrite",
            "dbAdmin"
        ]
    }, function(err, result) {
        if (err) {
          if (err.codeName == 'DuplicateKey') {
            console.log("you already made an admin user");
          } else {
            console.log(err);
          }
        }
        mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');
        helpers.createNewUser('admin', 'ece458duke', true, function(err, user) {
          if (!err) {
            console.log("inserted user");
          } else {
            console.log("it's likely the admin user already exists, here's the error:");
            console.log(err.message);
          }
          Item.insertMany(fakeJSONData).then(function(obj){
            console.log("inserted items");
          });
        });
    });
});
