process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_inventory_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Inventory API Test', function () {
  var token;
  var standardToken;
  beforeEach((done) => { //Before each test we empty the database
      Item.remove({}, (err) => {
        should.not.exist(err);
        User.remove({}, (err) => {
          should.not.exist(err);
          helpers.createNewUser('test_user', 'test', 'ADMIN', function(err, user) {
            should.not.exist(err);
            token = helpers.createAuthToken(user);
            helpers.createNewUser('standard', 'test', 'STANDARD', function(err, user) {
              should.not.exist(err);
              standardToken = helpers.createAuthToken(user);
              Item.insertMany(fakeJSONData).then(function(obj){
                done();
              });
            });
          });
          });
        });
      });


  describe('GET /inventory', () =>{
    it('GETs all inventory', (done) => {
      chai.request(server)
        .get('/api/inventory')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
    });
  });
    // Gets by name
    describe('GET Query /inventory', ()=>{
    it('GETs item by exact name', (done)=>{
      chai.request(server)
      .get('/api/inventory?name=osCiLloSCope')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        res.body.should.all.have.property("name","Oscilloscope");
        res.body.should.all.have.property("model_number","123");
        res.body.should.all.have.property("location","HUDSON");
      done();
    });
    });
      it('GETs all inventory with null name', (done)=>{
        chai.request(server)
        .get('/api/inventory?name=')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs item by model number', (done)=>{
        chai.request(server)
        .get('/api/inventory?model_number=123')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body.should.all.have.property("name","Oscilloscope");
          res.body.should.all.have.property("model_number","123");
          res.body.should.all.have.property("location","HUDSON");
        done();
      });
      });
      it('GETs all inventory with null model number', (done)=>{
        chai.request(server)
        .get('/api/inventory?model_number=')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs items with location', (done)=>{
        chai.request(server)
        .get('/api/inventory?location=HuDSoN')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          res.body.should.all.have.property("location","HUDSON");
        done();
      });
      });
      it('GETs all inventory with null location', (done)=>{
        chai.request(server)
        .get('/api/inventory?location=')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs items with vendor info', (done)=>{
        chai.request(server)
        .get('/api/inventory?vendor_info=Microsoft')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(4);
          res.body.should.all.have.property("vendor_info","Microsoft");
        done();
      });
      });
      it('GETs items with no vendor info', (done)=>{
        chai.request(server)
        .get('/api/inventory?vendor_info=')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs items with one required tag', (done)=>{
        chai.request(server)
        .get('/api/inventory?required_tags=component')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(9);
          res.body.should.satisfy(function(items){
            return items.every(function(item){
              return item.tags.should.include("component");
            })
          });
        done();
      });
      });
      it('GETs items with multiple required tags', (done)=>{
        chai.request(server)
        .get('/api/inventory?required_tags=component , eLeCtRiC  ')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(7);
          res.body.should.satisfy(function(items){
            return items.every(function(item){
              return item.tags.should.include("component").and.include("electric");
            })
          });
        done();
      });
      });
      it('GETs all inventory with no required tags', (done)=>{
        chai.request(server)
        .get('/api/inventory?required_tags=')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs items with 1 excluded tag', (done)=>{
        chai.request(server)
        .get('/api/inventory?excluded_tags=cHeAp ')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          res.body.should.satisfy(function(items){
            return items.every(function(item){
              return item.tags.should.not.include("cheap").and.not.include("electric");
            })
          });
        done();
      });
      });
      it('Should not GETs items with excluded tags using single incomplete excluded tag word', (done)=>{
        chai.request(server)
        .get('/api/inventory?excluded_tags=chea')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs items with multiple excluded tags', (done)=>{
        chai.request(server)
        .get('/api/inventory?excluded_tags=cHeAp, pOwEr')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          res.body.should.satisfy(function(items){
            return items.every(function(item){
              return item.tags.should.not.include("cheap").and.not.include("Power");
            })
          });
        done();
      });
      });
      it('Should not GETs items with excluded tags using multiple incomplete excluded tag words', (done)=>{
        chai.request(server)
        .get('/api/inventory?excluded_tags=chea,pow')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs all inventory with no excluded tags', (done)=>{
        chai.request(server)
        .get('/api/inventory?excluded_tags=')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs items with multiple required and excluded tags', (done)=>{
        chai.request(server)
        .get('/api/inventory?required_tags=electrIc, compOnent&excluded_tags=magneTic, Power')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          res.body.should.satisfy(function(items){
            return items.every(function(item){
              return item.tags.should.include("electric")
                              .and.include("component")
                              .and.not.include("magnetic")
                              .and.not.include("Power");
            })
          });
        done();
      });
      });
      it('GETs items with name, multiple required and excluded tags', (done)=>{
        chai.request(server)
        .get('/api/inventory?name=100k&required_tags=electrIc,compOnent&excluded_tags=magneTic, Power')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].name.should.be.eql("100k resistor");
          res.body.should.satisfy(function(items){
            return items.every(function(item){
              return item.tags.should.include("electric")
                              .and.include("component")
                              .and.not.include("magnetic")
                              .and.not.include("Power");
            })
          });
        done();
      });
      });
      it('GETs all inventory with wrong parameter fields', (done)=>{
        chai.request(server)
        .get('/api/inventory?fds=sdot&dwer=fjks')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs 3rd page with 3 items per page', (done)=>{
          chai.request(server)
          .get('/api/inventory?page=3&per_page=3')
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(3);
            res.body[0].name.should.be.eql("150k inductor");
            res.body[1].name.should.be.eql("1m Wire");
            res.body[2].name.should.be.eql("5M Wire");
            done();
          });
      });
      it('GETs 3rd page with 100 items per page - should return empty []', (done)=>{
          chai.request(server)
          .get('/api/inventory?page=3&per_page=100')
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();
          });
      });
      it('GETs 100th page with 3 items per page - should return empty []', (done)=>{
          chai.request(server)
          .get('/api/inventory?page=100&per_page=3')
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();
          });
      });
      it('GETs 100th page with 100 items per page - should return empty []', (done)=>{
          chai.request(server)
          .get('/api/inventory?page=100&per_page=100')
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();
          });
      });
      it('GETs whole array for invalid per_page param', (done)=>{
          chai.request(server)
          .get('/api/inventory?page=3&per_pge=3')
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(12);
            done();
          });
      });
      it('GETs whole array for invalid page param', (done)=>{
          chai.request(server)
          .get('/api/inventory?pag=3&per_page=3')
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(12);
            done();
          });
      });
  });
  describe('GET /inventory/:item_id', ()=>{
    it('GETs inventory item by item id', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .get('/api/inventory/'+item.id)
        .set('Authorization', token)
        .send(item)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.location.should.be.eql("PERKINS");
          res.body.name.should.be.eql("Laptop");
          res.body.quantity.should.be.eql(1000);
          res.body._id.should.be.eql(item.id);
        done();
        });
      });
    });
  });
  describe('PUT /inventory/:item_id', ()=>{
    it('PUTs inventory item by item id with quantity change', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
        "vendor_info" : "Microsoft"
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .put('/api/inventory/'+item.id)
        .set('Authorization', token)
        .send({
          'name': 'Coaxial',
          'location': 'HUDSON',
          'vendor_info': 'Apple',
          'quantity': 3000
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.location.should.be.eql("HUDSON");
          res.body.vendor_info.should.be.eql("Apple");
          res.body.name.should.be.eql("Coaxial");
          res.body.quantity.should.be.eql(3000);
          res.body._id.should.be.eql(item.id);
        done();
        });
      });
    });
    it('PUTs inventory item by item id without quantity change', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
        "vendor_info" : "Microsoft"
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .put('/api/inventory/'+item.id)
        .set('Authorization', token)
        .send({
          'name': 'Coaxial',
          'location': 'HUDSON',
          'vendor_info': 'Apple',
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.location.should.be.eql("HUDSON");
          res.body.vendor_info.should.be.eql("Apple");
          res.body.name.should.be.eql("Coaxial");
          res.body.quantity.should.be.eql(1000);
          res.body._id.should.be.eql(item.id);
        done();
        });
      });
    });
    it('PUTs inventory item by item id with untrimmed tags', (done) => {
      let item = new Item({
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
            'tags':[' o n e ', ' t w o ']
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.name.should.be.eql("Laptop");
          res.body.quantity.should.be.eql(1000);
          res.body._id.should.be.eql(item.id);
          res.body.tags.should.include('o n e');
          res.body.tags.should.include('t w o');
          chai.request(server)
          // Get the item to test whether tags remain saved trimmed
          .get('/api/inventory?required_tags=   o n e ')
          .set('Authorization', token)
          .end((err,res)=>{
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(1);
            res.body[0].tags.should.include('o n e');
            res.body[0].tags.should.include('t w o');
            done();
          });
        });
      });
    });

    it('disallows is_deleted from being updated', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
        "vendor_info" : "Microsoft"
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .put('/api/inventory/'+item.id)
        .set('Authorization', token)
        .send({
          'is_deleted': 'true',
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql('You cannot update the delete field');
        done();
        });
      });
    });
  });

  describe('POST /inventory', () =>{
    let item = {
        name: "TEST_ITEM",
        quantity: 100,
        model_number:"1234",
        location:"Perkins",
        tags:["One"],
        vendor_info: "Microsoft",
        has_instance_objects:false
    }
    let itemNoName = {
        quantity:100,
        has_instance_objects:false
    }
    let itemNoQuantity = {
        name: "Resistor",
        has_instance_objects:false,
    }
    let itemNoHasInstanceObjects = {
        name: "Resistor",
        quantity: 100,
    }
    it('Should not POST without name field', (done) => {
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(itemNoName)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property('error');
          res.body.error.errors.should.have.property('name');
          res.body.error.errors.name.should.have.property('kind').eql('required');
        done();
      });
    });
    it('Should not POST without quantity field', (done) => {
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(itemNoQuantity)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property('error');
          res.body.error.errors.should.have.property('quantity');
          res.body.error.errors.quantity.should.have.property('kind').eql('required');
        done();
      });
    });
    it('Should not POST without has_instance_objects field', (done) => {
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(itemNoHasInstanceObjects)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property('error');
          res.body.error.errors.should.have.property('has_instance_objects');
          res.body.error.errors.has_instance_objects.should.have.property('kind').eql('required');
        done();
      });
    });
    it('POSTs successfully', (done)=>{
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(item)
        .end((err, res)=>{
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property("name","TEST_ITEM");
          res.body.should.have.property("quantity",100);
          res.body.should.have.property("vendor_info", "Microsoft");
          done();
        })

    })
    it('POSTs item with untrimmed tags, then GET successful by required tag', (done)=>{
      let item = {
          name: "TEST_ITEM",
          quantity: 100,
          tags:[" O ne  ", "   ch  eap "],
          has_instance_objects:false
      }
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(item)
        .end((err, res)=>{
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property("name","TEST_ITEM");
          res.body.should.have.property("quantity",100);
          res.body.tags.should.include("O ne");
          res.body.tags.should.include("ch  eap");
          // Then GET
          chai.request(server)
            .get('/api/inventory?required_tags=    ch  eap   ')
            .set('Authorization', token)
            .send(item)
            .end((err, res)=>{
              should.not.exist(err);
              res.should.have.status(200);
              res.body.length.should.be.eql(1);
              res.body[0].should.have.property("name","TEST_ITEM");
              res.body[0].should.have.property("quantity",100);
              res.body[0].tags.should.include("O ne");
              res.body[0].tags.should.include("ch  eap");
              done();
            });
        })
    })
    it('POSTs item with untrimmed tags, then GET unsuccessful by excluded tag', (done)=>{
      let item = {
          name: "TEST_ITEM",
          quantity: 100,
          tags:[" O ne  ", "   ch  eap "],
          has_instance_objects:false
      }
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(item)
        .end((err, res)=>{
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.have.property("name","TEST_ITEM");
          res.body.should.have.property("quantity",100);
          res.body.tags.should.include("O ne");
          res.body.tags.should.include("ch  eap");
          // Then GET
          chai.request(server)
            .get('/api/inventory?excluded_tags=    ch  eap   ')
            .set('Authorization', token)
            .send(item)
            .end((err, res)=>{
              res.should.have.status(200);
              res.body.length.should.be.eql(12);
              done();
            });
        })
    })
  })

  describe('DELETE /inventory/:item_id', ()=>{
    it('DELETE inventory item by item id', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .delete('/api/inventory/'+item.id)
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Delete successful');
        done();
        });
      });
    });

    it('DELETE inventory item by item id, then GET should succeed for admin', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .delete('/api/inventory/'+item.id)
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
              chai.request(server)
              .get('/api/inventory/'+item.id)
              .set('Authorization', token)
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.name.should.be.eql('Laptop');
                done();
          });
        });
      });
    });

    it('DELETE inventory item by item id, then GET should fail for a standard user', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .delete('/api/inventory/'+item.id)
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
              chai.request(server)
              .get('/api/inventory/'+item.id)
              .set('Authorization', standardToken)
              .end((err, res) => {
                res.should.have.status(403);
                done();
          });
        });
      });
    });

    it('DELETE inventory item by item id, then PUT should fail', (done) => {
      let item = new Item({
        "location": "PERKINS",
        "quantity": 1000,
        "name": "Laptop",
        "has_instance_objects": true,
      });
      item.save((err, item) =>{
        should.not.exist(err);
        chai.request(server)
        .delete('/api/inventory/'+item.id)
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
              chai.request(server)
              .put('/api/inventory/'+item.id)
              .set('Authorization', token)
              .end((err, res) => {
                should.not.exist(err);
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.a.property('error').eql('Item does not exist or has been deleted');
                done();
          });
        });
      });
    });
  });
});
