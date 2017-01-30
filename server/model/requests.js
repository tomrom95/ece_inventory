'use strict';

var mongoose = require('mongoose');

var RequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Item',
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
    enum: ['PENDING', 'APPROVED', 'DENIED', 'FULFILLED'],
    default: 'PENDING'
  },
  requestor_comment: String,
  reviewer_comment: String
})

module.exports = mongoose.model('Request', RequestSchema);
