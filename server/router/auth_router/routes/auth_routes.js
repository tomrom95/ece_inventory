'use strict';
var jwt = require('jsonwebtoken');
var User = require('../../../model/users');
var helpers = require('../../../auth/auth_helpers');
var User = require('../../../model/users');

module.exports.login = function(req, res) {
  User.findOne({ username: req.body.username }, function(error, user) {
    if (error != null) {
      res.send({error: err});
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
