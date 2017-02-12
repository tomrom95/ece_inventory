'use strict';
var jwt = require('jsonwebtoken');
var axios = require('axios');
var User = require('../../../model/users');
var helpers = require('../../../auth/auth_helpers');
var User = require('../../../model/users');

const API_KEY = 'ece-inventory-colab-sbx-125'; // Works with any of our API keys

function lookUpNetIDUser(oauthToken, next) {
  axios.get(
    'https://api.colab.duke.edu/identity/v1/',
    {
      headers: {
        'x-api-key': API_KEY,
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
function loginWithOAuth(oauthToken, next) {
  lookUpNetIDUser(oauthToken, function(error, userInfo) {
    if (error) return next(error);
    User.findOne({netid: userInfo.netid}, function(err, user) {
      if (err) return next(error);
      // If user already exists, log him in
      if (user) return next(
        null,
        helpers.createAuthToken(user),
        {
          _id: user._id,
          netid: user.netid,
          first_name: user.first_name,
          last_name: user.last_name,
          is_admin: false, // keep until role migration complete
          role: user.role
        }
      );
      var user = User({
        netid: userInfo.netid,
        first_name: userInfo.firstName,
        last_name: userInfo.lastName,
        is_local: false,
      });
      // otherwise, create new user
      user.save(function(error, user) {
        if (error) return next(error);
        return next(
          null,
          helpers.createAuthToken(user),
          {
            _id: user._id,
            netid: user.netid,
            first_name: user.first_name,
            last_name: user.last_name,
            is_admin: false, // keep until role migration complete
            role: user.role
          }
        );
      });
    });
  });
}

function loginWithUsername(username, password, next) {
  User.findOne({ username: username }, function(error, user) {
    if (error != null) {
      return next(err);
    } else if (user == null) {
      return next('User does not exist');
    } else{
      helpers.compare(password, user.password_hash, function(error, matched) {
        if (error != null) {
          return next(error);
        } else if (!matched) {
          return next('Incorrect password');
        } else {
          var jwtToken = helpers.createAuthToken(user);
          return next(null, jwtToken, {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            role: user.role,
            is_admin: user.is_admin
          });
        }
      })
    }
  });
}

function loginHelper(token, username, password, next) {
  if (token && username && password) {
    next('Either sign in with token or username/password');
  } else if (token) {
    loginWithOAuth(token, next);
  } else if (username && password) {
    loginWithUsername(username, password, next);
  } else {
    next('Invalid arguments');
  }
}

module.exports.login = function(req, res) {
  loginHelper(req.body.token, req.body.username, req.body.password, function(error, token, user) {
    if (error) return res.send({error: error});
    return res.json({
      token: token,
      user: user
    });
  });
}
