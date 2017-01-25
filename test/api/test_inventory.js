process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../model/items');
let User = require('../../model/users');
let helpers = require('../../server/auth_helpers');
let server = require('../../server');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

// var request = require('supertest');
// require = require('really-need');

describe('/Inventory Test', function () {
  var token;
  beforeEach((done) => { //Before each test we empty the database
      Item.remove({}, (err) => {
        User.remove({}, (err) => {
          helpers.createNewUser('test_user', 'test', false, function(error, user) {
            token = helpers.createAuthToken(user);
            done();
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
          res.body.length.should.be.eql(0);
        done();
      });
    });
    // Gets by exact name
    // Gets by name case-insensitive
    // Null name
    // Gets by model_number exact
    // Gets by model_number case-insensitive
    // Null Model number
    // Gets by location exact
    // Gets by location case-insensitive
    // null location
    // Gets by 1 required tag
    // Gets by multiple required tags
    // null required tag
    // Gets by 1 excluded tag
    // Gets by multiple excluded tags
    // null excluded tag
    // Gets by multiple required and excluded tags
    // Gets by name and multiple required and excluded tags
    // Gets by name, location, model_number, multiple required and excluded tags
    // Wrong parameters
  })

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
