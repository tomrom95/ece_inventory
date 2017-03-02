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

EmailSettingsSchema.statics.getSingleton = function (next) {
  this.findOne()
    .exec(function(error, settings) {
      if (error) {
        next(error);
      } else if (!settings) {
        var newSettings = this.model('EmailSettings')();
        newSettings.save(function(error, doc) {
          if(error) return next(error);
          next(null, doc);
        });
      } else {
        next(null, settings);
      }
    }.bind(this));
};

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
