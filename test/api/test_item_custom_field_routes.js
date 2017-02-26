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
                  done();
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
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .post('/api/inventory/' + item._id + '/customFields')
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
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields[0].field.should.be.eql(defaultFields.location._id);
              foundItem.custom_fields[0].value.should.be.eql('ciemas');
              done();
            });
          });
      });
    });

    it('updates custom field if it already exists', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
        custom_fields: [
          {
            field: defaultFields.location._id,
            value: 'ciemas'
          }
        ]
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .post('/api/inventory/' + item._id + '/customFields')
          .set('Authorization', adminToken)
          .send({
            field: defaultFields.location._id,
            value: 'hudson'
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.custom_fields.length.should.be.eql(1);
            res.body.custom_fields[0].field.should.be.eql(String(defaultFields.location._id));
            res.body.custom_fields[0].value.should.be.eql('hudson');
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(1);
              foundItem.custom_fields[0].field.should.be.eql(defaultFields.location._id);
              foundItem.custom_fields[0].value.should.be.eql('hudson');
              done();
            });
          });
      });
    });

    it('returns an error if the field is invalid', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .post('/api/inventory/' + item._id + '/customFields')
          .set('Authorization', adminToken)
          .send({
            field: "111111111111111111111111",
            value: 'hudson'
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.error.should.be.eql('Invalid field id');
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(0);
              done();
            });
          });
      });
    });

    it('returns an error if the field value is invalid for FLOAT', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .post('/api/inventory/' + item._id + '/customFields')
          .set('Authorization', adminToken)
          .send({
            field: defaultFields.float_number,
            value: 'Blah.0'
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.error.should.be.eql('Invalid value for field type');
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(0);
              done();
            });
          });
      });
    });

    it('returns an error if the field value is invalid for INT', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .post('/api/inventory/' + item._id + '/customFields')
          .set('Authorization', adminToken)
          .send({
            field: defaultFields.int_number,
            value: 1.5
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.error.should.be.eql('Invalid value for field type');
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(0);
              done();
            });
          });
      });
    });

    it('does not allow managers to add new field', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .post('/api/inventory/' + item._id + '/customFields')
          .set('Authorization', managerToken)
          .send({
            field: defaultFields.location._id,
            value: 'hudson'
          })
          .end((err, res) => {
            res.should.have.status(403);
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(0);
              done();
            });
          });
      });
    });

    it('does not allow standard users to add new field', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .post('/api/inventory/' + item._id + '/customFields')
          .set('Authorization', standardToken)
          .send({
            field: defaultFields.location._id,
            value: 'hudson'
          })
          .end((err, res) => {
            res.should.have.status(403);
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(0);
              done();
            });
          });
      });
    });

  });

  describe('PUT /inventory/:item_id/customFields/:field_id', () =>{
    it('adds a new custom field if it does not exist', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .put('/api/inventory/' + item._id + '/customFields/' + defaultFields.location._id)
          .set('Authorization', adminToken)
          .send({ value: 'ciemas'})
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.custom_fields.length.should.be.eql(1);
            res.body.custom_fields[0].field.should.be.eql(String(defaultFields.location._id));
            res.body.custom_fields[0].value.should.be.eql('ciemas');
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(1);
              foundItem.custom_fields[0].field.should.be.eql(defaultFields.location._id);
              foundItem.custom_fields[0].value.should.be.eql('ciemas');
              done();
            });
          });
      });
    });

    it('updates custom field', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
        custom_fields: [
          {
            field: defaultFields.location._id,
            value: 'ciemas'
          }
        ]
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .put('/api/inventory/' + item._id + '/customFields/' + defaultFields.location._id)
          .set('Authorization', adminToken)
          .send({value: 'hudson'})
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.custom_fields.length.should.be.eql(1);
            res.body.custom_fields[0].field.should.be.eql(String(defaultFields.location._id));
            res.body.custom_fields[0].value.should.be.eql('hudson');
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(1);
              foundItem.custom_fields[0].field.should.be.eql(defaultFields.location._id);
              foundItem.custom_fields[0].value.should.be.eql('hudson');
              done();
            });
          });
      });
    });

    it('returns an error if the field is invalid', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .put('/api/inventory/' + item._id + '/customFields/' + '111111111111111111111111')
          .set('Authorization', adminToken)
          .send({
            value: 'hudson'
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.error.should.be.eql('Invalid field id');
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(0);
              done();
            });
          });
      });
    });

    it('does not allow managers to update a new field', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
        custom_fields: [
          {
            field: defaultFields.location._id,
            value: 'ciemas'
          }
        ]
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .put('/api/inventory/' + item._id + '/customFields/' + defaultFields.location._id)
          .set('Authorization', managerToken)
          .send({value: 'hudson'})
          .end((err, res) => {
            res.should.have.status(403);
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields[0].value.should.be.eql('ciemas');
              done();
            });
          });
      });
    });

    it('does not allow standard users to update a new field', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
        custom_fields: [
          {
            field: defaultFields.location._id,
            value: 'ciemas'
          }
        ]
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .put('/api/inventory/' + item._id + '/customFields/' + defaultFields.location._id)
          .set('Authorization', managerToken)
          .send({value: 'hudson'})
          .end((err, res) => {
            res.should.have.status(403);
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields[0].value.should.be.eql('ciemas');
              done();
            });
          });
      });
    });

  });

  describe('DELETE /inventory/:item_id/customFields/:field_id', () =>{
    it('deletes the custom field if it exists', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
        custom_fields: [
          {
            field: defaultFields.location._id,
            value: 'ciemas'
          }
        ]
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .delete('/api/inventory/' + item._id + '/customFields/' + defaultFields.location._id)
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.message.should.be.eql('Successful');
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields.length.should.be.eql(0);
              done();
            });
          });
      });
    });

    it('does not throw error if field does not exist', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
        custom_fields: [
          {
            field: defaultFields.location._id,
            value: 'ciemas'
          }
        ]
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .delete('/api/inventory/' + item._id + '/customFields/' + defaultFields["restock_info"]._id)
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            should.not.exist(res.body.error);
            done();
          });
      });
    });

    it('does not allow managers to delete a field', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
        custom_fields: [
          {
            field: defaultFields.location._id,
            value: 'ciemas'
          }
        ]
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .delete('/api/inventory/' + item._id + '/customFields/' + defaultFields.location._id)
          .set('Authorization', managerToken)
          .end((err, res) => {
            res.should.have.status(403);
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields[0].value.should.be.eql('ciemas');
              done();
            });
          });
      });
    });

    it('does not allow standard users to delete a field', (done) => {
      var itemToCreate = Item({
        "quantity": 1000,
        "name": "test_item",
        custom_fields: [
          {
            field: defaultFields.location._id,
            value: 'ciemas'
          }
        ]
      });
      itemToCreate.save(function(err, item) {
        chai.request(server)
          .delete('/api/inventory/' + item._id + '/customFields/' + defaultFields.location._id)
          .set('Authorization', managerToken)
          .end((err, res) => {
            res.should.have.status(403);
            Item.findById(item._id, function(error, foundItem) {
              foundItem.custom_fields[0].value.should.be.eql('ciemas');
              done();
            });
          });
      });
    });

  });

});
