process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let Instance = require('../../server/model/instances');
let User = require('../../server/model/users');
let auth_helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_instances_data');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Instance API Test', function() {
  var adminToken;
  var standardToken;
  var managerToken;
  var firstItemId = '111111111111111111111111';

  beforeEach((done) => { //Before each test we empty the database
    Instance.remove({}, (err) => {
      should.not.exist(err);
      Item.remove({}, (err) => {
        should.not.exist(err);
        User.remove({}, (err) => {
          should.not.exist(err);
          auth_helpers.createNewUser('admin', 'test', 'admin@email.com', 'ADMIN', function(err, user) {
            should.not.exist(err);
            token = auth_helpers.createAuthToken(user);
            auth_helpers.createNewUser('standard', 'test', 'standard@email.com', 'STANDARD', function(err, user) {
              should.not.exist(err);
              standardToken = auth_helpers.createAuthToken(user);
              auth_helpers.createNewUser('manager', 'test', 'manager@email.com', 'MANAGER', function(err, user) {
                should.not.exist(err);
                managerToken = auth_helpers.createAuthToken(user);
                Item.insertMany(fakeJSONData.items).then(function(obj){
                  Instance.insertMany(fakeJSONData.instances).then(function(obj) {
                    done();
                  }).catch(function(error) {console.log(error)});
                }).catch(function(error) {console.log(error)});
              });
            });
          });
          });
        });
      });
  });


  describe('GET Instances', () =>{
    it('GETs all instances', (done) => {
      chai.request(server)
      .get('/api/inventory/'+firstItemId+'/instances')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(4);
        res.body.should.all.have.property('tag');
        res.body.should.all.have.property('in_stock');
        res.body.forEach(function(instance) {
          instance.item.should.be.eql(firstItemId);
        });
        done();
      });
    });
    it('GETs in stock instances', (done) => {
      chai.request(server)
      .get('/api/inventory/'+firstItemId+'/instances?in_stock=true')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(2);
        res.body.forEach(function(instance) {
          instance.item.should.be.eql(firstItemId);
          instance.in_stock.should.be.eql(true);
        });
        done();
      });
    });
  });

  describe('PUT by Instance ID', () => {
    it('PUTs instance item by instance id, should not change in_stock', (done) => {
      Instance.findOne({tag: '1'}, function(error, instance) {
        should.not.exist(error);
        chai.request(server)
          .put('/api/inventory/' + firstItemId + '/instances/' + instance._id)
          .set('Authorization', token)
          .send({tag: 'newtag', in_stock: false})
          .end((error, res) => {
            should.not.exist(error);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.tag.should.be.eql('newtag');
            res.body.in_stock.should.be.eql(true);
            Instance.findById(instance._id, function(error, instance) {
              instance.tag.should.be.eql('newtag');
              instance.in_stock.should.be.eql(true);
              done();
            });
          });
      });
    });

  });

  describe('POST Instance', () => {

    it('Should POST instance successfully to asset', (done) => {
      let instance = {
        in_stock: true,
        tag: '12345'
      };
      chai.request(server)
        .post('/api/inventory/'+ firstItemId + '/instances')
        .set('Authorization', token)
        .send(instance)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.tag.should.be.eql('12345');
          res.body.in_stock.should.be.eql(true);
          res.body.item.should.be.eql(firstItemId);
          Instance.findOne({tag: '12345'}, function(error, instance) {
            should.not.exist(error);
            instance.in_stock.should.be.eql(true);
            String(instance.item).should.be.eql(firstItemId);
            Item.findById(firstItemId, function(error, item) {
              should.not.exist(error);
              item.quantity.should.be.eql(3);
              done();
            });
          });
        });
    });

    it('Should not POST instance to an item that is not an asset', (done) => {
      var lastItemId = '444444444444444444444444';
      let instance = {
        in_stock: true,
        tag: '12345'
      };
      chai.request(server)
        .post('/api/inventory/'+ lastItemId + '/instances')
        .set('Authorization', token)
        .send(instance)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql('This item is not an asset');
          Instance.findOne({tag: '12345'}, function(error, instance) {
            should.not.exist(instance);
            done();
          });
        });
    });

    it('Should not POST instance that is not in stock', (done) => {
      let instance = {
        in_stock: false,
        tag: '12345'
      };
      chai.request(server)
        .post('/api/inventory/'+ firstItemId + '/instances')
        .set('Authorization', token)
        .send(instance)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql('You cannot add an instance that is not in stock');
          Instance.findOne({tag: '12345'}, function(error, instance) {
            should.not.exist(instance);
            done();
          });
        });
    });
  });

  describe('DELETE Instance', () => {
    it('DELETE instance by instance id', (done)=> {
      Instance.findOne({tag: '1'}, function(error, instance) {
        chai.request(server)
          .delete('/api/inventory/'+firstItemId+'/instances/'+instance._id)
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.message.should.be.eql('Successful');
            Instance.findOne({tag: '1'}, function(error, instance) {
              should.not.exist(instance);
              Item.findById(firstItemId, function(error, item) {
                item.quantity.should.be.eql(1);
                done();
              });
            });
          });
      });
    });
  });

});
