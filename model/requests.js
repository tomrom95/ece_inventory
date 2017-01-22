'use strict';

var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  }, // TODO when user schema is created, will be id reference
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  reason: String,
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  quantity: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['NEW', 'APPROVED', 'DENIED', 'FULFILLED'],
    default: 'NEW'
  },
  comment: String
})

module.exports = mongoose.model('Request', RequestSchema);
