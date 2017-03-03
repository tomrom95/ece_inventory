var inventory_routes = require('./routes/inventory_routes');
var cart_routes = require('./routes/cart_routes');
var cart_item_routes = require('./routes/cart_item_routes');
var instance_routes = require('./routes/instance_routes');
var request_routes = require('./routes/request_routes');
var user_routes = require('./routes/user_routes');
var log_routes = require('./routes/log_routes');
var restrictToAdmins = require('../../auth/auth_helpers').restrictToAdmins;
var restrictToManagers = require('../../auth/auth_helpers').restrictToManagers;
var tag_routes = require('./routes/tag_routes');
var field_routes = require('./routes/field_routes');
var item_field_routes = require('./routes/item_field_routes');

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
      .delete(restrictToAdmins, inventory_routes.deleteAPI);

router.route('/inventory/:item_id/customFields')
      .post(restrictToManagers, item_field_routes.postAPI);

router.route('/inventory/:item_id/customFields/:field_id')
      .put(restrictToManagers, item_field_routes.putAPI)
      .delete(restrictToManagers, item_field_routes.deleteAPI);

router.route('/inventory/:item_id/instances')
      .get(instance_routes.getAPI)
      .post(restrictToManagers, instance_routes.postAPI);

router.route('/inventory/:item_id/:instance_id')
      .get(instance_routes.getAPIbyID)
      .put(restrictToManagers, instance_routes.putAPI)
      .delete(restrictToManagers, instance_routes.deleteAPI);

router.route('/cart')
      .get(cart_routes.getAPI)
      .put(cart_routes.putAPI)
      .patch(cart_routes.patchAPI);

router.route('/cart/items')
      .post(cart_item_routes.postAPI);

router.route('/cart/items/:item_id')
      .put(cart_item_routes.putAPI)
      .delete(cart_item_routes.deleteAPI);

router.route('/requests')
      .get(request_routes.getAPI)
      .post(request_routes.postAPI);

router.route('/requests/:request_id')
      .get(request_routes.getAPIbyID)
      .put(request_routes.putAPI)
      .delete(request_routes.deleteAPI)
      .patch(restrictToManagers, request_routes.patchAPI);

router.route('/users')
      .get(restrictToManagers, user_routes.getAPI)
      .post(restrictToAdmins, user_routes.postAPI);

router.route('/users/:user_id')
      .get(user_routes.getAPIbyID)
      .put(user_routes.putAPI);

router.route('/logs')
      .get(restrictToManagers, log_routes.getAPI);

router.route('/customFields')
      .get(field_routes.getAPI)
      .post(restrictToAdmins, field_routes.postAPI);

router.route('/customFields/:field_id')
      .get(field_routes.getAPIbyID)
      .put(restrictToAdmins, field_routes.putAPI)
      .delete(restrictToAdmins, field_routes.deleteAPI);

module.exports = router;
