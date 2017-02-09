'use strict';

var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  netid: {
    type: String,
    unique: true
  },
  first_name: String,
  last_name: String,
  is_local: {
    type: Boolean,
    default: true,
  },
  password_hash: {
    type: String,
  },
  role: {
    type: String,
    enum: ['MANAGER', 'ADMIN', 'STANDARD'],
    default: 'PENDING'
  }
});

module.exports = mongoose.model('User', UserSchema);
