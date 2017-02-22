'use strict';

var mongoose = require('mongoose');
var InstanceSchema = require('./instances.js').schema
var mongoosePaginate = require('mongoose-paginate');

var ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  model_number: String,
  description: String,
  vendor_info: String,
  tags: [String],
  has_instance_objects: {
    type: Boolean,
    default: false
  },
  instances: [InstanceSchema],
  custom_fields:[{
    _id: false,
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomField',
    },
    value:    mongoose.Schema.Types.Mixed,
  }],
  is_deleted: {
    type: Boolean,
    required: true,
    default: false
  }
})
ItemSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Item', ItemSchema);
