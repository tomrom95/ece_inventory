var inventory_routes = require('./routes/inventory_routes');
var instances_routes = require('./routes/instances_routes');
var user_routes = require('./routes/user_routes');

var express = require('express');
var router = express.Router();

router.route('/inventory')
      .get(inventory_routes.getAPI)
      .post(inventory_routes.postAPI);

router.route('/inventory/:item_id')
      .get(inventory_routes.getAPIbyID)
      .put(inventory_routes.putAPI)
      .delete(inventory_routes.deleteAPI);

router.route('/inventory/:item_id/instances')
      .get(instances_route.getAPI);
router.route('/register')
      .post(user_routes.register);

module.exports = router;
