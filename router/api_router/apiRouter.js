var inventory_routes = require('./routes/inventory_routes');

var express = require('express');
var router = express.Router();

router.route('/inventory')
      .get(inventory_routes.getAPI)
      .post(inventory_routes.postAPI);

module.exports = router;
