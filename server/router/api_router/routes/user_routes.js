'use strict';
var helpers = require('../../../auth/auth_helpers');
var User = require('../../../model/users');
var QueryBuilder = require('../../../queries/querybuilder');
var validator = require('validator');

module.exports.postAPI = function(req, res) {
  var user = req.user;
  var newUsername = req.body.username;
  var newPassword = req.body.password;
  var newEmail = req.body.email;

  var role = req.body.role || 'STANDARD';
  if (!newUsername || !newPassword || !newEmail) {
    res.send({error: 'Username, password, and email required for new account'});
    return;
  }
  if (!validator.isEmail(newEmail)) {
    return res.send({error: 'Invalid email'});
  }

  helpers.createNewUser(newUsername, newPassword, newEmail, role, function(error, user) {
    if (error != null) {
      res.send({error: error});
    } else {
      res.json({user: {
        _id: user._id,
        username: user.username,
        is_admin: user.role !== 'STANDARD',
        role: user.role,
        email: user.email
      }});
    }
  });
}

module.exports.getAPI = function(req, res) {
  let filterFields = ['first_name', 'last_name', 'username', 'netid'];
  var query = new QueryBuilder();
  query
    .searchCaseInsensitive('first_name', req.query.first_name)
    .searchCaseInsensitive('last_name', req.query.last_name)
    .searchCaseSensitive('username', req.query.username)
    .searchExact('role', req.query.role)
    .searchExact('netid', req.query.netid ? req.query.netid.toLowerCase() : null);

  User
    .find(query.toJSON(), {password_hash: 0, apikey: 0})
    .exec(function(err, users) {
      if(err) {
        res.send({error: err});
      } else {
        res.json(users);
      }
    });
}

module.exports.getAPIbyID = function(req, res) {
  if ((req.user.role === 'STANDARD') && (req.user._id != req.params.user_id)) {
    return res.status(403).send({error: 'You do not have permission to view another user profile'});
  }
  User.findById(req.params.user_id, function(error, user) {
    if (error) return res.send({error: error});
    if (user === undefined || user === null) return res.send({error: "User does not exist"});
    delete user.password_hash
    delete user.apikey
    res.json(user);
  });
}

module.exports.putAPI = function(req, res) {
  if (req.user.role !== 'ADMIN' && req.params.user_id !== String(req.user._id)) {
    res.status(403);
    return res.send({error: 'Only admins can edit other users'});
  }
  var fields = ['first_name', 'last_name', 'email'];
  if (req.user.role !== 'STANDARD') {
    fields.push('email_settings');
  }
  if (req.user.role === 'ADMIN') {
    // Only admins can edit role
    fields.push('role');
  }
  var update = {};
  fields.forEach(function(field) {
    if (req.body[field]) {
      update[field] = req.body[field];
    }
  });
  if (req.body.email && !validator.isEmail(req.body.email)) {
    return res.send({error: 'Invalid email'});
  }
  User.findByIdAndUpdate(
    req.params.user_id,
    {$set: update},
    {new: true},
    function(error, user) {
      if (error) return res.send({error: error});
      if (user === undefined || user === null) return res.send({error: "User does not exist"});
      delete user.password_hash
      delete user.apikey
      res.json(user);
    }
  );
}
