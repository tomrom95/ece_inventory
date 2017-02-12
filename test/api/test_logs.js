process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Log = require('../../server/model/logs');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Logs API Test', function () {
  var token;
  var adminUser;
  beforeEach((done) => { //Before each test we empty the database
    Item.remove({}, (err) => {
      should.not.exist(err);
      Log.remove({}, (err) => {
        should.not.exist(err);
        User.remove({}, (err) => {
          should.not.exist(err);
          helpers.createNewUser('test_user', 'test', 'ADMIN', function(err, user) {
            should.not.exist(err);
            adminUser = user;
            token = helpers.createAuthToken(user);
            done();
          });
        });
      })
    });
  });

  describe('Changing inventory item quantity creates log', ()=>{
    it('logs acquisition of new instances', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .put('/api/inventory/'+item.id)
        .set('Authorization', token)
        .send({
          'name': 'Coaxial',
          'location': 'HUDSON',
          quantity: 3000
        })
        .end((err, res) => {
          should.not.exist(err);
          Log.findOne({item: item._id}, function(err, log) {
            should.not.exist(err);
            log.quantity.should.be.eql(2000);
            log.type.should.be.eql('ACQUISITION');
            log.created_by.should.be.eql(adminUser._id);
            done();
          });
        });
      });
    });
  });

  describe('GET query /logs', ()=>{
    it('gets all logs successfully', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
      });
      item.save((err, item) => {
        should.not.exist(err);
        let logs = [
          new Log({
            created_by: adminUser._id,
            type: 'LOSS',
            item: item._id,
            quantity: 100
          }),
          new Log({
            created_by: adminUser._id,
            type: 'ACQUISITION',
            item: item._id,
            quantity: 200
          })
        ];
        Log.insertMany(logs).then(function(obj){
          chai.request(server)
          .get('/api/logs/')
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(2);
            res.body[0].created_by.username.should.be.eql('test_user');
            res.body[0].created_by._id.should.be.eql(String(adminUser._id));
            res.body[0].item.name.should.be.eql('Laptop');
            done();
          });
        });
      });
    });
  });
});
