'use strict';

var mongoose = require('mongoose');

var CartSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  item: [
    {
      id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Item'
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  lastModified:{
    type: Date,
    default: Date.now,
    required: true
  }
})

module.exports = mongoose.model('Cart', CartSchema);
