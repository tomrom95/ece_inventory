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

    it('logs editing an item', (done) => {
      chai.request(server)
        .put('/api/inventory/' + allItems['1k resistor']._id)
        .set('Authorization', adminToken)
        .send({
          name: '1k thingy',
          quantity: 2000,
          tags: ["component", "electric","cheap", "thingy"],
          location: 'CIEMAS'
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
            log.type.should.be.eql('EDIT');
            should.not.exist(log.affected_user);
            log.description.should.include('name from 1k resistor to 1k thingy');
            log.description.should.include('quantity from 1000 to 2000');
            log.description.should.include('tags from component,electric,cheap to component,electric,cheap,thingy');
            log.description.should.not.include('location');
            done();
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

  describe('GET /logs filtering', () =>{
    beforeEach((done) => {
      var testLogData = [
        {
          initiating_user: adminUser._id,
          items: [allItems["1k resistor"]._id],
          type: 'NEW',
          description: 'added 1k resistor',
          time_stamp: new Date('2017-02-10')
        },
        {
          initiating_user: managerUser._id,
          items: [allItems["2k resistor"]._id],
          type: 'DELETED',
          description: 'deleted 2k resistor',
          time_stamp: new Date('2017-02-11')
        },
        {
          initiating_user: adminUser._id,
          items: [allItems["5k resistor"]._id],
          type: 'NEW',
          description: 'added 4k resistor',
          time_stamp: new Date('2017-02-12')
        },
        {
          initiating_user: managerUser._id,
          affected_user: standardUser._id,
          items: [allItems["Oscilloscope"]._id, allItems["120V"]._id],
          type: 'FULFILLED',
          description: 'Disbursed oscilloscope and 120V',
          time_stamp: new Date('2017-02-13'),
        },
        {
          initiating_user: adminUser._id,
          affected_user: managerUser._id,
          items: [allItems["Oscilloscope"]._id, allItems["100k resistor"]._id],
          type: 'FULFILLED',
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
        .get('/api/logs?type=' + 'NEW')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          res.body.forEach(function(log) {
            log.type.should.be.eql('NEW');
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

  });

});
