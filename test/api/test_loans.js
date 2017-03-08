process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Loan = require('../../server/model/loans');
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let helpers = require('../../server/auth/auth_helpers');
let fakeInventoryData = require('./test_inventory_data');
let fakeLoanData = require('./test_loans_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));
var server = require('../../server');

describe('Logging API Test', function () {
  var adminToken;
  var adminUser;
  var standardToken;
  var standardUser;
  var managerToken;
  var managerUser;
  var allItems;

  beforeEach((done) => { //Before each test we empty the database
    Loan.remove({}, (err) => {
      should.not.exist(err);
      Item.remove({}, (err) => {
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
                Item.insertMany(fakeInventoryData).then(function(array) {
                  allItems = {};
                  array.forEach(function(item) {
                    allItems[item.name] = item;
                  });
                  var loanDataCopy = JSON.parse(JSON.stringify(fakeLoanData));
                  loanDataCopy.forEach(function(loan) {
                    if (loan.user === 'STANDARD') {
                      loan.user = standardUser._id;
                    } else {
                      loan.user = managerUser._id;
                    }
                    loan.items.forEach(function(itemObj) {
                      itemObj.item = allItems[itemObj.item]._id;
                    });
                  });
                  Loan.insertMany(loanDataCopy).then(function(array) {
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe('GET /loans', () => {
    it('returns all loans for admin with no filters', (done) => {
      chai.request(server)
        .get('/api/loans')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          // make sure fields are populating
          res.body.forEach(function(loan){
            loan.items[0].item.should.have.property("name");
            loan.user.should.have.property("username");
            (["standard", "manager"]).should.include(loan.user.username);
          });
          done();
        });
    });

    it('returns all loans for a manager with no filters', (done) => {
      chai.request(server)
        .get('/api/loans')
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });

    it('returns all loans for admin for a given user', (done) => {
      chai.request(server)
        .get('/api/loans?user_id=' + standardUser._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          // make sure fields are populating
          res.body.forEach(function(loan){
            loan.user._id.should.be.eql(String(standardUser._id));
          });
          done();
        });
    });

    it('returns only users loans to standard user', (done) => {
      chai.request(server)
        .get('/api/loans?')
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          res.body.forEach(function(loan){
            loan.user._id.should.be.eql(String(standardUser._id));
          });
          done();
        });
    });

  });


  describe('GET /loans/:loan_id', () => {
    var loan1;
    var loan2;

    beforeEach((done) => {
      var loan = new Loan({
        "user": standardUser._id,
        "items": [
          {
            "item": allItems["1k resistor"]._id,
            "quantity": 10,
            "status": "LENT"
          }
        ],
        "request": "444444444444444444444444"
      });
      loan.save(function(error, loan) {
        should.not.exist(error);
        loan1 = loan;
        loan = new Loan({
          "user": adminUser._id,
          "items": [
            {
              "item": allItems["5k resistor"]._id,
              "quantity": 10,
              "status": "LENT"
            }
          ],
          "request": "444444444444444444444444"
        });
        loan.save(function(error, loan) {
          should.not.exist(error);
          loan2 = loan;
          done();
        });
      });
    });

    it('returns a loan for an admin', (done) => {
      chai.request(server)
        .get('/api/loans/' + loan1._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.user._id.should.be.eql(String(standardUser._id));
          res.body.user.username.should.be.eql(standardUser.username);
          res.body.items.length.should.be.eql(1);
          res.body.items[0].item.name.should.be.eql('1k resistor');
          res.body.items[0].status.should.be.eql('LENT');
          res.body.items[0].quantity.should.be.eql(10);
          res.body.request.should.be.eql("444444444444444444444444");
          done();
        });
    });

    it('returns a loan for an manager', (done) => {
      chai.request(server)
        .get('/api/loans/' + loan1._id)
        .set('Authorization', managerToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.user._id.should.be.eql(String(standardUser._id));
          res.body.user.username.should.be.eql(standardUser.username);
          res.body.items.length.should.be.eql(1);
          res.body.items[0].item.name.should.be.eql('1k resistor');
          res.body.items[0].status.should.be.eql('LENT');
          res.body.items[0].quantity.should.be.eql(10);
          res.body.request.should.be.eql("444444444444444444444444");
          done();
        });
    });

    it('returns a standard users loan to himself', (done) => {
      chai.request(server)
        .get('/api/loans/' + loan1._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.user._id.should.be.eql(String(standardUser._id));
          res.body.user.username.should.be.eql(standardUser.username);
          res.body.items.length.should.be.eql(1);
          res.body.items[0].item.name.should.be.eql('1k resistor');
          res.body.items[0].status.should.be.eql('LENT');
          res.body.items[0].quantity.should.be.eql(10);
          res.body.request.should.be.eql("444444444444444444444444");
          done();
        });
    });

    it('does not return another persons loan to a standard user', (done) => {
      chai.request(server)
        .get('/api/loans/' + loan2._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(403);
          done();
        });
    });
  });

});
