'use strict'
//imports
var express = require('express');
var fs = require('fs');
var https = require('https');
var secrets = require('./server/secrets');

var app = express();

app.use(express.static('build'));

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: secrets.sslSecret
}, app).listen(secrets.clientPort, function() {
  console.log('Client running on port ' + secrets.clientPort);
});
