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
var fs = require('fs');
var secrets = require('./server/secrets.js');
var https = require('https');
var path = require('path');

var app = express();
var api_router = require('./server/router/api_router/apiRouter');
var auth_router = require('./server/router/auth_router/authRouter');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

// Places a try catch around all requests. The server never stops
app.use(function (error, req, res, next) {
  console.error(error);
  res.status(500);
  res.render('error', { error: 'A server error has occured.' });
});

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

// Set up static paths
app.use('/guides', express.static(path.resolve(__dirname, 'guides')));

var buildPath = path.resolve(__dirname, 'build');
app.use(express.static(buildPath));

// Sets up build path
app.get('/*', function (request, response){
  response.sendFile('index.html', {root: buildPath});
})

if (process.env.NODE_ENV == 'test') {
  app.listen(secrets.testPort, function () {
    console.log('API running on test port ' + secrets.testPort);
  });
} else if (secrets.useProxy) {
  app.listen(secrets.proxyPort, function () {
    console.log('API running on proxy port ' + secrets.proxyPort);
  });
} else {
  https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
    passphrase: secrets.sslSecret
  }, app).listen(secrets.productionPort, function() {
    console.log('API running on production port ' + secrets.productionPort);
  });
}

module.exports = app;
