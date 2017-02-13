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
      should.not.exist(err);
      helpers.createNewUser('test_user', 'test', 'STANDARD', function(err, user) {
        should.not.exist(err);
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
          should.not.exist(err);
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
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("User does not exist");
          done();
        });
    });
  });

});
