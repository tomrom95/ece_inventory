'use strict';

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['MANAGER', 'ADMIN', 'STANDARD'],
    default: 'PENDING'
  }
});

module.exports = mongoose.model('User', UserSchema);
