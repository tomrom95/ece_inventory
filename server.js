'use strict'
//imports
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Item = require('./server/model/items');
var User = require('./server/model/users');
var passportJWT = require('passport-jwt');
var passportLocalAPI = require('passport-localapikey-update');
var passport = require('passport');
var secrets = require('./server/secrets.js');
var fs = require('fs');
var https = require('https');

var app = express();
var api_router = require('./server/router/api_router/apiRouter');
var auth_router = require('./server/router/auth_router/authRouter');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Accept, Authorization, apikey');
  res.setHeader('Cache-Control', 'no-cache');
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

var connectionString = (process.env.NODE_ENV == 'test') ? 'mongodb://localhost/test'
                                                        : 'mongodb://' + secrets.dbUser + ':' + secrets.dbPassword + '@localhost/inventory';
mongoose.connect(connectionString);

// passport setup
var opts = {
  jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeader(),
  secretOrKey: secrets.hashSecret,
}

passport.use(new passportJWT.Strategy(opts, function(jwt_payload, done) {
  User.findById(jwt_payload._doc._id, function(err, user) {
      if (err) {
          return done(err, false);
      }
      if (user) {
          done(null, user);
      } else {
          done(null, false);
      }
  });
}));

passport.use(new passportLocalAPI.Strategy(
  function(apikey, done) {
    console.log(apikey);
    User.findOne({ apikey: apikey }, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    });
  }
));

app.use('/api', passport.authenticate(['jwt', 'localapikey'], { session: false }), api_router);
app.use('/auth', auth_router);

if (process.env.NODE_ENV == 'test') {
  app.listen(secrets.apiPort, function () {
    console.log('API running but not on https');
  });
} else {
  https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: secrets.sslSecret
  }, app).listen(secrets.apiPort, function() {
    console.log('API running on port ' + secrets.apiPort);
  });
}

module.exports = app;
