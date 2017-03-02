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

/**
Helper statics function to get the one email settings document
Can be accessed through EmailSettings.getSingleton()
If document already exists, it's returned, otherwise a new blank one is created
*/
EmailSettingsSchema.statics.getSingleton = function (next) {
  this.findOne()
    .exec(function(error, settings) {
      if (error) {
        next(error);
      } else if (!settings) {
        next(null, new this());
      } else {
        next(null, settings);
      }
    }.bind(this));
};

/**
Pre save hook to make sure that no new documents are ever added
*/
EmailSettingsSchema.pre('save', function (next) {
    this.model('EmailSettings').find({}, function(err, settings) {
      if (settings.length) {
        if (String(settings[0]._id) === String(this._id)) {
          return next();
        } else {
          return next(new Error('Settings already exist'));
        }
      } else {
        next();
      }
    }.bind(this));
});

module.exports = mongoose.model('EmailSettings', EmailSettingsSchema);
