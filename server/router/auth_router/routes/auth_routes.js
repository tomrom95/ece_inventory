'use strict';
var jwt = require('jsonwebtoken');
var axios = require('axios');
var User = require('../../../model/users');
var helpers = require('../../../auth/auth_helpers');

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
      if (err) return next(err);
      // If user already exists, log him in
      if (user) {
        var token = helpers.createAuthToken(user)
        delete user.password_hash;
        user.is_admin = user.role !== 'STANDARD';
        return next(null, token, user);
      }
      user = User({
        netid: userInfo.netid,
        first_name: userInfo.firstName,
        last_name: userInfo.lastName,
        is_local: false,
      });
      // otherwise, create new user
      user.save(function(error, user) {
        if (error) return next(error);
        var token = helpers.createAuthToken(user)
        delete user.password_hash;
        user.is_admin = user.role !== 'STANDARD';
        return next(null, token, user);
      });
    });
  });
}

function loginWithUsername(username, password, next) {
  User.findOne({ username: username }, function(error, user) {
    if (error != null) {
      return next(error);
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
          delete user.password_hash;
          return next(null, jwtToken, user);
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
    if (!user.apikey) {
      User.findByIdAndUpdate(
        user._id,
        {$set: {apikey: helpers.createAPIKey()}},
        {new: true},
        function(error, updatedUser) {
          if (error) return res.send({error: error});
          user.apikey = updatedUser.apikey;
          return res.json({
            token: token,
            user: user
          });
        }
      );
    } else {
      return res.json({
        token: token,
        user: user
      });
    }
  });
}
