'use strict';
var helpers = require('../../../auth/auth_helpers');
var User = require('../../../model/users');

module.exports.postAPI = function(req, res) {
  var user = req.user;
  var newUsername = req.body.username;
  var newPassword = req.body.password;
  var role = req.body.role || 'STANDARD';
  if (!newUsername || !newPassword) {
    res.send({error: 'Username and password required for new account'});
    return;
  }
  helpers.createNewUser(newUsername, newPassword, role, function(error, user) {
    if (error != null) {
      res.send({error: error});
    } else {
      res.json({user: {
        _id: user._id,
        username: user.username,
        is_admin: user.role !== 'STANDARD',
        role: user.role
      }});
    }
  });
}

module.exports.getAPI = function(req, res) {
  User
    .find({}, {password_hash: 0})
    .exec(function(err, users) {
      if(err) {
        res.send({error: err});
      } else {
        res.json(users);
      }
    });
}
