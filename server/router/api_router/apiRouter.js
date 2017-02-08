var inventory_routes = require('./routes/inventory_routes');
var instance_routes = require('./routes/instance_routes');
var request_routes = require('./routes/request_routes');
var user_routes = require('./routes/user_routes');
var log_routes = require('./routes/log_routes');
var restrictToAdmins = require('../../auth/auth_helpers').restrictToAdmins;
var restrictToManagers = require('../../auth/auth_helpers').restrictToManagers;
var tag_routes = require('./routes/tag_routes');

var express = require('express');
var router = express.Router();

router.route('/inventory')
      .get(inventory_routes.getAPI)
      .post(restrictToManagers, inventory_routes.postAPI);

router.route('/inventory/tags')
      .get(tag_routes.getAPI);

router.route('/inventory/:item_id')
      .get(inventory_routes.getAPIbyID)
      .put(restrictToManagers, inventory_routes.putAPI)
      .delete(restrictToManagers, inventory_routes.deleteAPI);

router.route('/inventory/:item_id/instances')
      .get(instance_routes.getAPI)
      .post(restrictToManagers, instance_routes.postAPI);

router.route('/inventory/:item_id/:instance_id')
      .get(instance_routes.getAPIbyID)
      .put(restrictToManagers, instance_routes.putAPI)
      .delete(restrictToManagers, instance_routes.deleteAPI);

router.route('/requests')
      .get(request_routes.getAPI)
      .post(request_routes.postAPI);

router.route('/requests/:request_id')
      .get(request_routes.getAPIbyID)
      .put(request_routes.putAPI)
      .delete(request_routes.deleteAPI)
      .patch(restrictToManagers, request_routes.patchAPI);

router.route('/user')
      .get(user_routes.getAPI)
      .post(restrictToAdmins, user_routes.register);

router.route('/logs')
      .get(restrictToManagers, log_routes.getAPI);

module.exports = router;
