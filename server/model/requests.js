'use strict';

var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var RequestSchema = new mongoose.Schema({
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
      }
    }
  ],
  reason: String,
  created: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'DENIED', 'FULFILLED'],
    default: 'PENDING'
  },
  // action:{
  //   type: String,
  //   enum: ['DISBURSEMENT', 'LOAN'],
  //   required: true
  // },
  requestor_comment: String,
  reviewer_comment: String,
  is_cancelled: {
    type: Boolean,
    default: false
  }
})
RequestSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Request', RequestSchema);
