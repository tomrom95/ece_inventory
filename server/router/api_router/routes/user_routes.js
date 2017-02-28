'use strict';
var helpers = require('../../../auth/auth_helpers');
var User = require('../../../model/users');
var QueryBuilder = require('../../../queries/querybuilder');

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
  let filterFields = ['first_name', 'last_name', 'username', 'netid'];
  var query = new QueryBuilder();
  query
    .searchCaseInsensitive('first_name', req.query.first_name)
    .searchCaseInsensitive('last_name', req.query.last_name)
    .searchCaseSensitive('username', req.query.username)
    .searchExact('role', req.query.role)
    .searchExact('netid', req.query.netid ? req.query.netid.toLowerCase() : null);

  User
    .find(query.toJSON(), {password_hash: 0})
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
    res.json(user);
  });
}

module.exports.putAPI = function(req, res) {
  var update = {};
  ['first_name', 'last_name', 'role'].forEach(function(field) {
    if (req.body[field]) {
      update[field] = req.body[field];
    }
  });
  User.findByIdAndUpdate(
    req.params.user_id,
    {$set: update},
    {new: true},
    function(error, user) {
      if (error) return res.send({error: error});
      if (user === undefined || user === null) return res.send({error: "User does not exist"});
      delete user.password_hash
      res.json(user);
    }
  );
}
