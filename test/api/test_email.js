process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let EmailSettings = require('../../server/model/emailSettings');
let User = require('../../server/model/users');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Email settings API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  var currentSettings;

  beforeEach((done) => { //Before each test we empty the database
    EmailSettings.remove({}, (err) => {
      should.not.exist(err);
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
              EmailSettings.getSingleton(function(error, settings) {
                should.not.exist(error);
                settings.subject_tag = 'subject';
                settings.loan_emails = [
                  {date: new Date('2017-02-24'), body: 'first body'},
                  {date: new Date('2017-02-25'), body: 'second body'}
                ]
                settings.save(function(error, settings) {
                  should.not.exist(error);
                  currentSettings = settings;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });


  describe('GET /api/emailSettings', () =>{
    it('gets the settings for admin', (done) => {
      chai.request(server)
        .get('/api/emailSettings')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.subject_tag.should.be.eql('subject');
          res.body.loan_emails.length.should.be.eql(2);
          done();
        });
    });

    it('gets the settings for manager', (done) => {
      chai.request(server)
        .get('/api/emailSettings')
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.subject_tag.should.be.eql('subject');
          res.body.loan_emails.length.should.be.eql(2);
          done();
        });
    });

    it('does not let a standard user get the settings', (done) => {
      chai.request(server)
        .get('/api/emailSettings')
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('gets settings even if they are empty', (done) => {
      EmailSettings.remove({}, function(error) {
        should.not.exist(error);
        chai.request(server)
          .get('/api/emailSettings')
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.subject_tag.should.be.eql('');
            res.body.loan_emails.length.should.be.eql(0);
            done();
          });
      });
    });

  });

  describe('PUT /api/emailSettings', () =>{
    it('changes only the subject tag', (done) => {
      chai.request(server)
        .put('/api/emailSettings')
        .set('Authorization', adminToken)
        .send({
          subject_tag: 'new tag',
          loan_emails: [{date: new Date('2017-02-28'), body: 'new body'}]
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.subject_tag.should.be.eql('new tag');
          res.body.loan_emails.length.should.be.eql(2);
          EmailSettings.getSingleton(function(error, settings) {
            should.not.exist(error);
            settings.subject_tag.should.be.eql('new tag');
            settings.loan_emails.length.should.be.eql(2);
            done();
          });
        });
    });

    it('allows managers to change it', (done) => {
      chai.request(server)
        .put('/api/emailSettings')
        .set('Authorization', managerToken)
        .send({
          subject_tag: 'new tag',
          loan_emails: [{date: new Date('2017-02-28'), body: 'new body'}]
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.subject_tag.should.be.eql('new tag');
          res.body.loan_emails.length.should.be.eql(2);
          EmailSettings.getSingleton(function(error, settings) {
            should.not.exist(error);
            settings.subject_tag.should.be.eql('new tag');
            settings.loan_emails.length.should.be.eql(2);
            done();
          });
        });
    });

    it('does not allow standards to change it', (done) => {
      chai.request(server)
        .put('/api/emailSettings')
        .set('Authorization', standardToken)
        .send({
          subject_tag: 'new tag',
          loan_emails: [{date: new Date('2017-02-28'), body: 'new body'}]
        })
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });
  });

  describe('POST /api/emailSettings/loans', () =>{
    it('adds a new email', (done) => {
      chai.request(server)
        .post('/api/emailSettings/loans')
        .set('Authorization', adminToken)
        .send({date: new Date('2017-02-28'), body: 'new body'})
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.length.should.be.eql(3);
          EmailSettings.getSingleton(function(error, settings) {
            should.not.exist(error);
            settings.loan_emails.length.should.be.eql(3);
            done();
          });
        });
    });

    it('does not add a new email if there is already one on that date', (done) => {
      chai.request(server)
        .post('/api/emailSettings/loans')
        .set('Authorization', adminToken)
        .send({date: new Date('2017-02-25'), body: 'new body'})
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql('A loan email is already being sent that day');
          done();
        });
    });

    it('allows managers to add', (done) => {
      chai.request(server)
        .post('/api/emailSettings/loans')
        .set('Authorization', managerToken)
        .send({date: new Date('2017-02-28'), body: 'new body'})
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.length.should.be.eql(3);
          EmailSettings.getSingleton(function(error, settings) {
            should.not.exist(error);
            settings.loan_emails.length.should.be.eql(3);
            done();
          });
        });
    });

    it('does not allow standards to add', (done) => {
      chai.request(server)
        .post('/api/emailSettings/loans')
        .set('Authorization', standardToken)
        .send({date: new Date('2017-02-28'), body: 'new body'})
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('DELETE /api/emailSettings/loans/:email_id', () =>{
    it('deletes an existing email', (done) => {
      var email = currentSettings.loan_emails.find((e) => e.body === 'first body');
      chai.request(server)
        .delete('/api/emailSettings/loans/' + email._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.message.should.be.eql('Successful');
          EmailSettings.getSingleton(function(error, settings) {
            should.not.exist(error);
            settings.loan_emails.length.should.be.eql(1);
            settings.loan_emails[0].body.should.be.eql('second body');
            done();
          });
        });
    });

    it('allows managers to delete email', (done) => {
      var email = currentSettings.loan_emails.find((e) => e.body === 'first body');
      chai.request(server)
        .delete('/api/emailSettings/loans/' + email._id)
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.message.should.be.eql('Successful');
          EmailSettings.getSingleton(function(error, settings) {
            should.not.exist(error);
            settings.loan_emails.length.should.be.eql(1);
            settings.loan_emails[0].body.should.be.eql('second body');
            done();
          });
        });
    });

    it('does not let a standard user delete', (done) => {
      var email = currentSettings.loan_emails.find((e) => e.body === 'first body');
      chai.request(server)
        .delete('/api/emailSettings/loans/' + email._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });

    it('returns error if email id is non existent', (done) => {
      chai.request(server)
        .delete('/api/emailSettings/loans/' + '1111')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql('email id does not exist');
          done();
        });
    });
  });

});
