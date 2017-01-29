'use strict';

var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['ACQUISITION', 'LOSS'],
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  time_stamp: {
    type: Date,
    default: Date.now,
    required: true,
  }
});

module.exports = mongoose.model('Log', LogSchema);
