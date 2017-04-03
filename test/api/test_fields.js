process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../server/model/users');
let CustomField = require('../../server/model/customFields');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_fields_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Fields API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  var privateField;
  var nonPrivateField;

  beforeEach((done) => { //Before each test we empty the database
    CustomField.remove({}, (err) => {
      User.remove({}, (err) => {
        should.not.exist(err);
        helpers.createNewUser('admin', 'test', 'admin@email.com', 'ADMIN', function(err, user) {
          should.not.exist(err);
          adminToken = helpers.createAuthToken(user);
          adminUser = user;
          helpers.createNewUser('standard', 'test', 'standard@email.com', 'STANDARD', function(err, user) {
            should.not.exist(err);
            standardToken = helpers.createAuthToken(user);
            standardUser = user;
            helpers.createNewUser('manager', 'test', 'manager@email.com', 'MANAGER', function(err, user) {
              should.not.exist(err);
              managerToken = helpers.createAuthToken(user);
              managerUser = user;
              CustomField.insertMany(fakeJSONData).then(function(array){
                nonPrivateField = array.filter(function (obj) {
                  return obj.name === "location";
                })[0];
                privateField = array.filter(function (obj) {
                  return obj.name === "restock_info";
                })[0];
                done();
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

  describe('GET /customFields', () =>{
    it('GETs all custom fields for admin', (done) => {
      chai.request(server)
        .get('/api/customFields')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });

    it('GETs all custom fields for manager', (done) => {
      chai.request(server)
        .get('/api/customFields')
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });

    it('GETs only non-private fields for standard user', (done) => {
      chai.request(server)
        .get('/api/customFields')
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          res.body.should.satisfy(function(fields){
            return fields.every(function(field){
              return field.isPrivate.should.be.eql(false)
            })
          });
          done();
        });
    });

    it('Filters by name', (done) => {
      chai.request(server)
        .get('/api/customFields?name=number')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });

    it('Filters by type', (done) => {
      chai.request(server)
        .get('/api/customFields?type=FLOAT')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].name.should.be.eql('float_number');
          done();
        });
    });

    it('Filters by privacy for admin', (done) => {
      chai.request(server)
        .get('/api/customFields?isPrivate=false')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          res.body.should.satisfy(function(fields){
            return fields.every(function(field){
              return field.isPrivate.should.be.eql(false)
            })
          });
          done();
        });
    });

  });

  describe('GET /customFields by id', () =>{
    it('Allows standard user to get info about non-private field', (done) => {
      chai.request(server)
        .get('/api/customFields/' + nonPrivateField._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.name.should.be.eql(nonPrivateField.name);
          done();
        });
    });

    it('Does not allow standard user to get info about private field', (done) => {
      chai.request(server)
        .get('/api/customFields/' + privateField._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('Allows admin user to get info about private field', (done) => {
      chai.request(server)
        .get('/api/customFields/' + privateField._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.name.should.be.eql(privateField.name);
          done();
        });
    });

    it('Allows manager to get info about private field', (done) => {
      chai.request(server)
        .get('/api/customFields/' + privateField._id)
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.name.should.be.eql(privateField.name);
          done();
        });
    });

  });

  describe('POST /customFields Test', function () {
    it('admin can add new custom field', (done) => {
      chai.request(server)
        .post('/api/customFields')
        .set('Authorization', adminToken)
        .send({
          name: 'new_field',
          type: 'LONG_STRING',
          isPrivate: true,
          assetField: false
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.name.should.be.eql('new_field');
          CustomField.findById(res.body._id, function(error, field) {
            should.not.exist(error);
            field.name.should.be.eql('new_field');
            field.type.should.be.eql('LONG_STRING');
            field.isPrivate.should.be.eql(true);
            done();
          });
        });
    });

    it('manager cannot add new custom field', (done) => {
      chai.request(server)
        .post('/api/customFields')
        .set('Authorization', managerToken)
        .send({
          name: 'new_field',
          type: 'LONG_STRING',
          isPrivate: true,
        })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('standard user cannot add field', (done) => {
      chai.request(server)
        .post('/api/customFields')
        .set('Authorization', standardToken)
        .send({
          name: 'new_field',
          type: 'LONG_STRING',
          isPrivate: true,
        })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });

  describe('PUT /customFields by id', () =>{
    it('Does not allow a standard user to make changes', (done) => {
      chai.request(server)
        .put('/api/customFields/' + nonPrivateField._id)
        .set('Authorization', standardToken)
        .send({isPrivate: true})
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('Allows an admin user to change name, type, privacy', (done) => {
      chai.request(server)
        .put('/api/customFields/' + nonPrivateField._id)
        .set('Authorization', adminToken)
        .send({
          name: 'different_name',
          type: 'FLOAT',
          isPrivate: true
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.name.should.be.eql('different_name');
          res.body.type.should.be.eql('FLOAT');
          res.body.isPrivate.should.be.eql(true);
          CustomField.findById(nonPrivateField._id, function(error, field) {
            should.not.exist(error);
            field.name.should.be.eql('different_name');
            field.type.should.be.eql('FLOAT');
            field.isPrivate.should.be.eql(true);
            done();
          })
      });
    });

    it('Does not allow a manager to change name, type, privacy', (done) => {
      chai.request(server)
        .put('/api/customFields/' + nonPrivateField._id)
        .set('Authorization', managerToken)
        .send({
          name: 'different_name',
          type: 'FLOAT',
          isPrivate: true
        })
        .end((err, res) => {
          res.should.have.status(403);
          done();
      });
    });

  });

});
