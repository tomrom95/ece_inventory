'use strict';

var bcrypt = require('bcrypt-nodejs');
var User = require('../../model/users');
var jwt = require('jsonwebtoken');
var secrets = require('../../server/secrets');

const SALT_NUM = 5;
const TOKEN_EXPIRY = 60*60*24;

var createPasswordHash = function(password, next) {
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

var compare = function(givenPassword, savedHash, next) {
  bcrypt.compare(givenPassword, savedHash, function(error, matched) {
    if (error != null) {
      return next(error, null);
    }
    return next(null, matched);
  });
}

var createNewUser = function(username, password, adminStatus, next) {
  createPasswordHash(password, function(error, hash) {
    if (error != null) {
      next(error, null);
      return;
    }
    var newUser = new User({
      username: username,
      password_hash: hash,
      is_admin: adminStatus,
    });
    newUser.save(function (error, user) {
      if (error != null) {
        next(error, null);
      } else {
        next(null, user);
      }
    });
  });
}

var createAuthToken = function(user) {
  return 'JWT ' + jwt.sign(user, secrets.hashSecret, {expiresIn: TOKEN_EXPIRY});
}

module.exports.createPasswordHash = createPasswordHash;
module.exports.compare = compare;
module.exports.createNewUser = createNewUser;
module.exports.createAuthToken = createAuthToken;
