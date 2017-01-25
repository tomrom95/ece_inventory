'use strict';
var jwt = require('jsonwebtoken');
var User = require('../model/users');
var helpers = require('./auth_helpers');
var secrets = require('./secrets');

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
          res.json({token: 'JWT ' + jwtToken});
        }
      })
    }
  });
}
