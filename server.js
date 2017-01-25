'use strict'

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Item = require('./model/items');

var app = express();
var router = express.Router();

var port = process.env.API_PORT || 3001;
var dbUser = process.env.DB_USER || "admin";
var dbPassword = process.env.DB_PASSWORD || "ece458duke";

//mongoose.connect('mongodb://' + dbUser + ':' + dbPassword + '@localhost/inventory');
mongoose.connect('mongodb://' + 'localhost/test/inventory');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

router.route('/inventory')
.get(function(req, res) {
  // required_tags and excluded_tags: CSV separated values
  // Remove required_tags and excluded_tags first
  var required_tags = req.query.required_tags;
  var excluded_tags = req.query.excluded_tags;
  if(required_tags) required_tags = required_tags.split(',');
  if(excluded_tags) excluded_tags = excluded_tags.split(',');
  delete req.query.required_tags;
  delete req.query.excluded_tags;

  if(req.query.name)
    req.query.name = {'$regex': req.query.name, '$options':'i'};
  console.log(req.query);
  Item.find(req.query, function(err, items){
    if(err) res.send(err);
    var filteredList = [];
    itemLoop:
    for (var i in items){
      var itemTagArray = items[i].tags.map(function(x){
        return x.toLowerCase();
      })
      console.log(itemTagArray);
      for (var j in required_tags){
        // Go to the next item if any of the required tags are not in that item's tag list.
        if(!itemTagArray.includes(required_tags[j].toLowerCase())) continue itemLoop;
      }
      for (var k in excluded_tags){
        // Go to the next item if any of the excluded tags are in that item's tag list.
        if(itemTagArray.includes(excluded_tags[k].toLowerCase())) continue itemLoop;
      }
      // Item is added as it has passed both required and excluded tag filters
      filteredList.push(items[i]);
    }
    res.json(filteredList);
  });
  })

  .post(function(req, res){
    var item = new Item();
    item.name = req.body.name;
    item.quantity = req.body.quantity;
    item.model_number = req.body.model_number;
    item.location = req.body.location;
    item.description = req.body.description;
    item.tags = req.body.tags;
    item.has_instance_objects = req.body.has_instance_objects;
    item.save(function(err){
      if(err)
      return res.send(err);
      res.json(item);
    })
  })

  router.get('inventory/:id', function(req, res) {
    // res.json({
    //   id: "12345",
    //   quantity: 1,
    //   description: "It's an oscilloscope",
    //   has_instance_objects: true,
    // 	tag: ["machine", "expensive"],
    //   name: "oscilloscope",
    //   model_number: "23451",
    //   location: "stockroom",
    // });
  });
  app.use('/api', router);

  app.listen(port, function() {
    console.log('API running on port ' + port);
  });

  module.exports = app;
