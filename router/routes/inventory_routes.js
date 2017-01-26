var express = require('express');
var router = express.Router();

router.get(function(req, res) {
  // required_tags and excluded_tags: CSV separated values
  // Remove required_tags and excluded_tags first
  var required_tags = req.query.required_tags;
  var excluded_tags = req.query.excluded_tags;
  if(required_tags){
    required_tags = required_tags.split(',').map(function(item){
      return item.trim();
    });
    var required_tags_regex = []; // case-insensitive
    required_tags.forEach(function(opt){
      required_tags_regex.push(new RegExp(opt, "i"));
    });
  }
  if(excluded_tags) {
    excluded_tags = excluded_tags.split(',').map(function(item){
      return item.trim();
    });
    var excluded_tags_regex = []; // case-insensitive
    excluded_tags.forEach(function(opt){
      excluded_tags_regex.push(new RegExp(opt, "i"));
    });
  }
  var location = req.query.location;
  var query = {};
  if(req.query.name)
  query.name = {'$regex': req.query.name, '$options':'i'};
  if(required_tags_regex && excluded_tags_regex)
  query.tags = { $all : required_tags_regex, $nin : excluded_tags_regex};
  else if(required_tags_regex)
  query.tags = { $all : required_tags_regex};
  else if(excluded_tags_regex)
  query.tags = { $nin : excluded_tags_regex};
  if(req.query.location) query.location = {'$regex': req.query.location, '$options':'i'};
  if(req.query.model_number) query.model_number = {'$regex': req.query.model_number, '$options':'i'};

  Item.find(query, function(err, items){
    if(err) res.send(err);
    res.json(items);
  });
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

router.post(function(req, res){
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

module.exports = router;