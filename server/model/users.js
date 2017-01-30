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
  is_admin: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('User', UserSchema);
