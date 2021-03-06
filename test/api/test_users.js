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

describe('Users API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  beforeEach((done) => { //Before each test we empty the database
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

    it('Allows managers to access the endpoint', (done) => {
      chai.request(server)
        .get('/api/users')
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(12);
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
          res.body.username.should.be.eql('standard');
          res.body.email.should.be.eql('standard@email.com');
          done();
        });
    });

    it('Fails if invalid user id is provided for admin for GET', (done) => {
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
          res.body.email.should.be.eql('manager@email.com');
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

    it('Allows managers to look up other users', (done) => {
      chai.request(server)
        .get('/api/users/' + standardUser._id)
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.username.should.be.eql('standard');
          res.body.email.should.be.eql('standard@email.com');
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
          res.body.email.should.be.eql('manager@email.com');
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
            password: 'test',
            email: 'test@email.com'
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.user.username.should.be.eql('test_user');
            res.body.user.email.should.be.eql('test@email.com');
            should.not.exist(res.body.error);
            User.findById(res.body.user._id, function(error, user) {
              should.not.exist(error);
              user.username.should.be.eql('test_user');
              user.email.should.be.eql('test@email.com');
              done();
            });

          });
      });

      it('admin can register multiple users with unique api keys', (done) => {
        chai.request(server)
          .post('/api/users')
          .set('Authorization', adminToken)
          .send({
            username: 'test_user',
            password: 'test',
            email: 'test@email.com'
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            User.findById(res.body.user._id, function(error, user1) {
              should.not.exist(error);
              chai.request(server)
                .post('/api/users')
                .set('Authorization', adminToken)
                .send({
                  username: 'other_user',
                  password: 'test2',
                  email: 'other@email.com'
                })
                .end((err, res) => {
                  should.not.exist(err);
                  User.findById(res.body.user._id, function(error, user2) {
                    should.not.exist(error);
                    user1.apikey.should.not.be.eql(user2.apikey);
                    done();
                  });
                });
            });
          });
      });

      it('returns error for invalid email', (done) => {
        chai.request(server)
          .post('/api/users')
          .set('Authorization', adminToken)
          .send({
            username: 'other_user',
            password: 'test',
            email: 'testmail.com'
          })
          .end((err, res) => {
            should.not.exist(err);
            res.body.error.should.be.eql('Invalid email');
            done();
          });
      });

      it('non admin cannot register new user', (done) => {
        chai.request(server)
          .post('/api/users')
          .set('Authorization', standardToken)
          .send({
            username: 'other_user',
            password: 'test',
            email: 'test@email.com'
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
    it('Does not allow a standard user to make changes to another person', (done) => {
      chai.request(server)
        .put('/api/users/' + adminUser._id)
        .set('Authorization', standardToken)
        .send({role: 'ADMIN'})
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('Allows a standard user to change his name and email but nothing else', (done) => {
      chai.request(server)
        .put('/api/users/' + standardUser._id)
        .set('Authorization', standardToken)
        .send({
          role: 'ADMIN',
          first_name: 'Kip',
          last_name: 'Coonley',
          email: 'kip@coon.ley'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.role.should.be.eql('STANDARD');
          res.body.first_name.should.be.eql('Kip');
          res.body.last_name.should.be.eql('Coonley');
          res.body.email.should.be.eql('kip@coon.ley');
          User.findById(standardUser._id, function(error, user) {
            should.not.exist(error);
            user.role.should.be.eql('STANDARD');
            user.first_name.should.be.eql('Kip');
            user.last_name.should.be.eql('Coonley');
            user.email.should.be.eql('kip@coon.ley');
            done();
          })
        });
    });

    it('Allows a manager to change his name, email, and email_settings but nothing else', (done) => {
      chai.request(server)
        .put('/api/users/' + managerUser._id)
        .set('Authorization', managerToken)
        .send({
          role: 'ADMIN',
          first_name: 'Kip',
          last_name: 'Coonley',
          email: 'kip@coon.ley',
          subscribed: true
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.role.should.be.eql('MANAGER');
          res.body.first_name.should.be.eql('Kip');
          res.body.last_name.should.be.eql('Coonley');
          res.body.email.should.be.eql('kip@coon.ley');
          res.body.subscribed.should.be.eql(true);
          User.findById(managerUser._id, function(error, user) {
            should.not.exist(error);
            user.role.should.be.eql('MANAGER');
            user.first_name.should.be.eql('Kip');
            user.last_name.should.be.eql('Coonley');
            user.email.should.be.eql('kip@coon.ley');
            user.subscribed.should.be.eql(true);
            done();
          })
        });
    });

    it('Does not allow a manager to make changes to other users', (done) => {
      chai.request(server)
        .put('/api/users/' + standardUser._id)
        .set('Authorization', managerToken)
        .send({role: 'ADMIN'})
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('Fails if invalid user id is provided for admin for PUT', (done) => {
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
          last_name: 'Glop',
          email: 'newemail@email.com'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.username.should.be.eql('standard');
          res.body.role.should.be.eql('MANAGER');
          res.body.first_name.should.be.eql('Glip');
          res.body.last_name.should.be.eql('Glop');
          res.body.email.should.be.eql('newemail@email.com');
          User.findById(standardUser._id, function(error, user) {
            should.not.exist(error);
            user.username.should.be.eql('standard');
            user.role.should.be.eql('MANAGER');
            user.first_name.should.be.eql('Glip');
            user.last_name.should.be.eql('Glop');
            user.email.should.be.eql('newemail@email.com');
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
