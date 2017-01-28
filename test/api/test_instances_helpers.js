var Instance = require('../../server/model/instances');

module.exports.createMockInstances = function() {
  var array = [];
  var instance1 = new Instance();
  instance1.serial_number = '123';
  var instance2 = new Instance();
  instance2.serial_number = '456';
  instance2.condition = 'NEEDS_REPAIR';
  instance2.status =  'AVAILABLE';
  array.push(instance1);
  array.push(instance2);
  return array;
}
