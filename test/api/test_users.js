process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../server/model/users');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_users_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Inventory API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  beforeEach((done) => { //Before each test we empty the database
    User.remove({}, (err) => {
      should.not.exist(err);
      helpers.createNewUser('admin', 'test', 'ADMIN', function(err, user) {
        should.not.exist(err);
        adminToken = helpers.createAuthToken(user);
        adminUser = user;
        helpers.createNewUser('standard', 'test', 'STANDARD', function(err, user) {
          should.not.exist(err);
          standardToken = helpers.createAuthToken(user);
          standardUser = user;
          helpers.createNewUser('manager', 'test', 'MANAGER', function(err, user) {
            should.not.exist(err);
            managerToken = helpers.createAuthToken(user);
            managerUser = user;
            User.insertMany(fakeJSONData).then(function(obj){
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

  describe('GET /users', () =>{
    it('GETs all inventory', (done) => {
      chai.request(server)
        .get('/api/users')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
          done();
        });
    });

    it('Does not allow standard users to access the endpoint', (done) => {
      chai.request(server)
        .get('/api/users')
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('Does not allow managers to access the endpoint', (done) => {
      chai.request(server)
        .get('/api/users')
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('Filters by first name', (done) => {
      chai.request(server)
        .get('/api/users?first_name=john')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });

    it('Filters by last name', (done) => {
      chai.request(server)
        .get('/api/users?last_name=cook')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });

    it('Filters by both names', (done) => {
      chai.request(server)
        .get('/api/users?first_name=tim&last_name=cook')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].netid.should.be.eql('tc15');
          done();
        });
    });

    it('Filters by netid', (done) => {
      chai.request(server)
        .get('/api/users?netid=JA12')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].netid.should.be.eql('ja12');
          done();
        });
    });

    it('Filters by both names with bad spacing', (done) => {
      chai.request(server)
        .get('/api/users?first_name= tim &last_name= cook')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].netid.should.be.eql('tc15');
          done();
        });
    });

    it('Filters by role', (done) => {
      chai.request(server)
        .get('/api/users?role=ADMIN')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(4);
          done();
        });
    });

    it('Filters by username', (done) => {
      chai.request(server)
        .get('/api/users?username=test3')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].username.should.be.eql('test3');
          done();
        });
    });

  });

  describe('GET /users by id', () =>{
    it('Allows standard user to get info about himself', (done) => {
      chai.request(server)
        .get('/api/users/' + standardUser._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.username.should.be.eql('standard')
          done();
        });
    });

    it('Fails if invalid user id is provided for admin', (done) => {
      chai.request(server)
        .get('/api/users/' + "999c99867cc99a16bb62d641")
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql("User does not exist");
          done();
        });
    });

    it('Allows manager to get info about himself', (done) => {
      chai.request(server)
        .get('/api/users/' + managerUser._id)
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.username.should.be.eql('manager');
          done();
        });
    });

    it('Does not allow standard users to look up other users', (done) => {
      chai.request(server)
        .get('/api/users/' + managerUser._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('Does not allow managers to look up other users', (done) => {
      chai.request(server)
        .get('/api/users/' + standardUser._id)
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('Allows admins to look up anyone', (done) => {
      chai.request(server)
        .get('/api/users/' + managerUser._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.username.should.be.eql('manager');
          done();
        });
    });

  });

  describe('/register Test', function () {

    describe('POST /users', () =>{
      it('admin can register new user', (done) => {
        chai.request(server)
          .post('/api/users')
          .set('Authorization', adminToken)
          .send({
            username: 'test_user',
            password: 'test'
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.user.username.should.be.eql('test_user');
            should.not.exist(res.body.error);
            User.findById(res.body.user._id, function(error, user) {
              should.not.exist(error);
              user.username.should.be.eql('test_user');
              done();
            });

          });
      });

      it('non admin cannot register new user', (done) => {
        chai.request(server)
          .post('/api/users')
          .set('Authorization', standardToken)
          .send({
            username: 'other_user',
            password: 'test'
          })
          .end((err, res) => {
            should.exist(err);
            res.should.have.status(403);
            done();
          });
      });
    });
  });

  describe('PUT /user by id', () =>{
    it('Does not allow a standard user to make changes', (done) => {
      chai.request(server)
        .put('/api/users/' + standardUser._id)
        .set('Authorization', standardToken)
        .send({role: 'ADMIN'})
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('Does not allow a manager to make changes', (done) => {
      chai.request(server)
        .put('/api/users/' + managerUser._id)
        .set('Authorization', managerToken)
        .send({role: 'ADMIN'})
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });
    it('Fails if invalid user id is provided for admin', (done) => {
      chai.request(server)
        .put('/api/users/' + "999c99867cc99a16bb62d641")
        .set('Authorization', adminToken)
        .send({role:'ADMIN'})
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql("User does not exist");
          done();
        });
    });
    it('Allows an admin user to change first name, last name, role', (done) => {
      chai.request(server)
        .put('/api/users/' + standardUser._id)
        .set('Authorization', adminToken)
        .send({
          role: 'MANAGER',
          first_name: 'Glip',
          last_name: 'Glop'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.username.should.be.eql('standard');
          res.body.role.should.be.eql('MANAGER');
          res.body.first_name.should.be.eql('Glip');
          res.body.last_name.should.be.eql('Glop');
          User.findById(standardUser._id, function(error, user) {
            should.not.exist(error);
            user.username.should.be.eql('standard');
            user.role.should.be.eql('MANAGER');
            user.first_name.should.be.eql('Glip');
            user.last_name.should.be.eql('Glop');
            done();
          })
      });
    });

    it('Does not allow username, password, or is_local to be changed', (done) => {
      chai.request(server)
        .put('/api/users/' + standardUser._id)
        .set('Authorization', adminToken)
        .send({
          role: 'MANAGER',
          username: 'other',
          password: 'different',
          is_local: false
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.username.should.be.eql('standard');
          res.body.role.should.be.eql('MANAGER');
          res.body.is_local.should.be.eql(true);
          User.findById(standardUser._id, function(error, user) {
            should.not.exist(error);
            user.username.should.be.eql('standard');
            user.role.should.be.eql('MANAGER');
            user.password_hash.should.be.eql(standardUser.password_hash);
            user.is_local.should.be.eql(true);
            done();
          });
      });
    });
  });

});
