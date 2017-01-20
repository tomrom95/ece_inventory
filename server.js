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

mongoose.connect('mongodb://' + dbUser + ':' + dbPassword + '@localhost/inventory');

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

router.get('/inventory', function(req, res) {
  res.json([{
    id: "12345",
    quantity: 1,
    description: "It's an oscilloscope",
    has_instance_objects: true,
  	tag: ["machine", "expensive"],
    name: "oscilloscope",
    model_number: "23451",
    location: "stockroom",
  }]);
});

router.get('inventory/:id', function(req, res) {
  res.json({
    id: "12345",
    quantity: 1,
    description: "It's an oscilloscope",
    has_instance_objects: true,
  	tag: ["machine", "expensive"],
    name: "oscilloscope",
    model_number: "23451",
    location: "stockroom",
  });
});

app.use('/api', router);

app.listen(port, function() {
  console.log('api running on port ${port}');
});
