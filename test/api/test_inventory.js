process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../model/items');
let server = require('../../server');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

// var request = require('supertest');
// require = require('really-need');

describe('/Inventory Test', function () {
  beforeEach((done) => { //Before each test we empty the database
        Item.remove({}, (err) => {
           done();
        });
    });
  describe('GET /inventory', () =>{
    it('GETs all inventory', (done) => {
      chai.request(server)
        .get('/inventory')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
        done();
      });
    });
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
        .post('/inventory')
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
        .post('/inventory')
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
        .post('/inventory')
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
        .post('/inventory')
        .send(item)
        .end((err, res)=>{
          res.should.have.status(200);
          // TODO: All fields are matching
        })
        done();
    })
  })
});
