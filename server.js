'use strict'
//imports
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Item = require('./model/items');
var User = require('./model/users');
var passportJWT = require('passport-jwt');
var passport = require('passport');
var secrets = require('./server/secrets.js');
var fs = require('fs');
var https = require('https');

var app = express();
var api_router = require('./router/api_router/apiRouter');
var auth_router = require('./router/auth_router/authRouter');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.setHeader('Cache-Control', 'no-cache');
  next();
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

app.use('/api', passport.authenticate('jwt', { session: false }), api_router);
app.use('/auth', auth_router);

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: secrets.sslSecret
}, app).listen(secrets.apiPort, function() {
  console.log('API running on port ' + secrets.apiPort);
});

module.exports = app;
