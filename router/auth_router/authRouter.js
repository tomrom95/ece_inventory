var auth_routes = require('./routes/auth_routes');

var express = require('express');
var router = express.Router();

router.route('/login')
      .post(auth_routes.login);

router.route('/register')
      .post(auth_routes.register);

module.exports = router;
