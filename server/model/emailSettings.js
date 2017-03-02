'use strict';

var mongoose = require('mongoose');

var EmailSettingsSchema = new mongoose.Schema({
  subject_tag: {
    type: String,
    default: "",
  },
  loan_emails: [{
    date: {
      type: Date,
      required: true
    },
    body: String,
  }]
});

module.exports = mongoose.model('EmailSettings', EmailSettingsSchema);
