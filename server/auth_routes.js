'use strict';
var jwt = require('jsonwebtoken');
var User = require('../model/users');
var helpers = require('./auth_helpers');
var User = require('../model/users.js');

module.exports.login = function(req, res) {
  User.findOne({ username: req.body.username }, function(error, user) {
    if (error != null) {
      res.send(err);
      return;
    } else if (user == null) {
      res.send({error: 'User does not exist'});
      return;
    } else{
      helpers.compare(req.body.password, user.password_hash, function(error, matched) {
        if (error != null) {
          res.send(error);
        } else if (!matched) {
          res.send({error: 'Incorrect password'});
        } else {
          var jwtToken = helpers.createAuthToken(user);
          res.json({
            token: jwtToken,
            user: user
          });
        }
      })
    }
  });
}

module.exports.register = function(req, res) {
  var user = req.user;
  if (!user.is_admin) {
    res.send({error: 'You do not have sufficient priveleges to use this endpoint'});
  } else {
    var newUsername = req.body.username;
    var newPassword = req.body.password;
    var adminStatus = req.body.is_admin || false;
    if (!newUsername || !newPassword) {
      res.send({error: 'Username and password required for new account'});
      return;
    }
    helpers.createNewUser(newUsername, newPassword, adminStatus, function(error, user) {
      if (error != null) {
        res.send(error);
      } else {
        res.json({user: user});
      }
    });
  }
}
