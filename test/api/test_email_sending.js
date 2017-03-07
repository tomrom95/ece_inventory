process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let EmailSettings = require('../../server/model/emailSettings');
let User = require('../../server/model/users');
let Item = require('../../server/model/items');
let Cart = require('../../server/model/carts');
let Request = require('../../server/model/requests');
let helpers = require('../../server/auth/auth_helpers');
let fakeJSONData = require('./test_inventory_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

let nodemailerMock = require('nodemailer-mock');
let mockery = require('mockery');

var server = require('../../server');

describe('Email settings API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  var currentSettings;
  var allItems;

  beforeEach((done) => { //Before each test we empty the database
    Item.remove({}, function(error) {
      should.not.exist(error);
      Item.insertMany(fakeJSONData).then(function(array) {
        allItems = {};
        array.forEach(function(item) {
          allItems[item.name] = item;
        });
        EmailSettings.remove({}, (err) => {
          should.not.exist(err);
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
                  EmailSettings.getSingleton(function(error, settings) {
                    should.not.exist(error);
                    settings.subject_tag = 'subject';
                    settings.loan_emails = [
                      {date: new Date('2017-02-24'), body: 'first body'},
                      {date: new Date('2017-02-25'), body: 'second body'}
                    ]
                    settings.save(function(error, settings) {
                      should.not.exist(error);
                      currentSettings = settings;
                      User.update(
                        {username: 'manager'},
                        {$set: {subscribed: true}},
                        function(error) {
                          should.not.exist(error);
                          done();
                        }
                      );
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  before((done) =>{
    mockery.enable({
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('nodemailer', nodemailerMock);

    server = require('../../server');
    done();
  });

  afterEach((done) => {
    nodemailerMock.mock.reset();
    done();
  });

  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('Emailing after request creation', function() {
    it('should send an email if a user requests for himself', function(done){
      chai.request(server)
        .post('/api/requests/')
        .set('Authorization', standardToken)
        .send({
          user: standardUser._id,
          items: [
            {
              item: allItems["1k resistor"]._id,
              quantity: 10,
            },
            {
              item: allItems["Oscilloscope"]._id,
              quantity: 1,
            }
          ],
          reason: "cuz",
          action: "DISBURSEMENT"
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var sentMail = nodemailerMock.mock.sentMail();
          sentMail.length.should.be.eql(1);
          var email = sentMail[0];
          email.to.should.be.eql(standardUser.email);
          should.not.exist(email.cc);
          email.bcc.should.be.eql(managerUser.email);
          email.subject.should.be.eql(currentSettings.subject_tag + ' ' + 'New Inventory Request Created');
          email.text.should.include('(10) 1k resistors');
          email.text.should.include('(1) Oscilloscope');
          email.text.should.include('Hello standard,');
          email.text.should.include('You requested the following inventory items');
          done();
        });
    });

    it('sends email when admin user creates a request for someone else', (done) => {
      chai.request(server)
        .post('/api/requests/')
        .set('Authorization', adminToken)
        .send({
          user: standardUser._id,
          items: [
            {
              item: allItems["1k resistor"]._id,
              quantity: 10,
            },
            {
              item: allItems["Oscilloscope"]._id,
              quantity: 1,
            }
          ],
          reason: "cuz",
          action: "DISBURSEMENT"
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var sentMail = nodemailerMock.mock.sentMail();
          sentMail.length.should.be.eql(1);
          var email = sentMail[0];
          email.to.should.be.eql(standardUser.email);
          email.cc.should.be.eql(adminUser.email);
          email.bcc.should.be.eql(managerUser.email);
          email.subject.should.be.eql(currentSettings.subject_tag + ' ' + 'New Inventory Request Created');
          email.text.should.include('(10) 1k resistors');
          email.text.should.include('(1) Oscilloscope');
          email.text.should.include('Hello standard,');
          email.text.should.include('admin requested the following inventory items for you');
          done();
        });
    });

    it('sends email when admin user checks out a cart for himself', (done) => {
      Cart.remove({}, function(error) {
        var newCart = new Cart({
          user: adminUser._id,
          items: [
            {
              item: allItems["1k resistor"]._id,
              quantity: 10,
            },
            {
              item: allItems["Oscilloscope"]._id,
              quantity: 1,
            }
          ]
        });
        newCart.save(function(error, cart) {
          chai.request(server)
            .patch('/api/cart')
            .set('Authorization', adminToken)
            .send({
              action: 'CHECKOUT',
              reason: 'I want them'
            })
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              var sentMail = nodemailerMock.mock.sentMail();
              sentMail.length.should.be.eql(1);
              var email = sentMail[0];
              email.to.should.be.eql(adminUser.email);
              should.not.exist(email.cc);
              email.bcc.should.be.eql(managerUser.email);
              email.subject.should.be.eql(currentSettings.subject_tag + ' ' + 'New Inventory Request Created');
              email.text.should.include('(10) 1k resistors');
              email.text.should.include('(1) Oscilloscope');
              email.text.should.include('Hello admin,');
              email.text.should.include('You requested the following inventory item');
              done();
            });
        });
      });
    });

    it('sends email when admin user checks out a cart for someone else', (done) => {
      Cart.remove({}, function(error) {
        var newCart = new Cart({
          user: adminUser._id,
          items: [
            {
              item: allItems["1k resistor"]._id,
              quantity: 10,
            },
            {
              item: allItems["Oscilloscope"]._id,
              quantity: 1,
            }
          ]
        });
        newCart.save(function(error, cart) {
          chai.request(server)
            .patch('/api/cart')
            .set('Authorization', adminToken)
            .send({
              action: 'CHECKOUT',
              reason: 'I want them',
              user: standardUser._id
            })
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              var sentMail = nodemailerMock.mock.sentMail();
              sentMail.length.should.be.eql(1);
              var email = sentMail[0];
              email.to.should.be.eql(standardUser.email);
              email.cc.should.be.eql(adminUser.email);
              email.bcc.should.be.eql(managerUser.email);
              email.subject.should.be.eql(currentSettings.subject_tag + ' ' + 'New Inventory Request Created');
              email.text.should.include('(10) 1k resistors');
              email.text.should.include('(1) Oscilloscope');
              email.text.should.include('Hello standard,');
              email.text.should.include('admin requested the following inventory items for you');
              done();
            });
        });
      });
    });
  });

  describe('Sending emails after request changes', function() {
    var testRequest;
    beforeEach((done) => {
      Request.remove({}, (err) => {
        should.not.exist(err);
        var newRequest = new Request({
          user: standardUser._id,
          items: [
            {
              item: allItems["1k resistor"]._id,
              quantity: 2
            },
            {
              item: allItems["2k resistor"]._id,
              quantity: 5
            },
            {
              item: allItems["Oscilloscope"]._id,
              quantity: 1
            }
          ],
          reason: "cuz",
          action: "LOAN"
        });
        newRequest.save(function(error, request) {
          should.not.exist(error);
          testRequest = request;
          done();
        });
      });
    });

    it('emails after disbursing an item', (done) => {
      chai.request(server)
        .patch('/api/requests/' + testRequest._id)
        .set('Authorization', adminToken)
        .send({action: "DISBURSE"})
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var sentMail = nodemailerMock.mock.sentMail();
          sentMail.length.should.be.eql(1);
          var email = sentMail[0];
          email.to.should.be.eql(standardUser.email);
          email.cc.should.be.eql(adminUser.email);
          email.bcc.should.be.eql(managerUser.email);
          email.subject.should.be.eql(currentSettings.subject_tag + ' ' + 'Inventory Request Disbursed');
          email.text.should.include('(2) 1k resistors');
          email.text.should.include('(5) 2k resistors');
          email.text.should.include('(1) Oscilloscope');
          email.text.should.include('Hello standard,');
          email.text.should.include('has been disbursed by admin.');
          done();
        });
    });

    it('should not email if disbursement fails', (done) => {
      Request.remove({}, (err) => {
        var newRequest = new Request({
          user: standardUser._id,
          items: [{
            item: allItems["1k resistor"]._id,
            quantity: 2000
          }],
          reason: "cuz",
          action: "DISBURSEMENT"
        });
        newRequest.save(function(error, request) {
          should.not.exist(error);
          chai.request(server)
            .patch('/api/requests/' + request._id)
            .set('Authorization', adminToken)
            .send({action: "DISBURSE"})
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              var sentMail = nodemailerMock.mock.sentMail();
              sentMail.length.should.be.eql(0);
              done();
            });
        });
      });
    });

    it('emails after editing a request', (done) => {
      chai.request(server)
        .put('/api/requests/' + testRequest._id)
        .set('Authorization', adminToken)
        .send({
          reason: "different reason",
          status: "APPROVED"
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var sentMail = nodemailerMock.mock.sentMail();
          sentMail.length.should.be.eql(1);
          var email = sentMail[0];
          email.to.should.be.eql(standardUser.email);
          email.cc.should.be.eql(adminUser.email);
          email.bcc.should.be.eql(managerUser.email);
          email.subject.should.be.eql(currentSettings.subject_tag + ' ' + 'Inventory Request Updated');
          email.text.should.include('(2) 1k resistors');
          email.text.should.include('(5) 2k resistors');
          email.text.should.include('(1) Oscilloscope');
          email.text.should.include('Hello standard,');
          email.text.should.include('has been updated by admin by changing');
          email.text.should.include('reason from "cuz" to "different reason"');
          email.text.should.include('status from "PENDING" to "APPROVED"');
          done();
        });
    });

    it('does not email after editing a request if nothing changed', (done) => {
      chai.request(server)
        .put('/api/requests/' + testRequest._id)
        .set('Authorization', adminToken)
        .send({
          reason: "cuz"
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var sentMail = nodemailerMock.mock.sentMail();
          sentMail.length.should.be.eql(0);
          done();
        });
    });

    it('logs someone cancelling their request', (done) => {
      chai.request(server)
        .delete('/api/requests/' + testRequest._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var sentMail = nodemailerMock.mock.sentMail();
          sentMail.length.should.be.eql(1);
          var email = sentMail[0];
          email.to.should.be.eql(standardUser.email);
          should.not.exist(email.cc);
          email.bcc.should.be.eql(managerUser.email);
          email.subject.should.be.eql(currentSettings.subject_tag + ' ' + 'Inventory Request Cancelled');
          email.text.should.include('(2) 1k resistors');
          email.text.should.include('(5) 2k resistors');
          email.text.should.include('(1) Oscilloscope');
          email.text.should.include('Hello standard,');
          email.text.should.include('has been cancelled.');
          done();
        });
    });

    it('logs someone cancelling someone else\'s request', (done) => {
      chai.request(server)
        .delete('/api/requests/' + testRequest._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var sentMail = nodemailerMock.mock.sentMail();
          sentMail.length.should.be.eql(1);
          var email = sentMail[0];
          email.to.should.be.eql(standardUser.email);
          email.cc.should.be.eql(adminUser.email);
          email.bcc.should.be.eql(managerUser.email);
          email.subject.should.be.eql(currentSettings.subject_tag + ' ' + 'Inventory Request Cancelled');
          email.text.should.include('(2) 1k resistors');
          email.text.should.include('(5) 2k resistors');
          email.text.should.include('(1) Oscilloscope');
          email.text.should.include('Hello standard,');
          email.text.should.include('has been cancelled by admin.');
          done();
        });
    });

  });
});
