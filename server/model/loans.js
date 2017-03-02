'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Item',
      },
      quantity: {
        type: Number,
        min: 0,
        required: true
      },
      status: {
        type: String,
        enum: ['RETURNED', 'DISBURSED', 'LENT'],
        default: 'LENT'
      }
    }
  ],
  request: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Request',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  lastModified:{
    type: Date,
    default: Date.now,
  }
})
LoanSchema.plugin(mongoosePaginate);
