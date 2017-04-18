process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let Instance = require("../../server/model/instances");
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
    "isPrivate": false,
    "perInstance": false
  },
  {
    "name": "restock_info",
    "type": "LONG_STRING",
    "isPrivate": true,
    "perInstance": false
  },
  {
    "name": "int_number",
    "type": "INT",
    "isPrivate": true,
    "perInstance": false
  },
  {
    "name": "float_number",
    "type": "FLOAT",
    "isPrivate": false,
    "perInstance": false
  },
  {
    "name":"string_perInstance",
    "type": "SHORT_STRING",
    "isPrivate": false,
    "perInstance": true
  },
  {
    "name":"int_perInstance",
    "type": "INT",
    "isPrivate": false,
    "perInstance": true
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

var multipleItemJSONwithDupKey = [{
  "quantity": 1000,
  "name": "112k resistor",
  "has_instance_objects": false,
  "vendor_info": "IBM",
  "model_number": "A123",
  "tags": [
    "component",
    "electric",
    "cheap"
  ]
},{
  "quantity": 1000,
  "name": "112k resistor",
  "has_instance_objects": true,
  "vendor_info": "IBM",
  "model_number": "A123",
  "tags": [
    "component",
    "electric",
    "cheap"
  ]
},{
  "quantity": 1000,
  "name": "200000k resistor",
  "has_instance_objects": false,
  "vendor_info": "IBM",
  "model_number": "A123",
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
  var singleItemInstanceswithQuantity;
  var singleItemInstanceswithoutQuantity;
  var multipleItemInstances;
  beforeEach((done) => { //Before each test we empty the database
    Item.remove({}, (err) => {
      should.not.exist(err);
      Instance.remove({}, (err) => {
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
                     singleItemInstanceswithoutQuantity = {
                      "name": "2k resistor",
                      "is_asset": true,
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
                      ],
                      instances:[
                        {
                          "custom_fields":[
                            {
                              "name": "string_perInstance",
                              "value": "CIEMASS"
                            },{
                              "name": "int_perInstance",
                              "value": 100
                            }
                          ]
                        }
                      ]
                    }
                     singleItemInstanceswithQuantity = {
                      "name": "10k resistor",
                      "is_asset": true,
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
                      ],
                      "quantity": 5
                    }
                    multipleItemInstances = [];
                    multipleItemInstances = multipleItemInstances.concat(singleItemInstanceswithQuantity);
                    multipleItemInstances = multipleItemInstances.concat(singleItemInstanceswithoutQuantity);
                    done();
                  });
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
        should.not.exist(err);
        res.should.have.status(200);
        res.body.message.should.be.eql("Successful import of item 2k resistor");
        Item.find({}, function(err, items){
          items.length.should.be.eql(1);
          items[0].name.should.be.eql("2k resistor");
          done();
        });
      });
    });
    it('POSTs for mulitple item', (done) => {
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(multipleItemJSON)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.message.should.be.eql("Successful import of 2 item(s): \"1k resistor\" \"2k resistor\" ");
        Item.find({}, function(err, items){
          items.length.should.be.eql(2);
          done();
        });
      });
    });
    it('Does not POST for standard', (done) => {
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', standardToken)
      .send(singleItemJSON)
      .end((err, res) => {
        res.should.have.status(403);
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          done();
        });
      });
    });
    it('Does POST for manager', (done) => {
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', managerToken)
      .send(singleItemJSON)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        Item.find({}, function(err, items){
          items.length.should.be.eql(1);
          done();
        });
      });
    });
    it('Does not POST single item with an incorrect custom field', (done) => {
      singleItemJSON.custom_fields[0].name = "dkjfh";
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(singleItemJSON)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql('The entered custom field dkjfh was not found in list of current custom fields');
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          done();
        });
      });
    });
    it('Does not POST multiple item with an incorrect custom field', (done) => {
      multipleItemJSON[1].custom_fields[1].name = "dkjfh";
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(singleItemJSON)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql('The entered custom field dkjfh was not found in list of current custom fields');
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          done();
        });
      });
    });
    it('Does not POST single item with an incorrect custom field type FLOAT', (done) => {
      singleItemJSON.custom_fields = [{
        "name": "float_number",
        "value": "hi"
      }];
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(singleItemJSON)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql('The entered custom field float_number has a value hi not matching type FLOAT');
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          done();
        });
      });
    });
    it('Does not POST single item with an incorrect custom field type INT', (done) => {
      singleItemJSON.custom_fields = [{
        "name": "int_number",
        "value": "hi"
      }];
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(singleItemJSON)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql('The entered custom field int_number has a value hi not matching type INT');
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          done();
        });
      });
    });
    it('Does not POST multiple items with duplicate key',(done)=> {
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(multipleItemJSONwithDupKey)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.code.should.be.eql(11000); // Duplicate key error code
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          done();
        });
      });
    });
    it('Does not POST single item with instances with incorrect customfield name',(done)=> {
      var dataCopy = Object.assign({}, singleItemInstanceswithoutQuantity);
      dataCopy.instances[0].custom_fields[0].name = "adfsa";
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(dataCopy)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql("The entered custom field adfsa was not found in list of current custom fields");
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(0);
            done();
          })
        });
      });
    });
    it('POSTs single item with instances',(done)=> {
      var dataCopy = Object.assign({}, singleItemInstanceswithoutQuantity);
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(dataCopy)
      .end((err, res) => {
        should.not.exist(err);
        res.body.message.should.be.eql('Successful import of item 2k resistor');
        Item.find({}, function(err, items){
          items.length.should.be.eql(1);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(1);
            done();
          })
        });
      });
    });
    it('Does not POST single item with instances with non per-instance customfield in instance',(done)=> {
      var dataCopy = Object.assign({}, singleItemInstanceswithoutQuantity);
      dataCopy.instances[0].custom_fields[0].name = "location";
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(dataCopy)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql("The entered custom field location has a value CIEMASS not matching type SHORT_STRING");
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(0);
            done();
          })
        });
      });
    });
    it('Does not POST single item with instances with is_asset field not specified',(done)=> {
      var dataCopy = Object.assign({}, singleItemInstanceswithoutQuantity);
      delete dataCopy.is_asset;
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(dataCopy)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql("Need to specify is_asset field as true if importing instances");
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(0);
            done();
          })
        });
      });
    });
    it('Does not POST single item with instances with is_asset field specified as false',(done)=> {
      var dataCopy = Object.assign({}, singleItemInstanceswithoutQuantity);
      dataCopy.is_asset = false;
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(dataCopy)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql("Need to specify is_asset field as true if importing instances");
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(0);
            done();
          })
        });
      });
    });
    it('Does not POST single item with instances with existing tag',(done)=> {
      var dataCopy = Object.assign({}, singleItemInstanceswithoutQuantity);
      dataCopy.instances[0].tag="101";
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(dataCopy)
      .end((err, res) => {
        should.not.exist(err);
        Item.find({}, function(err, items){
          should.not.exist(err);
          items.length.should.be.eql(1);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(1);
            dataCopy.name = "!231";
            chai.request(server)
            .post('/api/inventory/import')
            .set('Authorization', adminToken)
            .send(dataCopy)
            .end((err, res) => {
              should.not.exist(err);
              res.body.error.errmsg.should.contain("E11000 duplicate key error");
              Item.find({}, function(err, items){
                items.length.should.be.eql(1);
                Instance.find({}, function(err, instances){
                  instances.length.should.be.eql(1);
                  done();
                });
              });
            });
          });
        })
      });
    });
    it('POSTs single item with instances',(done)=> {
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(multipleItemInstances)
      .end((err, res) => {
        should.not.exist(err);
        res.body.message.should.be.eql("Successful import of 2 item(s): \"10k resistor\" \"2k resistor\" ");
        Item.find({}, function(err, items){
          items.length.should.be.eql(2);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(6);
            done();
          })
        });
      });
    });
    it('Does not POST multiple item with instances with non per-asset customfield for instance',(done)=> {
      multipleItemInstances[1].instances[0].custom_fields[0].name = "location";
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(multipleItemInstances)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql("The entered custom field location has a value CIEMASS not matching type SHORT_STRING");
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(0);
            done();
          })
        });
      });
    });
    it('Does not POST multiple item with instances where is_asset not specified',(done)=> {
      delete multipleItemInstances[1].is_asset;
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(multipleItemInstances)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql("Need to specify is_asset field as true if importing instances");
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(0);
            done();
          })
        });
      });
    });
    it('Does not POST multiple item with instances where is_asset specified as false',(done)=> {
      multipleItemInstances[1].is_asset = false;
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(multipleItemInstances)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql("Need to specify is_asset field as true if importing instances");
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(0);
            done();
          })
        });
      });
    });
    it('Does not POST multiple item with instances with existing tag',(done)=> {
      multipleItemInstances[1].instances[0].tag="101";
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(multipleItemInstances)
      .end((err, res) => {
        should.not.exist(err);
        Item.find({}, function(err, items){
          should.not.exist(err);
          items.length.should.be.eql(2);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(6);
            multipleItemInstances[0].name = "!231";
            multipleItemInstances[1].name = "!@#123";
            chai.request(server)
            .post('/api/inventory/import')
            .set('Authorization', adminToken)
            .send(multipleItemInstances)
            .end((err, res) => {
              should.not.exist(err);
              res.body.error.errmsg.should.contain("E11000 duplicate key error");
              Item.find({}, function(err, items){
                items.length.should.be.eql(2);
                Instance.find({}, function(err, instances){
                  instances.length.should.be.eql(6);
                  done();
                });
              });
            });
          });
        })
      });
    });
    it('Does not POST multiple item with instances with incorrect customfield name',(done)=> {
      multipleItemInstances[1].instances[0].custom_fields[0].name = "adfsa";
      chai.request(server)
      .post('/api/inventory/import')
      .set('Authorization', adminToken)
      .send(multipleItemInstances)
      .end((err, res) => {
        should.not.exist(err);
        res.body.error.should.be.eql("The entered custom field adfsa was not found in list of current custom fields");
        Item.find({}, function(err, items){
          items.length.should.be.eql(0);
          Instance.find({}, function(err, instances){
            instances.length.should.be.eql(0);
            done();
          })
        });
      });
    });
  });
});
