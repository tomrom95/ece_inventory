process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../server/model/users');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('/login Test', function () {

  beforeEach((done) => {
    User.remove({}, (err) => {
      helpers.createNewUser('test_user', 'test', 'STANDARD', function(error, user) {
        done();
      });
    });
  });

  describe('POST /login', () =>{
    it('logs in a real user', (done) => {
      chai.request(server)
        .post('/auth/login')
        .send({
          username: 'test_user',
          password: 'test'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.token.should.be.a('string');
          res.body.user.username.should.be.eql('test_user');
          done();
        });
    });

    it('denies a nonexistent user', (done) => {
      chai.request(server)
        .post('/auth/login')
        .send({
          username: 'not_test_user',
          password: 'test'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.error.should.be.eql("User does not exist");
          done();
        });
    });
  });

});

describe('/register Test', function () {
  var adminToken;
  var normalToken;
  beforeEach((done) => {
    User.remove({}, (err) => {
      helpers.createNewUser('admin_user', 'test', 'ADMIN', function(error, user) {
        adminToken = helpers.createAuthToken(user);
        helpers.createNewUser('not_admin', 'test', 'STANDARD', function(error, otherUser) {
          normalToken = helpers.createAuthToken(otherUser);
          done();
        });
      });
    });
  });

  describe('POST /user', () =>{
    it('admin can register new user', (done) => {
      chai.request(server)
        .post('/api/user')
        .set('Authorization', adminToken)
        .send({
          username: 'test_user',
          password: 'test'
        })
        .end((err, res) => {
          console.log(err);
          res.should.have.status(200);
          res.body.user.username.should.be.eql('test_user');
          should.not.exist(res.body.error);
          done();
        });
    });

    it('non admin cannot register new user', (done) => {
      chai.request(server)
        .post('/api/user')
        .set('Authorization', normalToken)
        .send({
          username: 'other_user',
          password: 'test'
        })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });

  describe('GET /user', () =>{
    it('Gets information about a user', (done) => {
      chai.request(server)
        .get('/api/user')
        .set('Authorization', adminToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.username.should.be.eql('admin_user');
          res.body.role.should.be.eql('ADMIN');
          done();
        });
    });
  });

});
