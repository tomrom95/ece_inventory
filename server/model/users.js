'use strict';

var mongoose = require('mongoose');
var uuidV4 = require('uuid/v4');

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    sparse: true
  },
  netid: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
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
    default: 'STANDARD'
  },
  apikey: {
    type: String,
    default: uuidV4()
  },
  email_settings: {
    subscribed: {
      type: Boolean,
      default: false
    },
    subject_tag: String
  }
});

module.exports = mongoose.model('User', UserSchema);
