process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let Instance = require('../../server/model/instances');
let User = require('../../server/model/users');
let auth_helpers = require('../../server/auth/auth_helpers');
let instances_helpers = require('./test_instances_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_instances_data');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Instance API Test', function() {
  var token;
  var item_id;
  beforeEach((done) => { //Before each test we empty the database
    Item.remove({}, (err) => {
      should.not.exist(err);
      User.remove({}, (err) => {
        should.not.exist(err);
        auth_helpers.createNewUser('test_user', 'test', 'ADMIN', function(error, user) {
          should.not.exist(error);
          token = auth_helpers.createAuthToken(user);
          fakeJSONData.instances = instances_helpers.createMockInstances();
          fakeJSONData.has_instance_objects=true;
          Item.insertMany(fakeJSONData).then(function(obj){
            item_id = obj[0]._id;
            done();
          });
        });
      });
    });
  });

  describe('GET Instances', () =>{
    it('GETs all instances', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(3);
        res.body.should.all.have.property('serial_number');
        res.body.should.all.have.property('condition');
        res.body.should.all.have.property('status');
        done();
      });
    });
    it('GETs instance by serial number', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?serial_number=123')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        res.body.should.all.have.property('serial_number', '123');
        res.body.should.all.have.property('condition', 'GOOD');
        res.body.should.all.have.property('status','AVAILABLE');
        done();
      });
    });
    it('GETs all instances by null serial number', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?serial_number=')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(3);
        res.body.should.all.have.property('serial_number');
        res.body.should.all.have.property('condition');
        res.body.should.all.have.property('status');
        done();
      });
    });
    it('GETs instances by condition', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?condition=NEEDS_REPAIR')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        res.body.should.all.have.property('serial_number', '456');
        res.body.should.all.have.property('condition', 'NEEDS_REPAIR');
        res.body.should.all.have.property('status','AVAILABLE');
        done();
      });
    });
    it('GETs all instances by null condition', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?condition=')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(3);
        res.body.should.all.have.property('serial_number');
        res.body.should.all.have.property('condition');
        res.body.should.all.have.property('status');
        done();
      });
    });
    it('GETs instances by status', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?status=LOST')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        res.body.should.all.have.property('serial_number','789');
        res.body.should.all.have.property('condition','GOOD');
        res.body.should.all.have.property('status','LOST');
        done();
      });
    });
    it('GETs all instances by null status', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?status=')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(3);
        res.body.should.all.have.property('serial_number');
        res.body.should.all.have.property('condition');
        res.body.should.all.have.property('status');
        done();
      });
    });
    it('GETs instances by condition and status', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?status=AVAILABLE&condition=NEEDS_REPAIR')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        res.body.should.all.have.property('serial_number','456');
        res.body.should.all.have.property('condition','NEEDS_REPAIR');
        res.body.should.all.have.property('status','AVAILABLE');
        done();
      });
    });
    it('GETs NO instances by non-existent pair of condition and status', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?status=LOST&condition=NEEDS_REPAIR')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
    it('GETs NO instances by truncated item id', (done) => {
      chai.request(server)
      .get('/api/inventory/'+'11111111'+'/instances?status=LOST&condition=NEEDS_REPAIR')
      .set('Authorization', token)
      .end((err, res) => {
        should.exist(err);
        res.should.have.status(500);
        res.body.should.be.a('object');
        done();
      });
    });
    it('GETs NO instances by invalid, full-length item id', (done) => {
      chai.request(server)
      .get('/api/inventory/'+'900000000000000000000000'+'/instances?status=LOST&condition=NEEDS_REPAIR')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
    it('GETs NO instances by wrong param fields', (done) => {
      chai.request(server)
      .get('/api/inventory/'+item_id+'/instances?serial_asdnsdfumber=LgfdOST&condisdtion=dfs')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(3);
        done();
      });
    });
  });

  describe('GET by ID Instances', () => {
    it('GETs instance item by instance id', (done) => {
      let instance = new Instance({
        serial_number: '999',
        status: 'IN_USE',
        condition: 'NEEDS_REPAIR'
      });
      Item.findById(item_id, function(err,item){
        item.instances.push(instance);
        item.save(function(err,item){
          chai.request(server)
          // PUT the modified item
          .get('/api/inventory/'+item_id)
          .set('Authorization', token)
          .send(item)
          .end((err, res) => {
            // GET by ID for Instance
            chai.request(server)
            .get('/api/inventory/'+item_id+'/'+instance.id)
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body._id.should.be.eql(instance.id);
              res.body.serial_number.should.be.eql('999');
              res.body.status.should.be.eql('IN_USE');
              res.body.condition.should.be.eql('NEEDS_REPAIR');
              done();
            });
          });
        });
      });
    });
  });

  describe('PUT by Instance ID', () => {
    it('PUTs instance item by instance id', (done) => {
      let instance = new Instance({
        serial_number: '999',
        status: 'IN_USE',
        condition: 'NEEDS_REPAIR'
      });
      Item.findById(item_id, function(err,item){
        item.instances.push(instance);
        item.save(function(err,item){
          chai.request(server)
          // PUT the modified item
          .get('/api/inventory/'+item_id)
          .set('Authorization', token)
          .send(item)
          .end((err, res) => {
            // PUT by ID for Instance
            instance.serial_number = '888';
            instance.condition = 'GOOD';
            instance.status = 'LOST';
            chai.request(server)
            .put('/api/inventory/'+item_id+'/'+instance.id)
            .set('Authorization', token)
            .send(instance)
            .end((err, res) => {
              res.should.have.status(200);
              res.body._id.should.be.eql(instance.id);
              res.body.serial_number.should.be.eql('888');
              res.body.status.should.be.eql('LOST');
              res.body.condition.should.be.eql('GOOD');
              done();
            });
          });
        });
      });
    });
  });

  describe('POST Instance', () => {
    it('Should not POST instance without serial number', (done) => {
      Item.findById(item_id, function (err, item){
        let instance = new Instance({
          status: 'IN_USE',
          condition: 'NEEDS_REPAIR'
        });
        chai.request(server)
        // PUT the modified item
        .post('/api/inventory/'+item_id+'/instances')
        .set('Authorization', token)
        .send(item)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('error','Serial number is required');
          done();
        });
      });
    });
    it('Should not POST instance with invalid item id', (done) => {
      Item.findById(item_id, function (err, item){
        let instance = new Instance({
          serial_number: '888',
          status: 'IN_USE',
          condition: 'NEEDS_REPAIR'
        });
        chai.request(server)
        .post('/api/inventory/'+'900000000000000000000000'+'/instances')
        .set('Authorization', token)
        .send(item)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('error','Item does not exist');
          done();
        });
      });
    });
    it('Should POST instance with default values given invalid body params', (done) => {
      Item.findById(item_id, function (err, item){
        let instance = new Instance({
          serial_number: '888',
          statusssss: 'IN_USE',
          conditionnnnn: 'NEEDS_REPAIR'
        });
        chai.request(server)
        .post('/api/inventory/'+ item_id + '/instances')
        .set('Authorization', token)
        .send(instance)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('serial_number', '888');
          res.body.should.have.property('status','AVAILABLE');
          res.body.should.have.property('condition', 'GOOD');
          done();
        });
      });
    });
    it('Should POST instance with has_instance_objects from F -> T', (done) => {
      let item =   {
        "location": "CIEMAS",
        "quantity": 1000,
        "name": "5M Wire",
        "has_instance_objects": false,
        "vendor_info": "Qualcomm",
        "tags": [
          "component",
          "connector"
        ]
      };
      var item_id;
      chai.request(server)
      .post('/api/inventory')
      .set('Authorization', token)
      .send(item)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.has_instance_objects.should.be.false;
        item_id = res.body._id;
        let instance = new Instance({
          serial_number: '888',
          status: 'IN_USE',
          condition: 'NEEDS_REPAIR'
        });
        chai.request(server)
        .post('/api/inventory/'+item_id+'/instances')
        .set('Authorization', token)
        .send(instance)
        .end((err, res) => {
          res.should.have.status(200);
          Item.findById(item_id, function(err, item){
            item.has_instance_objects.should.be.true;
            done();
          });
        });
      });
    });
    it('Should POST instance with existing instances, has_instance_objects stays T', (done) => {
      let item = new Item({
        "location": "CIEMAS",
        "quantity": 1000,
        "name": "1k BJT",
        "has_instance_objects": true,
        "tags": [
          "component",
          "electric",
          "cheap"
        ],
        "instances":[
          {
            "serial_number": "11111",
            "status": "IN_USE",
            "condition": "GOOD"
          },
          {
            "serial_number": "11112",
            "status": "IN_USE",
            "condition": "GOOD"
          }
        ]
      });
      let instance = {
        "serial_number": "11111",
        "status": "IN_USE",
        "condition": "GOOD"
      }
      item.save(function(err, item){
        chai.request(server)
        // DELETE the modified item
        .post('/api/inventory/'+item._id+'/instances')
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          Item.findById(item._id, function(err,item){
            item.has_instance_objects.should.be.true;
            done();
          });
        });
      });
    });

    it('Should POST instance successfully', (done) => {
      Item.findById(item_id, function (err, item){
        let instance = new Instance({
          serial_number: '888',
          status: 'IN_USE',
          condition: 'NEEDS_REPAIR'
        });
        chai.request(server)
        .post('/api/inventory/'+ item_id + '/instances')
        .set('Authorization', token)
        .send(instance)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('serial_number', '888');
          res.body.should.have.property('status','IN_USE');
          res.body.should.have.property('condition', 'NEEDS_REPAIR');
          done();
        });
      });
    });
  });
  describe('DELETE Instance', () => {
    it('DELETE instance by instance id', (done)=> {
      let instance = new Instance({
        serial_number: '999',
        status: 'IN_USE',
        condition: 'NEEDS_REPAIR'
      });
      Item.findById(item_id, function(err,item){
        item.instances.push(instance);
        item.save(function(err,item){
          chai.request(server)
          // DELETE the modified item
          .delete('/api/inventory/'+item_id+'/'+instance.id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.message.should.be.eql('Delete successful');
            done();
          });
        });
      });
    });
    it('DELETE remaining instance with has_instance_objects from T -> F', (done) => {
      let item = {
        "location": "CIEMAS",
        "quantity": 1000,
        "name": "1k BJT",
        "has_instance_objects": true,
        "tags": [
          "component",
          "electric",
          "cheap"
        ]
      };
      chai.request(server)
      .post('/api/inventory')
      .set('Authorization', token)
      .send(item)
      .end((err, res) => {
        // Post an instance
        let instance = {
          "serial_number": "11111",
          "status": "IN_USE",
          "condition": "GOOD"
        };
        var itemID = res.body._id;
        chai.request(server)
        .post('/api/inventory/'+res.body._id+'/instances')
        .set('Authorization', token)
        .send(instance)
        .end((err,res) => {
          Item.findById(itemID, function(err, item){
            item.has_instance_objects.should.be.true;
            chai.request(server)
            .delete('/api/inventory/'+itemID+'/'+res.body._id)
            .set('Authorization', token)
            .end((err,res)=>{
              Item.findById(itemID, function(err, item){
                item.has_instance_objects.should.be.false;
                done();
              });
            });
          });

        });
      });
    });
    it('DELETE instance with existing instances, has_instance_objects remains T', (done) => {
      let item = new Item({
        "location": "CIEMAS",
        "quantity": 1000,
        "name": "1k BJT",
        "has_instance_objects": true,
        "tags": [
          "component",
          "electric",
          "cheap"
        ],
        "instances":[
          {
            "serial_number": "11111",
            "status": "IN_USE",
            "condition": "GOOD"
          },
          {
            "serial_number": "11112",
            "status": "IN_USE",
            "condition": "GOOD"
          }
        ]
      });
      item.save(function(err, item){
        var instance_id = item.instances[0]._id;
        chai.request(server)
        // DELETE the modified item
        .delete('/api/inventory/'+item._id+'/'+instance_id)
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.message.should.be.eql("Delete successful");
          Item.findById(item._id, function(err,item){
            item.has_instance_objects.should.be.true;
            done();
          });
        });
      });
    });

    it('DELETE instance by instance id, then DELETE should fail', (done)=> {
      let instance = new Instance({
        serial_number: '999',
        status: 'IN_USE',
        condition: 'NEEDS_REPAIR'
      });
      Item.findById(item_id, function(err,item){
        item.instances.push(instance);
        item.save(function(err,item){
          chai.request(server)
          // DELETE the modified item
          .delete('/api/inventory/'+item_id+'/'+instance.id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.message.should.be.eql('Delete successful');
            chai.request(server)
            // DELETE the modified item
            .delete('/api/inventory/'+item_id+'/'+instance.id)
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.error.should.be.eql('Instance does not exist in item');
              done();
            });
          });
        });
      });
    });
    it('DELETE instance by instance id, then GET should fail', (done)=> {
      let instance = new Instance({
        serial_number: '999',
        status: 'IN_USE',
        condition: 'NEEDS_REPAIR'
      });
      Item.findById(item_id, function(err,item){
        item.instances.push(instance);
        item.save(function(err,item){
          chai.request(server)
          // DELETE the modified item
          .delete('/api/inventory/'+item_id+'/'+instance.id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.message.should.be.eql('Delete successful');
            chai.request(server)
            // DELETE the modified item
            .get('/api/inventory/'+item_id+'/'+instance.id)
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.error.should.be.eql('Instance does not exist in item');
              done();
            });
          });
        });
      });
    });
    it('DELETE instance by instance id, then PUT should fail', (done)=> {
      let instance = new Instance({
        serial_number: '999',
        status: 'IN_USE',
        condition: 'NEEDS_REPAIR'
      });
      Item.findById(item_id, function(err,item){
        item.instances.push(instance);
        item.save(function(err,item){
          chai.request(server)
          // DELETE the modified item
          .delete('/api/inventory/'+item_id+'/'+instance.id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.message.should.be.eql('Delete successful');
            chai.request(server)
            // DELETE the modified item
            .put('/api/inventory/'+item_id+'/'+instance.id)
            .set('Authorization', token)
            .send(instance)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.error.should.be.eql('Instance does not exist in item');
              done();
            });
          });
        });
      });
    });
  });
})
