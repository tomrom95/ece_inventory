'use strict';

var bcrypt = require('bcrypt-nodejs');

const SALT_NUM = 5;

module.exports.createPasswordHash = function(password, next) {
  bcrypt.genSalt(SALT_NUM, function(error, salt) {
    if (error != null) {
      return next(error, null);
    }
    bcrypt.hash(password, salt, null, function(error, hash) {
      if (error != null) {
        return next(error, null);
      }
      return next(null, hash);
    });
  });
}

module.exports.compare = function(givenPassword, savedHash, next) {
  bcrypt.compare(givenPassword, savedHash, function(error, matched) {
    if (error != null) {
      return next(error, null);
    }
    return next(null, matched);
  });
}
