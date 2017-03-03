process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let CustomField = require('../../server/model/customFields');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_item_private_fields_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Inventory Private fields API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;

  var fields;

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
                CustomField.insertMany(fakeJSONData.fields).then(function(array){
                  fields = {};
                  array.forEach(function(field) {
                    fields[field._id] = field;
                  });
                  Item.insertMany(fakeJSONData.items).then(function(array) {
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


  describe('GET /inventory fields', () =>{
    it('gets all fields for an admin', (done) => {
      chai.request(server)
        .get('/api/inventory')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var items = {};
          res.body.forEach(function(item) {
            items[item.name] = item;
          });
          items["1k resistor"].custom_fields.length.should.be.eql(4);
          items["2k resistor"].custom_fields.length.should.be.eql(4);
          items["5k resistor"].custom_fields.length.should.be.eql(2);
          should.not.exist(items["10k resistor"].customFields);
          done();
        });
    });

    it('gets all fields for a manager', (done) => {
      chai.request(server)
        .get('/api/inventory')
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var items = {};
          res.body.forEach(function(item) {
            items[item.name] = item;
          });
          items["1k resistor"].custom_fields.length.should.be.eql(4);
          items["2k resistor"].custom_fields.length.should.be.eql(4);
          items["5k resistor"].custom_fields.length.should.be.eql(2);
          should.not.exist(items["10k resistor"].customFields);
          done();
        });
    });

    it('gets only non private fields for a standard user', (done) => {
      chai.request(server)
        .get('/api/inventory')
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var items = {};
          res.body.forEach(function(item) {
            items[item.name] = item;
          });
          items["1k resistor"].custom_fields.length.should.be.eql(2);
          items["2k resistor"].custom_fields.length.should.be.eql(2);
          items["5k resistor"].custom_fields.length.should.be.eql(1);
          should.not.exist(items["10k resistor"].customFields);
          // every item should have only non-private fields
          res.body.should.satisfy(function(items) {
            return items.every(function(item) {
              return item.custom_fields.every(function(obj) {
                return !fields[obj.field].isPrivate
              });
            });
          });
          done();
        });
    });

  });

  describe('GET /inventory by id fields', () =>{
    it('gets all fields for an admin', (done) => {
      Item.findOne({name: "1k resistor"}, function(err, item) {
        should.not.exist(err);
        chai.request(server)
          .get('/api/inventory/' + item._id)
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.custom_fields.length.should.be.eql(4);
            done();
          });
      });
    });

    it('gets all fields for a manager', (done) => {
      Item.findOne({name: "1k resistor"}, function(err, item) {
        should.not.exist(err);
        chai.request(server)
          .get('/api/inventory/' + item._id)
          .set('Authorization', managerToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.custom_fields.length.should.be.eql(4);
            done();
          });
      });
    });

    it('gets only non-private fields for standard user', (done) => {
      Item.findOne({name: "1k resistor"}, function(err, item) {
        should.not.exist(err);
        chai.request(server)
          .get('/api/inventory/' + item._id)
          .set('Authorization', standardToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.custom_fields.length.should.be.eql(2);
            res.body.custom_fields.should.satisfy(function(itemFields) {
              return itemFields.every(function(obj) {
                return !fields[obj.field].isPrivate
              });
            });
            done();
          });
      });
    });

  });

});
