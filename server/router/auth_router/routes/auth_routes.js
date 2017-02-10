'use strict';
var jwt = require('jsonwebtoken');
var axios = require('axios');
var User = require('../../../model/users');
var helpers = require('../../../auth/auth_helpers');
var User = require('../../../model/users');

function lookUpNetIDUser(oauthToken, next) {
  axios.get(
    'https://api.colab.duke.edu/identity/v1/',
    {
      headers: {
        'x-api-key': 'ece-inventory',
        'Authorization': 'Bearer ' + oauthToken
      }
    }
  ).then(function(response) {
    next(response.data.error, response.data);
  }).catch(function(error) {
    next(error);
  });
}

/*
Look up user on duke api to get netid and log user in
*/
function loginWithOAuth(oauthToken, res) {
  lookUpNetIDUser(oauthToken, function(error, userInfo) {
    if (error) return res.send({error: error});
    User.findOne({netid: userInfo.netid}, function(err, user) {
      if (err) return res.send({error: error});
      // If user already exists, log him in
      if (user) return res.json({
        token: helpers.createAuthToken(user),
        user: {
          _id: user._id,
          netid: user.netid,
          first_name: user.first_name,
          last_name: user.last_name,
          is_admin: user.is_admin,
          role: user.role
        }
      });
      var user = User({
        netid: userInfo.netid,
        first_name: userInfo.firstName,
        last_name: userInfo.lastName,
        is_local: false,
      });
      // otherwise, create new user
      user.save(function(error, user) {
        if (error) return res.send({error: error});
        return res.json({
          token: helpers.createAuthToken(user),
          user: {
            _id: user._id,
            netid: user.netid,
            first_name: user.first_name,
            last_name: user.last_name,
            is_admin: user.is_admin,
            role: user.role
          }
        });
      });
    });
  });
}

function loginWithUsername(username, password, res) {
  User.findOne({ username: username }, function(error, user) {
    if (error != null) {
      res.send({error: err});
      return;
    } else if (user == null) {
      res.send({error: 'User does not exist'});
      return;
    } else{
      helpers.compare(password, user.password_hash, function(error, matched) {
        if (error != null) {
          res.send(error);
        } else if (!matched) {
          res.send({error: 'Incorrect password'});
        } else {
          var jwtToken = helpers.createAuthToken(user);
          res.json({
            token: jwtToken,
            user: {
              _id: user._id,
              username: user.username,
              role: user.role,
              is_admin: user.is_admin
            }
          });
        }
      })
    }
  });
}

module.exports.login = function(req, res) {
  if (req.body.token) {
    loginWithOAuth(req.body.token, res);
  } else if (req.body.username && req.body.password) {
    loginWithUsername(req.body.username, req.body.password, res);
  }
}
