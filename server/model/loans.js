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
        enum: ['RETURNED', 'DISBURSED', 'LENT', 'BACKFILL_REQUESTED'],
        default: 'LENT'
      },
      backfill_rejected: Boolean,
      instances: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Instance',
        }
      ]
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
  },
  attachment_path: String,
  comment: String
})
LoanSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Loan', LoanSchema);
