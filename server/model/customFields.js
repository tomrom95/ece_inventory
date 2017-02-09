'use strict';
var mongoose = require('mongoose');

var CustomFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    // Value does not need to be entered to create a custom field?
    type: String
  },
  type: {
    type: String,
    enum: ['SHORT_STRING', 'LONG_STRING', 'INT', 'FLOAT'],
    required: true
  },
  isPrivate: {
    type: Boolean,
    required: true
  }
})

module.exports = mongoose.model('CustomField', CustomFieldSchema);
