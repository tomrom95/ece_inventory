var Db = require('mongodb').Db,
  Server = require('mongodb').Server;
var mongoose = require('mongoose');
let Item = require('../model/items');
var helpers = require('../auth/auth_helpers');

var db = new Db('inventory', new Server('localhost', 27017));
var fakeJSONData = require('../test/api/test_inventory_GETdata');

db.open(function(err, db) {
  if (err) { return console.log(err); }
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
            return console.log(err);
          }
        }
        console.log("Added.");
        mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');
        helpers.createNewUser('admin', 'ece458duke', true, function(err, user) {
          if (!err) {
            console.log("inserted user");
          }
          Item.insertMany(fakeJSONData).then(function(obj){
            console.log("inserted items");
          });
        });
    });
});
