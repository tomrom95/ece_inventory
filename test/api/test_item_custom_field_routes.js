process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let CustomField = require('../../server/model/customFields');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

const fieldJSON = [
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

describe('Inventory Custom Fields API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;

  var defaultFields;
  var defaultItem;

  beforeEach((done) => { //Before each test we empty the database
    Item.remove({}, (err) => {
      should.not.exist(err);
      CustomField.remove({}, (err) => {
        User.remove({}, (err) => {
          should.not.exist(err);
          helpers.createNewUser('admin', 'test', 'ADMIN', function(err, user) {
            should.not.exist(err);
            adminToken = helpers.createAuthToken(user);
            adminUser = user;
            helpers.createNewUser('standard', 'test', 'STANDARD', function(err, user) {
              should.not.exist(err);
              standardToken = helpers.createAuthToken(user);
              standardUser = user;
              helpers.createNewUser('manager', 'test', 'MANAGER', function(err, user) {
                should.not.exist(err);
                managerToken = helpers.createAuthToken(user);
                managerUser = user;
                CustomField.insertMany(fieldJSON).then(function(array){
                  defaultFields = {};
                  array.forEach(function(field) {
                    defaultFields[field.name] = field;
                  });
                  var itemToCreate = Item({
                    "quantity": 1000,
                    "name": "test_item",
                  });
                  itemToCreate.save(function(err, itemCreated) {
                    defaultItem = itemCreated;
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

  describe('POST /inventory/:item_id/customFields', () =>{
    it('adds a new customField', (done) => {
      chai.request(server)
        .post('/api/inventory/' + defaultItem._id + '/customFields')
        .set('Authorization', adminToken)
        .send({
          field: defaultFields.location._id,
          value: 'ciemas'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.custom_fields[0].field.should.be.eql(String(defaultFields.location._id));
          res.body.custom_fields[0].value.should.be.eql('ciemas');
          Item.findById(defaultItem._id, function(error, item) {
            item.custom_fields[0].field.should.be.eql(defaultFields.location._id);
            item.custom_fields[0].value.should.be.eql('ciemas');
            done();
          });
      });
    });

  });

});
