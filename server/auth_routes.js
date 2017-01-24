'use strict';
var jwt = require('jsonwebtoken');
var User = require('../model/users');
var helpers = require('./auth_helpers');
var secrets = require('./secrets');
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
          var jwtToken = jwt.sign(user, secrets.hashSecret, {expiresIn: 60*60*24});
          res.json({
            token: 'JWT ' + jwtToken,
            user: user
          });
        }
      })
    }
  });
}

module.exports.register = function(req, res) {
  var user = req.user;
  console.log("USER");
  console.log(user);
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
    helpers.createPasswordHash(newPassword, function(error, hash) {
      if (error != null) {
        res.send(error);
        return;
      }
      var newUser = new User({
        username: newUsername,
        password_hash: hash,
        is_admin: adminStatus,
      });
      newUser.save(function (error, user) {
        if (error != null) {
          res.send(error);
        } else {
          res.json({user: user});
        }
      });
    });
  }
}
