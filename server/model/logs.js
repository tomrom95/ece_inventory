'use strict';

var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
  initiating_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  affected_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
  }],
  type: {
    type: String,
    enum: ['EDIT', 'NEW', 'DELETED', 'FULFILLED'],
    required: true,
  },
  time_stamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Log', LogSchema);
