var Instance = require('../../server/model/instances');

module.exports.createMockInstances = function() {
  var array = [];
  var instance1 = new Instance();
  instance1.serial_number = '123';
  var instance2 = new Instance();
  instance2.serial_number = '456';
  instance2.condition = 'NEEDS_REPAIR';
  instance2.status =  'AVAILABLE';
  var instance3 = new Instance();
  instance3.serial_number = '789';
  instance3.status = 'LOST';
  array.push(instance1);
  array.push(instance2);
  array.push(instance3);
  return array;
}
