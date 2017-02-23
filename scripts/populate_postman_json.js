// This will make a call to get the APIKEY for the right user, populate the Postman Collection JSON with the right API key
// In terminal, you must enter username and password as terminal argument like this:

// "populate_postman_json.js admin ece458duke"

var username = process.argv[2];
var password = process.argv[3];

if(!username || !password){
  console.log("Username or password not entered");
  process.exit();
}

var mongoose = require('mongoose');
var User = require('../server/model/users');
var fs = require("fs");
var apikey;
var postmanJSON = require("../ECE458.postman_collection.json");
var request = require('request');
console.log("Connecting to Mongodb...");
mongoose.connect('mongodb://admin:ece458duke@localhost/inventory');

console.log("Making POST call to /auth/login...");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
request.post(
  'https://colab-sbx-186.oit.duke.edu:3001/auth/login',
  {json:{"username": username, "password": password}},
  function(err, response, body){
    if(err){
      console.log(err);
      process.exit();
    }
    if (!err && response.statusCode == 200) {
     console.log("The API key is "+body.user.apikey)
     apikey = body.user.apikey;
     User.findOne({"username": username.toString()}, function(err,user){
       if(err || !user) console.log("There was an error finding this user. "+ err);
       console.log("User found");
       console.log("Replacing api key...");
       findAndReplace(postmanJSON, apikey);
       console.log("Replaced api key successfully");
       fs.writeFile('ECE458.postman_collection.json', JSON.stringify(postmanJSON), 'utf8', (err) =>{
         if (err) throw err;
         console.log('File written!');
         process.exit();
       });
     })
   }
  }
)



function findAndReplace(object, replacevalue) {
  for (var x in object) {
    if (object.hasOwnProperty(x)) {
      if (typeof object[x] == 'object') {
        findAndReplace(object[x], replacevalue);
      }
      if (object["key"] === "apikey") {
        object["value"] = replacevalue;
      }
    }
  }
}
