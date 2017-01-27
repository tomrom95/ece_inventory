'use strict';

var mongoose = require('mongoose');

var InstanceSchema = new mongoose.Schema({
  serial_number: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    enum: ['GOOD', 'NEEDS_REPAIR'],
    default: 'GOOD'
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'IN_USE', 'LOST'],
    default: 'AVAILABLE'
  }
})

module.exports = mongoose.model('Instance', InstanceSchema);
