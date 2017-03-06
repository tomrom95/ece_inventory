process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Cart = require('../../server/model/carts');
let Request = require('../../server/model/requests');
let helpers = require('../../server/auth/auth_helpers');
let fakeItemData = require('./test_inventory_data');
let fakeCartData = require('./test_carts_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

let nodemailerMock = require('nodemailer-mock');
let mockery = require('mockery');

var server = require('../../server');

describe('Cart API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  var item1_id;
  var item2_id;
  beforeEach((done) => { //Before each test we empty the database
    Cart.remove({}, (err) => {
      should.not.exist(err);
      Item.remove({}, (err) => {
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
                Item.insertMany(fakeItemData).then(function(obj){
                  // get one of the items back
                  Item.findOne({name: "1k resistor"}, function(err,item1){
                    item1_id = item1.id;
                    Item.findOne({name: "2k resistor"}, function(err,item2){
                      item2_id = item2.id;
                      var itemsArray = [
                        {
                          item: item1_id,
                          quantity: 100
                        },
                        {
                          item: item2_id,
                          quantity: 200
                        }
                      ];
                      // Process JSON fake data for saving
                      let idArray = [adminUser._id, managerUser._id, standardUser._id];
                      for(i = 0; i < fakeCartData.length ; i++){
                        fakeCartData[i].user = idArray[i];
                        fakeCartData[i].items = itemsArray;
                      }
                      Cart.insertMany(fakeCartData, function(err,obj){
                        should.not.exist(err);
                        done();
                      });
                    });
                  });

                }).catch(function(error) {
                  should.not.exist(error);
                  done();
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

  describe('GET /cart', () =>{
    it('GETs cart for admin - existing cart', (done) => {
      chai.request(server)
      .get('/api/cart')
      .set('Authorization', adminToken)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.items.should.be.a('array');
        res.body.items.length.should.be.eql(2);
        res.body.items.forEach(function(itemObj){
          itemObj.item.should.have.property("name");
          (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
        });
        res.body.user.should.be.eql(adminUser._id.toString());
        done();
      });
    });
    it('GETs cart for admin - new cart', (done) => {
      Cart.remove({user: adminUser._id}).then(function(obj){
        chai.request(server)
        .get('/api/cart')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(0);
          res.body.user.should.be.eql(adminUser._id.toString());
          done();
        });
      });
    });
    it('GETs cart for manager - existing cart', (done) => {
      chai.request(server)
      .get('/api/cart')
      .set('Authorization', managerToken)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.items.should.be.a('array');
        res.body.items.length.should.be.eql(2);
        res.body.items.forEach(function(itemObj){
          itemObj.item.should.have.property("name");
          (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
        });
        res.body.user.should.be.eql(managerUser._id.toString());
        done();
      });
    });
    it('GETs cart for manager - new cart', (done) => {
      Cart.remove({user: managerUser._id}).then(function(obj){
        chai.request(server)
        .get('/api/cart')
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(0);
          res.body.user.should.be.eql(managerUser._id.toString());
          done();
        });
      });
    });
    it('GETs cart for standard user - existing cart', (done) => {
      chai.request(server)
      .get('/api/cart')
      .set('Authorization', standardToken)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.items.should.be.a('array');
        res.body.items.length.should.be.eql(2);
        res.body.items.forEach(function(itemObj){
          itemObj.item.should.have.property("name");
          (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
        });
        res.body.user.should.be.eql(standardUser._id.toString());
        done();
      });
    });
    it('GETs cart for standard user - new cart', (done) => {
      Cart.remove({user: standardUser._id}).then(function(obj){
        chai.request(server)
        .get('/api/cart')
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(0);
          res.body.user.should.be.eql(standardUser._id.toString());
          done();
        });
      });
    });
  });
  describe('PUT /cart', () =>{
    it('PUTs cart for admin - existing cart, changed description for own cart', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        var newCart = {
          description : "CHANGED"
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', adminToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.description.should.be.eql("CHANGED");
          res.body.user.should.be.eql(adminUser._id.toString());
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          });
          done();
        });
      })
    });
    it('PUTs cart for admin - existing cart, changed items for own cart', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        var newCart = {
          items: [],
          user: adminUser._id
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', adminToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a("array");
          res.body.items.length.should.be.eql(0);
          res.body.user.should.be.eql(adminUser._id.toString());
          Cart.findOne({user: adminUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(0);
            cart.user.should.be.eql(adminUser._id);
            done();
          })
        });
      })
    });
    it('PUTs cart for admin - existing cart, changed user id', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        var newCart = {
          user: managerUser._id,
          description: "CHANGED"
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', adminToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a("array");
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          });
          res.body.description.should.be.eql("CHANGED");
          res.body.user.should.be.eql(managerUser._id.toString());
          Cart.findOne({user: managerUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.description.should.be.eql("CHANGED");
            cart.user.should.be.eql(managerUser._id);
            done();
          })
        });
      })
    });
    it('PUTs cart for admin - existing cart, changed description for standard cart', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        var newCart = {
          description: "CHANGED",
          user: standardUser._id
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', adminToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a("array");
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          });
          Cart.findOne({user: standardUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.description.should.be.eql("CHANGED");
            cart.user.should.be.eql(standardUser._id);
            done();
          })
        });
      })
    });
    it('PUTs cart for admin - existing cart, changed items for standard cart', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        var newCart = {
          items: [],
          user: standardUser._id
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', adminToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a("array");
          res.body.items.length.should.be.eql(0);
          res.body.user.should.be.eql(standardUser._id.toString());
          Cart.findOne({user: standardUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(0);
            cart.user.should.be.eql(standardUser._id);
            done();
          })
        });
      })
    });
    it('PUTs cart for admin - existing cart, changed description for maanger cart', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        var newCart = {
          description : "CHANGED",
          user: managerUser._id
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', adminToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a("array");
          res.body.items.length.should.be.eql(2);
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          });
          Cart.findOne({user: managerUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.description.should.be.eql("CHANGED");
            cart.user.should.be.eql(managerUser._id);
            done();
          })
        });
      })
    });
    it('PUTs cart for admin - existing cart, changed items for manager cart', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        var newCart = {
          items: [],
          user: managerUser._id
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', adminToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a("array");
          res.body.items.length.should.be.eql(0);
          res.body.user.should.be.eql(managerUser._id.toString());
          Cart.findOne({user: managerUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(0);
            cart.user.should.be.eql(managerUser._id);
            done();
          })
        });
      })
    });
    // Standard User can change his own description
    it('PUTs cart for standard - existing cart, changed description for own cart', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        var newCart = {
          description : "CHANGED"
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', standardToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.description.should.be.eql("CHANGED");
          res.body.items.length.should.be.eql(2);
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          });
          res.body.user.should.be.eql(standardUser._id.toString());
          Cart.findOne({user: standardUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.description.should.be.eql("CHANGED");
            cart.items.length.should.be.eql(2);
            cart.user.should.be.eql(standardUser._id);
            done();
          })
        });
      })
    });
    // Standard user cannot change his own items
    it('PUTs cart for standard - existing cart, cannot change items for own cart', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        var newCart = {
          items : []
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', standardToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql("You are not authorized to change the items field");
          Cart.findOne({user: standardUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(2);
            cart.user.should.be.eql(standardUser._id);
            done();
          })
        });
      })
    });
    // Standard user cannot change his own user id
    it('PUTs cart for standard - existing cart, cannot change user id for own cart', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        var newCart = {
          user : adminUser._id
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', standardToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql("You are not authorized to change the user field");
          Cart.findOne({user: standardUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(2);
            cart.user.should.be.eql(standardUser._id);
            done();
          })
        });
      })
    });
    // Manager User can change his own description
    it('PUTs cart for manager - existing cart, changed description for own cart', (done) => {
      Cart.findOne({user: managerUser._id}, function(err, cart){
        var newCart = {
          description : "CHANGED"
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', managerToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.length.should.be.eql(2);
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          });
          res.body.description.should.be.eql("CHANGED");
          res.body.user.should.be.eql(managerUser._id.toString());
          Cart.findOne({user: managerUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.description.should.be.eql("CHANGED");
            cart.items.length.should.be.eql(2);
            cart.user.should.be.eql(managerUser._id);
            done();
          })
        });
      })
    });
    // Manager user cannot change his own items
    it('PUTs cart for manager - existing cart, cannot change items for own cart', (done) => {
      Cart.findOne({user: managerUser._id}, function(err, cart){
        var newCart = {
          items : []
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', managerToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql("You are not authorized to change the items field");
          Cart.findOne({user: managerUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(2);
            cart.user.should.be.eql(managerUser._id);
            done();
          })
        });
      })
    });
    // Manager user cannot change his own user id
    it('PUTs cart for manager - existing cart, can change user id', (done) => {
      Cart.findOne({user: managerUser._id}, function(err, cart){
        var newCart = {
          user : standardUser._id,
          description: "CHANGED FOR MANAGER"
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', managerToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.user.should.be.eql(standardUser._id.toString());
          res.body.items.length.should.be.eql(2);
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          });
          Cart.findOne({user: standardUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(2);
            cart.user.should.be.eql(standardUser._id);
            done();
          })
        });
      })
    });
    // Test if cart not already present
    it('PUTs cart for admin, non-existing cart', (done) => {
      Cart.remove({}).then(function(err){
        var newCart = {
          description: "NEW CART"
        }
        chai.request(server)
        .put('/api/cart')
        .set('Authorization', adminToken)
        .send(newCart)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.user.should.be.eql(adminUser._id.toString());
          res.body.description.should.be.eql("NEW CART");
          res.body.items.length.should.be.eql(0);
          Cart.findOne({user: adminUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(0);
            cart.user.should.be.eql(adminUser._id);
            cart.description.should.be.eql("NEW CART");
            done();
          })
        });
      })
    });
  });
  describe('PATCH /cart', () =>{
    it('PATCH cart for admin cart', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', adminToken)
        .send({
          action: 'FULFILL',
          reason: 'Test request',
          type: 'DISBURSEMENT'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.eql("Request successful");
          res.body.request.user.should.eql(adminUser._id.toString());
          res.body.request.reason.should.eql("Test request");
          res.body.request.status.should.eql("PENDING");
          res.body.request.items.should.be.a('array');
          res.body.request.items.length.should.be.eql(2);
          res.body.request.items.forEach(function(item){
            [100, 200].should.include(item.quantity);
            ["1k resistor","2k resistor"].should.include(item.item.name);
          })
          Request.findById(res.body.request._id, function(err, request){
            should.not.exist(err);
            request.user.should.eql(adminUser._id);
            request.reason.should.eql("Test request");
            request.status.should.eql("PENDING");
            request.items.should.be.a('array');
            request.items.length.should.be.eql(2);
            request.items.forEach(function(item){
              [100, 200].should.include(item.quantity);
            })
            Cart.findOne({user: adminUser._id}, function(err, cart){
              should.not.exist(err);
              cart.items.should.be.a('array');
              cart.items.length.should.be.eql(0);
              done();
            })
          });
      });
      });
    });
    it('PATCH cart for manager cart', (done) => {
      Cart.findOne({user: managerUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', managerToken)
        .send({
          action: 'FULFILL',
          reason: 'Test request',
          type: 'DISBURSEMENT'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.eql("Request successful");
          res.body.request.user.should.eql(managerUser._id.toString());
          res.body.request.reason.should.eql("Test request");
          res.body.request.status.should.eql("PENDING");
          res.body.request.items.should.be.a('array');
          res.body.request.items.length.should.be.eql(2);
          res.body.request.items.forEach(function(item){
            [100, 200].should.include(item.quantity);
            ["1k resistor","2k resistor"].should.include(item.item.name);
          })
          Request.findById(res.body.request._id, function(err, request){
            should.not.exist(err);
            request.user.should.eql(managerUser._id);
            request.reason.should.eql("Test request");
            request.status.should.eql("PENDING");
            request.items.should.be.a('array');
            request.items.length.should.be.eql(2);
            request.items.forEach(function(item){
              [100, 200].should.include(item.quantity);
            })
            Cart.findOne({user: managerUser._id}, function(err, cart){
              should.not.exist(err);
              cart.items.should.be.a('array');
              cart.items.length.should.be.eql(0);
              done();
            })
          });
      });
      });
    });
    it('PATCH cart for standard cart', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', standardToken)
        .send({
          action: 'FULFILL',
          reason: 'Test request',
          type: 'DISBURSEMENT'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.eql("Request successful");
          res.body.request.user.should.eql(standardUser._id.toString());
          res.body.request.reason.should.eql("Test request");
          res.body.request.status.should.eql("PENDING");
          res.body.request.items.should.be.a('array');
          res.body.request.items.length.should.be.eql(2);
          res.body.request.items.forEach(function(item){
            [100, 200].should.include(item.quantity);
            ["1k resistor","2k resistor"].should.include(item.item.name);
          })
          Request.findById(res.body.request._id, function(err, request){
            should.not.exist(err);
            request.user.should.eql(standardUser._id);
            request.reason.should.eql("Test request");
            request.status.should.eql("PENDING");
            request.items.should.be.a('array');
            request.items.length.should.be.eql(2);
            request.items.forEach(function(item){
              [100, 200].should.include(item.quantity);
            })
            Cart.findOne({user: standardUser._id}, function(err, cart){
              should.not.exist(err);
              cart.items.should.be.a('array');
              cart.items.length.should.be.eql(0);
              done();
            })
          });
      });
      });
    });
    it('PATCH cart for admin cart and set request for standard User', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', adminToken)
        .send({
          action: 'FULFILL',
          reason: 'Test request',
          type: 'DISBURSEMENT',
          user: standardUser._id
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.eql("Request successful");
          res.body.request.user.should.eql(standardUser._id.toString());
          Request.findById(res.body.request._id, function(err, request){
            should.not.exist(err);
            request.user.should.eql(standardUser._id);
            done();
          });
      });
      });
    });
    it('PATCH cart for standard user with user field filled as admin, error thrown', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', standardToken)
        .send({
          action: 'FULFILL',
          reason: 'Test request',
          type: 'DISBURSEMENT',
          user: adminUser._id
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.eql("Standard user cannot request for another user");
          done();
      });
      });
    });
    it('PATCH cart for manager user with user field filled as standard user', (done) => {
      Cart.findOne({user: managerUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', managerToken)
        .send({
          action: 'FULFILL',
          reason: 'Test request',
          type: 'DISBURSEMENT',
          user: standardUser._id
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.eql("Request successful");
          res.body.request.user.should.eql(standardUser._id.toString());
          Request.findById(res.body.request._id, function(err, request){
            should.not.exist(err);
            request.user.should.eql(standardUser._id);
            done();
          });
      });
      });
    });
    it('PATCH cart for admin cart and request made for self if user id invalid', (done) => {
      Cart.findOne({user: adminUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', adminToken)
        .send({
          action: 'FULFILL',
          reason: 'Test request',
          type: 'DISBURSEMENT',
          user: '99ae73d23d7d8010a8343a2f'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.eql("User does not exist");
          done();
      });
      });
    });
    it('PATCH cart for standard cart, then PATCH again should fail', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', standardToken)
        .send({
          action: 'FULFILL',
          reason: 'Test request',
          type: 'DISBURSEMENT'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.eql("Request successful");
          res.body.request.user.should.eql(standardUser._id.toString());
          res.body.request.reason.should.eql("Test request");
          res.body.request.status.should.eql("PENDING");
          res.body.request.items.should.be.a('array');
          res.body.request.items.length.should.be.eql(2);
          res.body.request.items.forEach(function(item){
            [100, 200].should.include(item.quantity);
            ["1k resistor","2k resistor"].should.include(item.item.name);
          })
          Request.findById(res.body.request._id, function(err, request){
            should.not.exist(err);
            request.user.should.eql(standardUser._id);
            request.reason.should.eql("Test request");
            request.status.should.eql("PENDING");
            request.items.should.be.a('array');
            request.items.length.should.be.eql(2);
            request.items.forEach(function(item){
              [100, 200].should.include(item.quantity);
            })
            Cart.findOne({user: standardUser._id}, function(err, cart){
              should.not.exist(err);
              cart.items.should.be.a('array');
              cart.items.length.should.be.eql(0);
              chai.request(server)
              .patch('/api/cart')
              .set('Authorization', standardToken)
              .send({
                action: 'FULFILL',
                reason: 'Test request',
                type: 'DISBURSEMENT'
              })
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.error.should.eql("There are no items in the cart to checkout");
                done();
              });
            })
          });
      });
      });
    });
    it('Does not PATCH cart for standard cart without reason', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', standardToken)
        .send({
          action: 'FULFILL',
          type: 'DISBURSEMENT'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.eql("Reason not provided in checkout");
          Request.find({user: standardUser._id}, function(err, request){
            should.not.exist(err);
            request.should.be.a('array');
            request.length.should.be.eql(0);
            done();
          });
      });
      });
    });
    it('Does not PATCH cart for standard cart without correct word CHECKOUT', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        should.not.exist(err);
        chai.request(server)
        .patch('/api/cart')
        .set('Authorization', standardToken)
        .send({
          action: 'CHECKIN',
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.eql("Action not recognized");
          Request.find({user: standardUser._id}, function(err, request){
            should.not.exist(err);
            request.should.be.a('array');
            request.length.should.be.eql(0);
            done();
          });
      });
      });
    });
    it('Does not PATCH empty cart', (done) => {
      Cart.findOne({user: standardUser._id}, function(err, cart){
        should.not.exist(err);
        cart.items = [];
        cart.save(function(err, cart){
          chai.request(server)
          .patch('/api/cart')
          .set('Authorization', standardToken)
          .send({
            action: 'FULFILL',
            reason: 'Test request',
            type: 'DISBURSEMENT'
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.error.should.eql("There are no items in the cart to checkout");
            done();
        });
        })
      });
    });
});
});
