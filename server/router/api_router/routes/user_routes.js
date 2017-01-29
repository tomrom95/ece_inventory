'use strict';
var helpers = require('../../../auth/auth_helpers');

module.exports.register = function(req, res) {
  var user = req.user;
  var newUsername = req.body.username;
  var newPassword = req.body.password;
  var adminStatus = req.body.is_admin || false;
  if (!newUsername || !newPassword) {
    res.send({error: 'Username and password required for new account'});
    return;
  }
  helpers.createNewUser(newUsername, newPassword, adminStatus, function(error, user) {
    if (error != null) {
      res.send({error: error});
    } else {
      res.json({user: {
        _id: user._id,
        username: user.username,
        is_admin: user.is_admin
      }});
    }
  });
}

module.exports.getAPI = function(req, res) {
  var user = req.user;
  res.json({
    _id: user._id,
    username: user.username,
    is_admin: user.is_admin
  });
}
