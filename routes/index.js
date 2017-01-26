module.exports = function(app){
  app.use('/inventory', require('./inventory_routes'));
};
