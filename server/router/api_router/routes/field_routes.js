'use strict';
var CustomField = require('../../../model/customFields');
var QueryBuilder = require('../../../queries/querybuilder');
var LogHelpers = require('../../../logging/log_helpers');

module.exports.getAPI = function (req, res) {
  var query = new QueryBuilder();
  if (req.user.role === 'STANDARD') {
    req.query.isPrivate = false;
  }
  query
    .searchCaseInsensitive('name', req.query.name)
    .searchExact('type', req.query.type)
    .searchBoolean('isPrivate', req.query.isPrivate);
  CustomField.find(query.toJSON(), function(error, fields) {
    if (error) return res.send({error: error});
    res.json(fields);
  });
};

module.exports.getAPIbyID = function(req,res){
  CustomField.findById(req.params.field_id, function (error, field){
    console.log(error);
    if(error) return res.send({error: error});
    if (!field) return res.send({error: 'field does not exist'});
    if (field.isPrivate && req.user.role === 'STANDARD') {
      return res.status(403).send({error: 'You do not have permission to see this field'})
    }
    res.json(field);
  });
};

module.exports.postAPI = function(req, res){
  var customField = new CustomField({
    name: req.body.name,
    type: req.body.type,
    isPrivate: req.body.isPrivate
  });
  customField.save(function(error, savedField){
    if(error) return res.send({error: error});
    LogHelpers.logCustomFieldCreation(savedField, req.user, function(error) {
      if(error) return res.send({error: error});
      res.json(savedField);
    });
  });
};

module.exports.putAPI = function(req, res){
  var update = {};
  ['name', 'type', 'isPrivate'].forEach(function(field) {
    if (req.body.hasOwnProperty(field)) update[field] = req.body[field];
  });
  CustomField.findById(req.params.field_id, function(error, customField) {
    if (error) return res.send({error: error});
    if (!customField) return res.send({error: 'Could not find field to update'});
    CustomField.findByIdAndUpdate(
      customField._id,
      {$set: update},
      {new: true},
      function(error, newCustomField) {
        if (error) return res.send({error: error});
        LogHelpers.logCustomFieldEdit(customField, update, req.user, function(error) {
          if (error) return res.send({error: error});
          res.json(newCustomField);
        });
      }
    );
  });
};

module.exports.deleteAPI = function(req, res){
  CustomField.findByIdAndRemove(
    req.params.field_id,
    function(error, deletedField) {
      if (error) return res.send({error: error});
      if (!deletedField) return res.send({error: 'Could not find field to delete'});
      LogHelpers.logCustomFieldDeletion(deletedField, req.user, function(error) {
        if (error) return res.send({error: error});
        res.json({message: "Delete successful"});
      });
    }
  );
}
