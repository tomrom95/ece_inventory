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
  custom_field: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomField'
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  type: {
    type: String,
    enum: ['ITEM_EDITED', 'ITEM_CREATED', 'ITEM_DELETED',
      'REQUEST_DISBURSED', 'REQUEST_CREATED', 'REQUEST_EDITED',
      'REQUEST_DELETED', 'FIELD_CREATED', 'FIELD_EDITED', 'FIELD_DELETED'],
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
