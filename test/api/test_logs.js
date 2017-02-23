process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Log = require('../../server/model/logs');
let Request = require('../../server/model/requests');
let Cart = require('../../server/model/carts');
let CustomField = require('../../server/model/customFields');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_inventory_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Logging API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;

  var allItems;

  beforeEach((done) => { //Before each test we empty the database
    Log.remove({}, (err) => {
      Item.remove({}, (err) => {
        should.not.exist(err);
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
                Item.insertMany(fakeJSONData).then(function(array) {
                  allItems = {};
                  array.forEach(function(item) {
                    allItems[item.name] = item;
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


  describe('Logging adding/removing/disbursing inventory items', () =>{
    it('logs adding an item', (done) => {
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', adminToken)
        .send({name: 'fizzbuzz', quantity: 10})
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          var itemId = res.body._id;
          Log.find({}, function(err, logs) {
            should.not.exist(err);
            logs.length.should.be.eql(1);
            logs[0].items.length.should.be.eql(1);
            String(logs[0].items[0]).should.be.eql(itemId);
            logs[0].initiating_user.should.be.eql(adminUser._id);
            logs[0].type.should.be.eql('ITEM_CREATED');
            should.not.exist(logs[0].affected_user);
            logs[0].description.should.be.eql('A new item called ' + res.body.name + ' was created.');
            done();
          });
        });
    });

    it('logs removing an item', (done) => {
      Item.findOne({name: "1k resistor"}, function(err, item) {
        chai.request(server)
          .delete('/api/inventory/' + item._id)
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              logs[0].items.length.should.be.eql(1);
              logs[0].items[0].should.be.eql(item._id);
              logs[0].initiating_user.should.be.eql(adminUser._id);
              logs[0].type.should.be.eql('ITEM_DELETED');
              should.not.exist(logs[0].affected_user);
              logs[0].description.should.be.eql('The item ' + item.name + ' was deleted from the inventory.');
              done();
            });
          });
      });
    });

    it('logs editing an item', (done) => {
      chai.request(server)
        .put('/api/inventory/' + allItems['1k resistor']._id)
        .set('Authorization', adminToken)
        .send({
          name: '1k thingy',
          quantity: 2000,
          tags: ["component", "electric","cheap", "thingy"],
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          Log.find({}, function(err, logs) {
            should.not.exist(err);
            logs.length.should.be.eql(1);
            var log = logs[0];
            log.items.length.should.be.eql(1);
            log.items[0].should.be.eql(allItems['1k resistor']._id);
            log.initiating_user.should.be.eql(adminUser._id);
            log.type.should.be.eql('ITEM_EDITED');
            should.not.exist(log.affected_user);
            log.description.should.include('name from "1k resistor" to "1k thingy"');
            log.description.should.include('quantity from 1000 to 2000');
            log.description.should.include('tags from ["component","electric","cheap"] to ["component","electric","cheap","thingy"]');
            log.description.should.not.include('location');
            done();
          });
        });
    });

    it('should not log edit if nothing was actually changed', (done) => {
      chai.request(server)
        .put('/api/inventory/' + allItems['1k resistor']._id)
        .set('Authorization', adminToken)
        .send({
          name: '1k resistor',
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          Log.find({}, function(err, logs) {
            should.not.exist(err);
            logs.length.should.be.eql(0);
            done();
          });
        });
    });

    describe('Logging editing custom fields in inventory items', () =>{
      var testField;
      beforeEach((done) => {
        CustomField.remove({}, function(error) {
          var newField = new CustomField({name: "test_field", type: "SHORT_STRING", isPrivate: false});
          newField.save(function(error, field) {
            testField = field;
            done();
          });
        });
      });

      it('logs editing a custom field in an item through PUT', (done) => {
        var newItem = new Item({
          name: "test_item",
          quantity: 10,
          custom_fields: [{field: testField._id, value: 'first value'}],
        });
        newItem.save(function(error, item) {
          chai.request(server)
            .put('/api/inventory/' + item._id + '/customFields/' + testField._id)
            .set('Authorization', adminToken)
            .send({
              value: 'new value',
            })
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              Log.find({}, function(err, logs) {
                should.not.exist(err);
                logs.length.should.be.eql(1);
                var log = logs[0];
                log.items.length.should.be.eql(1);
                log.items[0].should.be.eql(item._id);
                log.initiating_user.should.be.eql(adminUser._id);
                log.type.should.be.eql('ITEM_EDITED');
                should.not.exist(log.affected_user);
                log.description.should.be.eql('The item test_item was edited by changing the custom field '
                  + 'test_field from first value to new value.');
                done();
              });
            });
        });
      });

      it('logs editing a custom field in an item through POST', (done) => {
        var newItem = new Item({
          name: "test_item",
          quantity: 10
        });
        newItem.save(function(error, item) {
          chai.request(server)
            .post('/api/inventory/' + item._id + '/customFields/')
            .set('Authorization', adminToken)
            .send({
              field: testField._id,
              value: 'new value'
            })
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              Log.find({}, function(err, logs) {
                should.not.exist(err);
                logs.length.should.be.eql(1);
                var log = logs[0];
                log.items.length.should.be.eql(1);
                log.items[0].should.be.eql(item._id);
                log.initiating_user.should.be.eql(adminUser._id);
                log.type.should.be.eql('ITEM_EDITED');
                should.not.exist(log.affected_user);
                log.description.should.be.eql('The item test_item was edited by changing the custom field '
                  + 'test_field from null to new value.');
                done();
              });
            });
        });
      });

      it('logs editing a custom field in an item through DELETE', (done) => {
        var newItem = new Item({
          name: "test_item",
          quantity: 10,
          custom_fields: [{field: testField._id, value: 'first value'}]
        });
        newItem.save(function(error, item) {
          chai.request(server)
            .delete('/api/inventory/' + item._id + '/customFields/' + testField._id)
            .set('Authorization', adminToken)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              Log.find({}, function(err, logs) {
                should.not.exist(err);
                logs.length.should.be.eql(1);
                var log = logs[0];
                log.items.length.should.be.eql(1);
                log.items[0].should.be.eql(item._id);
                log.initiating_user.should.be.eql(adminUser._id);
                log.type.should.be.eql('ITEM_EDITED');
                should.not.exist(log.affected_user);
                log.description.should.be.eql('The item test_item was edited by changing the custom field '
                  + 'test_field from first value to null.');
                done();
              });
            });
        });
      });

      it('does not log a custom field edit if nothing was actually changed', (done) => {
        var newItem = new Item({
          name: "test_item",
          quantity: 10,
          custom_fields: [{field: testField._id, value: 'first value'}],
        });
        newItem.save(function(error, item) {
          chai.request(server)
            .put('/api/inventory/' + item._id + '/customFields/' + testField._id)
            .set('Authorization', adminToken)
            .send({
              value: 'first value',
            })
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              Log.find({}, function(err, logs) {
                should.not.exist(err);
                logs.length.should.be.eql(0);
                done();
              });
            });
        });
      });

    });

    describe('Logging requests', () =>{
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
            reason: "cuz"
          });
          newRequest.save(function(error, request) {
            should.not.exist(error);
            testRequest = request;
            done();
          });
        });
      });

      it('logs disbursing an item', (done) => {
        chai.request(server)
          .patch('/api/requests/' + testRequest._id)
          .set('Authorization', adminToken)
          .send({action: "DISBURSE"})
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              var log = logs[0];
              log.items.length.should.be.eql(3);
              log.items.forEach(function(item) {
                ([allItems['1k resistor']._id, allItems['2k resistor']._id, allItems['Oscilloscope']._id])
                  .should.include(item);
              })
              log.type.should.be.eql('REQUEST_DISBURSED');
              log.initiating_user.should.be.eql(adminUser._id);
              log.affected_user.should.be.eql(standardUser._id);
              log.description.should.include('2 1k resistors');
              log.description.should.include('5 2k resistors');
              log.description.should.include('1 Oscilloscope');
              log.description.should.include('The user admin disbursed');
              log.description.should.include('to the user standard');
              done();
            });
          });
      });

      it('should not log if disbursement fails', (done) => {
        Request.remove({}, (err) => {
          var newRequest = new Request({
            user: standardUser._id,
            items: [{
              item: allItems["1k resistor"]._id,
              quantity: 2000
            }],
            reason: "cuz"
          });
          newRequest.save(function(error, request) {
            chai.request(server)
              .patch('/api/requests/' + request._id)
              .set('Authorization', adminToken)
              .send({action: "DISBURSE"})
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                Log.find({}, function(err, logs) {
                  should.not.exist(err);
                  logs.length.should.be.eql(0);
                  done();
                });
              });
          });
        });
      });

      it('logs a standard user creating a request for himself', (done) => {
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
            reason: "cuz"
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              var log = logs[0];
              log.items.length.should.be.eql(2);
              log.items.forEach(function(item) {
                ([allItems['1k resistor']._id, allItems['Oscilloscope']._id])
                  .should.include(item);
              });
              log.type.should.be.eql('REQUEST_CREATED');
              log.initiating_user.should.be.eql(standardUser._id);
              should.not.exist(log.affectedUser);
              log.description.should.include('10 1k resistors');
              log.description.should.include('1 Oscilloscope');
              log.description.should.include('The user standard requested');
              done();
            });
          });
      });

      it('logs an admin user creating a request for someone else', (done) => {
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
            reason: "cuz"
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              var log = logs[0];
              log.items.forEach(function(item) {
                ([allItems['1k resistor']._id, allItems['Oscilloscope']._id])
                  .should.include(item);
              });
              log.type.should.be.eql('REQUEST_CREATED');
              log.initiating_user.should.be.eql(adminUser._id);
              log.affected_user.should.be.eql(standardUser._id);
              log.description.should.include("The user admin requested");
              log.description.should.include("for the user standard.");
              done();
            });
          });
      });

      it('logs an admin user checking out a cart for himself', (done) => {
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
                Log.find({}, function(err, logs) {
                  should.not.exist(err);
                  logs.length.should.be.eql(1);
                  var log = logs[0];
                  log.items.forEach(function(item) {
                    ([allItems['1k resistor']._id, allItems['Oscilloscope']._id])
                      .should.include(item);
                  });
                  log.type.should.be.eql('REQUEST_CREATED');
                  log.initiating_user.should.be.eql(adminUser._id);
                  should.not.exist(log.affected_user);
                  log.description.should.include("The user admin requested");
                  log.description.should.include('10 1k resistors');
                  log.description.should.include('1 Oscilloscope');
                  done();
                });
              });
          });
        });
      });

      it('logs an admin user checking out a cart for someone else', (done) => {
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
                Log.find({}, function(err, logs) {
                  should.not.exist(err);
                  logs.length.should.be.eql(1);
                  var log = logs[0];
                  log.items.forEach(function(item) {
                    ([allItems['1k resistor']._id, allItems['Oscilloscope']._id])
                      .should.include(item);
                  });
                  log.type.should.be.eql('REQUEST_CREATED');
                  log.initiating_user.should.be.eql(adminUser._id);
                  log.affected_user.should.be.eql(standardUser._id);
                  log.description.should.include("The user admin requested");
                  log.description.should.include('10 1k resistors');
                  log.description.should.include('1 Oscilloscope');
                  log.description.should.include('for the user standard.');
                  done();
                });
              });
          });
        });
      });

      it('logs editing a request', (done) => {
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
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              var log = logs[0];
              log.items.forEach(function(item) {
                ([allItems['1k resistor']._id, allItems['2k resistor']._id, allItems['Oscilloscope']._id])
                  .should.include(item);
              })
              log.type.should.be.eql('REQUEST_EDITED');
              log.initiating_user.should.be.eql(adminUser._id);
              log.affected_user.should.be.eql(standardUser._id);
              log.description.should.include("The user admin edited standard's request by changing");
              log.description.should.include('reason from "cuz" to "different reason"');
              log.description.should.include('status from "PENDING" to "APPROVED"');
              done();
            });
          });
      });

      it('logs someone editing his/her own request', (done) => {
        chai.request(server)
          .put('/api/requests/' + testRequest._id)
          .set('Authorization', standardToken)
          .send({
            reason: "different reason",
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              var log = logs[0];
              log.initiating_user.should.be.eql(standardUser._id);
              should.not.exist(log.affected_user);
              log.description.should.include("The user standard edited his/her own request by changing");
              done();
            });
          });
      });

      it('does not log editing a request if nothing changed', (done) => {
        chai.request(server)
          .put('/api/requests/' + testRequest._id)
          .set('Authorization', adminToken)
          .send({
            reason: "cuz"
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(0);
              done();
            });
          });
      });

      it('logs someone cancelling their own request', (done) => {
        chai.request(server)
          .delete('/api/requests/' + testRequest._id)
          .set('Authorization', standardToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              var log = logs[0];
              log.items.forEach(function(item) {
                ([allItems['1k resistor']._id, allItems['2k resistor']._id, allItems['Oscilloscope']._id])
                  .should.include(item);
              })
              log.type.should.be.eql('REQUEST_DELETED');
              log.initiating_user.should.be.eql(standardUser._id);
              should.not.exist(log.affected_user);
              log.description.should.be.eql("The user standard cancelled his/her own request.");
              done();
            });
          });
      });

      it('logs an admin cancelling another persons request', (done) => {
        chai.request(server)
          .delete('/api/requests/' + testRequest._id)
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              var log = logs[0];
              log.items.forEach(function(item) {
                ([allItems['1k resistor']._id, allItems['2k resistor']._id, allItems['Oscilloscope']._id])
                  .should.include(item);
              })
              log.type.should.be.eql('REQUEST_DELETED');
              log.initiating_user.should.be.eql(adminUser._id);
              log.affected_user.should.be.eql(standardUser._id);
              log.description.should.be.eql("The user admin cancelled standard's request.");
              done();
            });
          });
      });

      it('logs a manager cancelling another persons request', (done) => {
        chai.request(server)
          .delete('/api/requests/' + testRequest._id)
          .set('Authorization', managerToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Log.find({}, function(err, logs) {
              should.not.exist(err);
              logs.length.should.be.eql(1);
              var log = logs[0];
              log.items.forEach(function(item) {
                ([allItems['1k resistor']._id, allItems['2k resistor']._id, allItems['Oscilloscope']._id])
                  .should.include(item);
              })
              log.type.should.be.eql('REQUEST_DELETED');
              log.initiating_user.should.be.eql(managerUser._id);
              log.affected_user.should.be.eql(standardUser._id);
              log.description.should.be.eql("The user manager cancelled standard's request.");
              done();
            });
          });
      });
    });

  });



  describe('GET /logs', () =>{
    beforeEach((done) => {
      var testLogData = [
        {
          initiating_user: adminUser._id,
          items: [allItems["1k resistor"]._id],
          type: 'ITEM_CREATED',
          description: 'added 1k resistor'
        },
        {
          initiating_user: managerUser._id,
          items: [allItems["2k resistor"]._id],
          type: 'ITEM_DELETED',
          description: 'deleted 2k resistor'
        },
        {
          initiating_user: adminUser._id,
          items: [allItems["5k resistor"]._id],
          type: 'ITEM_CREATED',
          description: 'added 4k resistor'
        }
      ];
      Log.insertMany(testLogData).then(function(array) {
        done();
      }).catch(function(error) {
        done();
      });
    })
    it('returns all logs with no filters and no pagination', (done) => {
      chai.request(server)
        .get('/api/logs')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          // make sure fields are populating
          res.body.forEach(function(itemObj){
            itemObj.items[0].should.have.property("name");
            itemObj.initiating_user.should.have.property("username");
            (["1k resistor", "2k resistor", "5k resistor"]).should.include(itemObj.items[0].name);
            (["admin", "manager"]).should.include(itemObj.initiating_user.username);
          });
          done();
        });
    });

    it('disallows standard users from using the log', (done) => {
      chai.request(server)
        .get('/api/logs')
        .set('Authorization', standardToken)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });

  describe('GET /logs filtering and pagination', () =>{
    beforeEach((done) => {
      var testLogData = [
        {
          initiating_user: adminUser._id,
          items: [allItems["1k resistor"]._id],
          type: 'ITEM_CREATED',
          description: 'added 1k resistor',
          time_stamp: new Date('2017-02-10')
        },
        {
          initiating_user: managerUser._id,
          items: [allItems["2k resistor"]._id],
          type: 'ITEM_DELETED',
          description: 'deleted 2k resistor',
          time_stamp: new Date('2017-02-11')
        },
        {
          initiating_user: adminUser._id,
          items: [allItems["5k resistor"]._id],
          type: 'ITEM_CREATED',
          description: 'added 4k resistor',
          time_stamp: new Date('2017-02-12')
        },
        {
          initiating_user: managerUser._id,
          affected_user: standardUser._id,
          items: [allItems["Oscilloscope"]._id, allItems["120V"]._id],
          type: 'REQUEST_DISBURSED',
          description: 'Disbursed oscilloscope and 120V',
          time_stamp: new Date('2017-02-13'),
        },
        {
          initiating_user: adminUser._id,
          affected_user: managerUser._id,
          items: [allItems["Oscilloscope"]._id, allItems["100k resistor"]._id],
          type: 'REQUEST_DISBURSED',
          description: 'Disbursed oscilloscope and 100k resistor',
          time_stamp: new Date('2017-02-14'),
        },
      ];
      Log.insertMany(testLogData).then(function(array) {
        done();
      }).catch(function(error) {
        done();
      });
    });

    it('filters by user id for affected user', (done) => {
      chai.request(server)
        .get('/api/logs?user_id=' + standardUser._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].affected_user._id.should.be.eql(String(standardUser._id));
          done();
        });
    });

    it('filters by user id for both affected user and initiating_user', (done) => {
      chai.request(server)
        .get('/api/logs?user_id=' + managerUser._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          res.body.forEach(function(log) {
            log.should.satisfy(function(thisLog) {
              return thisLog.initiating_user._id === String(managerUser._id)
                || thisLog.affected_user._id === String(managerUser._id);
            });
          });
          done();
        });
    });

    it('filters by type', (done) => {
      chai.request(server)
        .get('/api/logs?type=' + 'ITEM_CREATED')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          res.body.forEach(function(log) {
            log.type.should.be.eql('ITEM_CREATED');
          });
          done();
        });
    });

    it('filters by time stamp start date', (done) => {
      chai.request(server)
        .get('/api/logs?start_date=' + '2017-02-12')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          var queryDate = new Date('2017-02-12');
          res.body.forEach(function(log) {
            log.time_stamp.should.satisfy(function(timeStamp) {
              var logDate = new Date(timeStamp);
              return logDate.getTime() >= queryDate.getTime();
            });
          });
          done();
        });
    });

    it('filters by time stamp end date', (done) => {
      chai.request(server)
        .get('/api/logs?end_date=' + '2017-02-12')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          var queryDate = new Date('2017-02-12');
          res.body.forEach(function(log) {
            log.time_stamp.should.satisfy(function(timeStamp) {
              var logDate = new Date(timeStamp);
              return logDate.getTime() <= queryDate.getTime();
            });
          });
          done();
        });
    });

    it('filters by time stamp start date and end date', (done) => {
      chai.request(server)
        .get('/api/logs?end_date=2017-02-12&start_date=2017-02-11')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          var startDate = new Date('2017-02-11');
          var endDate = new Date('2017-02-12');
          res.body.forEach(function(log) {
            log.time_stamp.should.satisfy(function(timeStamp) {
              var logDate = new Date(timeStamp);
              return logDate.getTime() >= startDate.getTime()
                && logDate.getTime() <= endDate.getTime();
            });
          });
          done();
        });
    });

    it('filters by item id', (done) => {
      chai.request(server)
        .get('/api/logs?item_id=' + allItems["Oscilloscope"]._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          res.body.forEach(function(log) {
            log.items.should.satisfy(function(items) {
              var index = items.findIndex(f=> f._id === String(allItems["Oscilloscope"]._id));
              return index >= 0;
            });
          });
          done();
        });
    });

    it('filters by item name', (done) => {
      chai.request(server)
        .get('/api/logs?item_name=Resistor')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(4);
          res.body.forEach(function(log) {
            var hasResistor = false;
            log.items.forEach(function(item) {
              if (item.name.includes('resistor')) {
                hasResistor = true;
              }
            });
            hasResistor.should.be.eql(true);
          });
          done();
        });
    });

    it('filters by item name that has no matches', (done) => {
      chai.request(server)
        .get('/api/logs?item_name=blahblah')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('paginates and returns first page', (done) => {
      chai.request(server)
        .get('/api/logs?page=1&per_page=3')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          var queryDate = new Date('2017-02-12');
          res.body.forEach(function(log) {
            log.time_stamp.should.satisfy(function(timeStamp) {
              var logDate = new Date(timeStamp);
              return logDate.getTime() >= queryDate.getTime();
            });
          });
          done();
        });
    });

    it('paginates and returns second page with less logs than per page', (done) => {
      chai.request(server)
        .get('/api/logs?page=2&per_page=3')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          var startDate = new Date('2017-02-10');
          var endDate = new Date('2017-02-11')
          res.body.forEach(function(log) {
            log.time_stamp.should.satisfy(function(timeStamp) {
              var logDate = new Date(timeStamp);
              return logDate.getTime() >= startDate.getTime()
                && logDate.getTime() <= endDate.getTime()
            });
          });
          done();
        });
    });

    it('paginates and returns empty page when no logs left', (done) => {
      chai.request(server)
        .get('/api/logs?page=3&per_page=3')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          should.not.exist(res.body.error);
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('paginates and returns all logs with high per page', (done) => {
      chai.request(server)
        .get('/api/logs?page=1&per_page=10000')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });
    it('returns error with invalid page or per page', (done) => {
      chai.request(server)
        .get('/api/logs?page=-1&per_page=10000')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res.body.error);
          done();
        });
    });

  });

});
