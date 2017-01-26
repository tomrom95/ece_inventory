var inventory_routes = require('./routes/inventory_routes');
console.log(inventory_routes);
module.exports = function(app){
  app.use('/inventory', inventory_routes);
  
};
