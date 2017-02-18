process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Log = require('../../server/model/logs');
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


  describe('Logging adding/removing inventory items', () =>{
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
            logs[0].type.should.be.eql('NEW');
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
              logs[0].type.should.be.eql('DELETED');
              should.not.exist(logs[0].affected_user);
              logs[0].description.should.be.eql('The item ' + item.name + ' was deleted from the inventory.');
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
          type: 'NEW',
          description: 'added 1k resistor'
        },
        {
          initiating_user: managerUser._id,
          items: [allItems["2k resistor"]._id],
          type: 'DELETED',
          description: 'deleted 2k resistor'
        },
        {
          initiating_user: adminUser._id,
          items: [allItems["5k resistor"]._id],
          type: 'NEW',
          description: 'added 4k resistor'
        }
      ];
      Log.insertMany(testLogData).then(function(array) {
        done();
      }).catch(function(error) {
        console.log(error);
        done();
      });
    })
    it('returns all logs with no filters', (done) => {
      chai.request(server)
        .get('/api/logs')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.length.should.be.eql(3);
          // make sure fields are populating
          res.body.items.forEach(function(itemObj){
            itemObj.item.should.have.property("name");
            itemObj.initiating_user.should.have.property("username");
            (["1k resistor", "2k resistor", "5k resistor"]).should.include(itemObj.item.name);
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
});
