process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Cart = require('../../server/model/carts');
let Request = require('../../server/model/requests');
let CustomField = require('../../server/model/customFields');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeItemData = require('./demo_inventory_data');
let fakeCartData = require('./test_carts_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));
describe('Inventory Min Stock Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  var item1_id;
  var item2_id;
  var reqBody;
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
                Item.insertMany(fakeItemData).then(function(obj){
                  item1_id = obj[0]._id;
                  item2_id = obj[1]._id;
                  reqBody = {
                    "items": [item1_id, item2_id],
                    "threshold": 456,
                    "isEnabled": true
                  }
                  done();
                });
              });
            });
          });
        });
      });
    });
  });
  it('POSTs for item changes for admin', (done) => {
    chai.request(server)
      .post('/api/inventory/minstock')
      .set('Authorization', adminToken)
      .send(reqBody)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.length.should.be.eql(2);
        Item.findById(item1_id, function(err, item1){
          should.not.exist(err);
          item1.minstock.threshold.should.be.eql(456);
          item1.minstock.isEnabled.should.be.eql(true);
          Item.findById(item2_id, function(err, item2){
            should.not.exist(err);
            item2.minstock.threshold.should.be.eql(456);
            item2.minstock.isEnabled.should.be.eql(true);
            done();
          })
        })
      });
  });
  it('POSTs for item changes for Manager', (done) => {
    chai.request(server)
      .post('/api/inventory/minstock')
      .set('Authorization', managerToken)
      .send(reqBody)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.length.should.be.eql(2);
        Item.findById(item1_id, function(err, item1){
          should.not.exist(err);
          item1.minstock.threshold.should.be.eql(456);
          item1.minstock.isEnabled.should.be.eql(true);
          Item.findById(item2_id, function(err, item2){
            should.not.exist(err);
            item2.minstock.threshold.should.be.eql(456);
            item2.minstock.isEnabled.should.be.eql(true);
            done();
          })
        })
      });
  });
  it('Does not POST without threshold', (done) => {
    delete reqBody.threshold;
    chai.request(server)
      .post('/api/inventory/minstock')
      .set('Authorization', adminToken)
      .send(reqBody)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.error.should.be.eql("Threshold value needed");
        done();
      });
  });
  it('Does not POST without isEnabled', (done) => {
    delete reqBody.isEnabled;
    chai.request(server)
      .post('/api/inventory/minstock')
      .set('Authorization', adminToken)
      .send(reqBody)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.error.should.be.eql("IsEnabled value needed");
        done();
      });
  });
  it('Does not POST for standard', (done) => {
    chai.request(server)
      .post('/api/inventory/minstock')
      .set('Authorization', standardToken)
      .send(reqBody)
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });
  // TODO: Threshold should be non zero

  it('GETs all items with quantity below threshold', (done) => {
    reqBody.threshold = 10000;
    chai.request(server)
      .post('/api/inventory/minstock')
      .set('Authorization', adminToken)
      .send(reqBody)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        chai.request(server)
          .get('/api/inventory?lessThanThreshold=true')
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.length.should.be.eql(2);
            done();
          });
      });
  });
  it('GETs all items with quantity above threshold', (done) => {
    reqBody.threshold = 1;
    chai.request(server)
      .post('/api/inventory/minstock')
      .set('Authorization', adminToken)
      .send(reqBody)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        chai.request(server)
          .get('/api/inventory?lessThanThreshold=true')
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.length.should.be.eql(0);
            done();
          });
      });
  });
});
