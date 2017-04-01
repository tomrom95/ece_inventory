'use strict';
var mongoose = require('mongoose');

var CustomFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['SHORT_STRING', 'LONG_STRING', 'INT', 'FLOAT'],
    required: true
  },
  isPrivate: {
    type: Boolean,
    required: true
  },
  assetField: {
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model('CustomField', CustomFieldSchema);
