'use strict';

var mongoose = require('mongoose');

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
  location: String,
  description: String,
  tags: [String],
  has_instance_objects: {
    type: Boolean,
    required: true,
    default: false
  }
})

module.exports = mongoose.model('Item', ItemSchema);
