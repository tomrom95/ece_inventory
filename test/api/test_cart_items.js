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

describe('Cart Items API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  var item1_id;
  var item2_id;
  var item3_id;
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
                      Item.findOne({name: "5k resistor"}, function(err,item3){
                        item3_id = item3.id;
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

  describe('POST /cart/items', () =>{
    it('Should not POST existing item for admin, existing cart', (done) => {
      let itemObj = {
        item: item1_id,
        quantity: 100
      }
      chai.request(server)
      .post('/api/cart/items')
      .set('Authorization', adminToken)
      .send(itemObj)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.error.should.be.eql("Item already exists in this cart");
        done();
    });
  });
    it('Should POST new item for admin, existing cart', (done) => {
      let itemObj = {
        item: item3_id,
        quantity: 100
      }
      chai.request(server)
      .post('/api/cart/items')
      .set('Authorization', adminToken)
      .send(itemObj)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.items.should.be.a('array');
        res.body.items.length.should.be.eql(3);
        res.body.items.forEach(function(itemObj){
          itemObj.item.should.have.property("name");
          itemObj.item.should.have.property("location");
          (["1k resistor", "2k resistor", "5k resistor"]).should.include(itemObj.item.name);
          (["CIEMAS"]).should.include(itemObj.item.location);
        });
        res.body.user.should.be.eql(adminUser._id.toString());
        Cart.findOne({user: adminUser._id}, function(err, cart){
          should.not.exist(err);
          cart.should.be.a('object');
          cart.items.should.be.a("array");
          cart.items.length.should.be.eql(3);
          cart.user.should.be.eql(adminUser._id);
          done();
        })
      });
    });
    it('Should not POST existing item for standard, existing cart', (done) => {
      let itemObj = {
        item: item1_id,
        quantity: 100
      }
      chai.request(server)
      .post('/api/cart/items')
      .set('Authorization', standardToken)
      .send(itemObj)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.error.should.be.eql("Item already exists in this cart");
        done();
    });
  });
    it('Should POST new item for standard, existing cart', (done) => {
      let itemObj = {
        item: item3_id,
        quantity: 100
      }
      chai.request(server)
      .post('/api/cart/items')
      .set('Authorization', standardToken)
      .send(itemObj)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.items.should.be.a('array');
        res.body.items.length.should.be.eql(3);
        res.body.items.forEach(function(itemObj){
          itemObj.item.should.have.property("name");
          itemObj.item.should.have.property("location");
          (["1k resistor", "2k resistor", "5k resistor"]).should.include(itemObj.item.name);
          (["CIEMAS"]).should.include(itemObj.item.location);
        });
        res.body.user.should.be.eql(standardUser._id.toString());
        Cart.findOne({user: standardUser._id}, function(err, cart){
          should.not.exist(err);
          cart.should.be.a('object');
          cart.items.should.be.a("array");
          cart.items.length.should.be.eql(3);
          cart.user.should.be.eql(standardUser._id);
          done();
        })
      });
    });
    it('Should not POST existing item for manager, existing cart', (done) => {
      let itemObj = {
        item: item1_id,
        quantity: 100
      }
      chai.request(server)
      .post('/api/cart/items')
      .set('Authorization', managerToken)
      .send(itemObj)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.error.should.be.eql("Item already exists in this cart");
        done();
    });
  });
    it('Should POST new item for manager, existing cart', (done) => {
      let itemObj = {
        item: item3_id,
        quantity: 100
      }
      chai.request(server)
      .post('/api/cart/items')
      .set('Authorization', managerToken)
      .send(itemObj)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.items.should.be.a('array');
        res.body.items.length.should.be.eql(3);
        res.body.items.forEach(function(itemObj){
          itemObj.item.should.have.property("name");
          itemObj.item.should.have.property("location");
          (["1k resistor", "2k resistor", "5k resistor"]).should.include(itemObj.item.name);
          (["CIEMAS"]).should.include(itemObj.item.location);
        });
        res.body.user.should.be.eql(managerUser._id.toString());
        Cart.findOne({user: managerUser._id}, function(err, cart){
          should.not.exist(err);
          cart.should.be.a('object');
          cart.items.should.be.a("array");
          cart.items.length.should.be.eql(3);
          cart.user.should.be.eql(managerUser._id);
          done();
        })
      });
    });

    it('POST item creates new cart for manager without cart', (done) => {
      Cart.remove({}).then(function(obj){
        let itemObj = {
          item: item3_id,
          quantity: 100
        }
        chai.request(server)
        .post('/api/cart/items')
        .set('Authorization', managerToken)
        .send(itemObj)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(1);
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            itemObj.item.should.have.property("location");
            (["5k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
          });
          res.body.user.should.be.eql(managerUser._id.toString());
          Cart.findOne({user: managerUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(1);
            cart.user.should.be.eql(managerUser._id);
            done();
          })
        });
      });
    });
    it('POST item creates new cart for standard without cart', (done) => {
      Cart.remove({}).then(function(obj){
        let itemObj = {
          item: item3_id,
          quantity: 100
        }
        chai.request(server)
        .post('/api/cart/items')
        .set('Authorization', standardToken)
        .send(itemObj)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(1);
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            itemObj.item.should.have.property("location");
            (["5k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
          });
          res.body.user.should.be.eql(standardUser._id.toString());
          Cart.findOne({user: standardUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(1);
            cart.user.should.be.eql(standardUser._id);
            done();
          })
        });
      });
    });
    it('POST item creates new cart for admin without cart', (done) => {
      Cart.remove({}).then(function(obj){
        let itemObj = {
          item: item3_id,
          quantity: 100
        }
        chai.request(server)
        .post('/api/cart/items')
        .set('Authorization', adminToken)
        .send(itemObj)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(1);
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            itemObj.item.should.have.property("location");
            (["5k resistor"]).should.include(itemObj.item.name);
            (["CIEMAS"]).should.include(itemObj.item.location);
          });
          res.body.user.should.be.eql(adminUser._id.toString());
          Cart.findOne({user: adminUser._id}, function(err, cart){
            should.not.exist(err);
            cart.should.be.a('object');
            cart.items.should.be.a("array");
            cart.items.length.should.be.eql(1);
            cart.user.should.be.eql(adminUser._id);
            done();
          })
        });
      });
    });
  });

  // Test that user with new cart can exist
});
