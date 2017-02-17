process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Cart = require('../../server/model/carts');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeItemData = require('./test_inventory_data');
let fakeCartData = require('./test_carts_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

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
          itemObj.item.should.have.property("location");
          (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          (["CIEMAS"]).should.include(itemObj.item.location);
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
        console.log(res.body);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.items.should.be.a('array');
        res.body.items.length.should.be.eql(2);
        res.body.items.forEach(function(itemObj){
          itemObj.item.should.have.property("name");
          itemObj.item.should.have.property("location");
          (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          (["CIEMAS"]).should.include(itemObj.item.location);
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
          itemObj.item.should.have.property("location");
          (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
          (["CIEMAS"]).should.include(itemObj.item.location);
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
            itemObj.item.should.have.property("location");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
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
            itemObj.item.should.have.property("location");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
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
            itemObj.item.should.have.property("location");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
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
            itemObj.item.should.have.property("location");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
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
            itemObj.item.should.have.property("location");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
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
            itemObj.item.should.have.property("location");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
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
            itemObj.item.should.have.property("location");
            (["1k resistor", "2k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
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
});
