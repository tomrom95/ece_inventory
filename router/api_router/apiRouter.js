var inventory_routes = require('./routes/inventory_routes');

var express = require('express');
var router = express.Router();

router.route('/inventory')
      .get(inventory_routes.getAPI)
      .post(inventory_routes.postAPI);

router.route('/inventory/:item_id')
      .get(inventory_routes.getAPIbyID)
      .put(inventory_routes.putAPI);

module.exports = router;
