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
  let filterFields = ['first_name', 'last_name', 'username', 'netid'];
  var query = {};
  if (req.query.first_name) {
    // case insensitive
    query.first_name = {'$regex': req.query.first_name, '$options':'i'};
  }
  if (req.query.last_name) {
    // case insensitive
    query.last_name = {'$regex': req.query.last_name, '$options':'i'};
  }
  if (req.query.username) {
    // case sensitive matching
    query.username = {'$regex': req.query.username};
  }
  if (req.query.role) {
    query.role = req.query.role;
  }
  if (req.query.netid) {
    // net ids are always lower case
    query.netid = req.query.netid.toLowerCase();
  }

  User
    .find(query, {password_hash: 0})
    .exec(function(err, users) {
      if(err) {
        res.send({error: err});
      } else {
        res.json(users);
      }
    });
}

module.exports.getAPIbyID = function(req, res) {
  if ((req.user.role !== 'ADMIN') && (req.user._id != req.params.user_id)) {
    return res.status(403).send({error: 'You do not have permission to view another user profile'});
  }
  User.findById(req.params.user_id, function(error, user) {
    if (error) return res.send({error: error});
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
      delete user.password_hash
      res.json(user);
    }
  );
}
