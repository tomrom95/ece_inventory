var auth_routes = require('./routes/auth_routes');

var express = require('express');
var errorHandler = require('express-async-error').Handler

var router = express.Router();

router.use(errorHandler())

router.route('/login')
      .post(auth_routes.login);

module.exports = router;
