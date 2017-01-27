'use strict';
var helpers = require('../../../auth/auth_helpers');

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
        res.send({error: error});
      } else {
        res.json({user: user});
      }
    });
  }
}
