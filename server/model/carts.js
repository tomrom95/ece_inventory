'use strict';

var mongoose = require('mongoose');

var CartSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [
    {
      item: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Item'
      },
      quantity: {
        type: Number,
        min: 0,
        required: true
      }
    }
  ],
  description: String,
  created: {
    type: Date,
    default: Date.now,
  },
  lastModified:{
    type: Date,
    default: Date.now,
  }
})

module.exports = mongoose.model('Cart', CartSchema);
