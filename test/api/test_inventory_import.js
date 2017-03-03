process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Cart = require('../../server/model/carts');
let Request = require('../../server/model/requests');
let CustomField = require('../../server/model/customFields');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeItemData = require('./test_inventory_data');
let fakeCartData = require('./test_carts_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

const customFieldJSON = [
  {
    "name": "location",
    "type": "SHORT_STRING",
    "isPrivate": false
  },
  {
    "name": "restock_info",
    "type": "LONG_STRING",
    "isPrivate": true
  },
  {
    "name": "int_number",
    "type": "INT",
    "isPrivate": true
  },
  {
    "name": "float_number",
    "type": "FLOAT",
    "isPrivate": false
  }
];

var singleItemJSON =   {
  "quantity": 1000,
  "name": "2k resistor",
  "has_instance_objects": false,
  "vendor_info": "IBM",
  "model_number": "A123",
  "custom_fields":[{
    "name": "location",
    "value": "CIEMAS"
  },{
    "name": "int_number",
    "value": 100
  }],
  "tags": [
    "component",
    "electric",
    "cheap"
  ]
};
var multipleItemJSON = [{
  "quantity": 1000,
  "name": "1k resistor",
  "has_instance_objects": false,
  "vendor_info": "IBM",
  "model_number": "A123",
  "custom_fields":[{
    "name": "location",
    "value": "CIEMAS"
  },{
    "name": "int_number",
    "value": 100
  }],
  "tags": [
    "component",
    "electric",
    "cheap"
  ]
},
{
  "quantity": 1000,
  "name": "2k resistor",
  "has_instance_objects": false,
  "vendor_info": "IBM",
  "model_number": "A123",
  "custom_fields":[{
    "name": "location",
    "value": "CIEMAS"
  },{
    "name": "int_number",
    "value": 100
  }],
  "tags": [
    "component",
    "electric",
    "cheap"
  ]
}];

describe('Inventory Import API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  var item1_id;
  var item2_id;
  var defaultFields;
  beforeEach((done) => { //Before each test we empty the database
    Item.remove({}, (err) => {
      should.not.exist(err);
      CustomField.remove({}, (err) => {
        User.remove({}, (err) => {
          should.not.exist(err);
          helpers.createNewUser('admin', 'test', 'admin@email.com', 'ADMIN', function(err, user) {
            should.not.exist(err);
            adminToken = helpers.createAuthToken(user);
            adminUser = user;
            helpers.createNewUser('standard', 'test', 'standard@email.com', 'STANDARD', function(err, user) {
              should.not.exist(err);
              standardToken = helpers.createAuthToken(user);
              standardUser = user;
              helpers.createNewUser('manager', 'test', 'manager@email.com', 'MANAGER', function(err, user) {
                should.not.exist(err);
                managerToken = helpers.createAuthToken(user);
                managerUser = user;
                CustomField.insertMany(customFieldJSON).then(function(array){
                  defaultFields = {};
                  array.forEach(function(field) {
                    defaultFields[field.name] = field;
                  });
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('POST /inventory/import', () =>{
    it('POSTs for one item', (done) => {
      chai.request(server)
        .post('/api/inventory/import')
        .set('Authorization', adminToken)
        .send(singleItemJSON)
        .end((err, res) => {
          console.log(err);
          should.not.exist(err);
          res.should.have.status(200);
          done();
        });
    });
  });
});
