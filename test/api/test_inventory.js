process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../model/items');
let User = require('../../model/users');
let helpers = require('../../server/auth_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_inventory_GETdata');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

// var request = require('supertest');
// require = require('really-need');

describe('/Inventory Test', function () {
  var token;
  beforeEach((done) => { //Before each test we empty the database
      Item.remove({}, (err) => {
        User.remove({}, (err) => {
          helpers.createNewUser('test_user', 'test', false, function(error, user) {
            token = helpers.createAuthToken(user);
            Item.insertMany(fakeJSONData).then(function(obj){
              done();
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
        .get('/api/inventory?required_tags=component,eLeCtRiC')
        .set('Authorization', token)
        .end((err, res) => {
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
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
      });
      });
      it('GETs items with 1 excluded tag', (done)=>{
        chai.request(server)
        .get('/api/inventory?excluded_tags=cHeAp')
        .set('Authorization', token)
        .end((err, res) => {
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
      it('GETs items with multiple excluded tags', (done)=>{
        chai.request(server)
        .get('/api/inventory?excluded_tags=cHeAp,pOwEr')
        .set('Authorization', token)
        .end((err, res) => {
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
      it('GETs all inventory with no excluded tags', (done)=>{
        chai.request(server)
        .get('/api/inventory?excluded_tags=')
        .set('Authorization', token)
        .end((err, res) => {
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
        .get('/api/inventory?name=100k&required_tags=electrIc, compOnent&excluded_tags=magneTic, Power')
        .set('Authorization', token)
        .end((err, res) => {
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
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
        done();
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
          res.should.have.status(200);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('name');
          res.body.errors.name.should.have.property('kind').eql('required');
        done();
      });
    });
    it('Should not POST without quantity field', (done) => {
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(itemNoQuantity)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('quantity');
          res.body.errors.quantity.should.have.property('kind').eql('required');
        done();
      });
    });
    it('Should not POST without has_instance_objects field', (done) => {
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(itemNoHasInstanceObjects)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('errors');
          res.body.errors.should.have.property('has_instance_objects');
          res.body.errors.has_instance_objects.should.have.property('kind').eql('required');
        done();
      });
    });
    it('POSTs successfully', (done)=>{
      chai.request(server)
        .post('/api/inventory')
        .set('Authorization', token)
        .send(item)
        .end((err, res)=>{
          res.should.have.status(200);
          // TODO: All fields are matching
        })
        done();
    })
  })
});