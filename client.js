'use strict'
//imports
var express = require('express');
var path = require('path');
var fs = require('fs');
var https = require('https');
var secrets = require('./server/secrets');

var app = express();

var buildPath = path.resolve(__dirname, 'build');

app.use(express.static(buildPath));

app.use('/guides', express.static(path.resolve(__dirname, 'guides')));

app.get('/*', function (request, response){
  response.sendFile('index.html', {root: buildPath});
})

https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: secrets.sslSecret
}, app).listen(secrets.clientPort, function() {
  console.log('Client running on port ' + secrets.clientPort);
});
