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
    it('returns loans for page 2 with 2 items per page', (done) => {
      chai.request(server)
        .get('/api/loans?page=2&per_page=2')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          res.body[0].request.should.be.eql("222222222222222222222222");
          res.body[1].request.should.be.eql("111111111111111111111111");
          done();
        });
    });
    it('returns no loans for page 2 with 100 items per page', (done) => {
      chai.request(server)
        .get('/api/loans?page=2&per_page=100')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    })
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
        .get('/api/loans')
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
    it('returns loans item_type OUTSTANDING', (done) => {
      chai.request(server)
        .get('/api/loans?item_type=OUTSTANDING')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(3);
          done();
        });
    });
    it('returns loans item_type COMPLETE', (done) => {
      chai.request(server)
        .get('/api/loans?item_type=COMPLETE')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          res.body.should.satisfy(function(loans){
            return loans.every(function(loan){
              return loan.items.every(function(element){
                return ['DISBURSED','RETURNED'].should.include(element.status);
              })
            });
          });
          done();
        });
    });
    it('returns loans with query item_name', (done) => {
      chai.request(server)
        .get('/api/loans?item_name=1k resistor')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          done();
        });
    });
    it('returns loans with query item_name and item_type', (done) => {
      chai.request(server)
        .get('/api/loans?item_name=2k resistor&item_type=OUTSTANDING')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          res.body[0].request.should.be.eql("444444444444444444444444");
          done();
        });
    });
  });

  describe('GET by ID /loans', () =>{
    it('GET request by loan ID successful', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        chai.request(server)
        .get('/api/loans/' + loan._id)
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.request.should.be.eql("444444444444444444444444");
          done();
      })
    });
  });
  });

  describe('PUT by ID /loans', () =>{
    it('PUT request fail when initiated by standard user', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', standardToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("You are not authorized");
          done();
        });
      });
    });
    it('PUT request fail when items in body is not array', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', adminToken)
        .send({
          items:"hello"
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("Items must be an array");
          done();
        });
      });
    });
    it('PUT request fail when items in body is empty array', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', adminToken)
        .send({
          items:[]
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("You must enter at least one item to change");
          done();
        });
      });
    });
    it('PUT request fail when an item in items array does not exist', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', adminToken)
        .send({
          items:[{
            item: "hello",
            status: 'RETURNED'
          }]
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("Item at index 0 does not exist");
          done();
        });
      });
    });
    it('PUT request successful for both disburse and return', (done) => {
      Loan.findOne({"request": "666666666666666666666666"}, function(err, loan){
        should.not.exist(err);
        let item1ID = loan.items[0].item;
        let item2ID = loan.items[1].item;
        let putBody = {
          items:[{
            item: item1ID,
            status: 'RETURNED'
          },{
            item: item2ID,
            status:'DISBURSED'
          }]
        };
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', adminToken)
        .send(putBody)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.items[0].status.should.be.eql("RETURNED");
          res.body.items[1].status.should.be.eql("DISBURSED");
          Item.findById(item1ID, function(err, item1){
            should.not.exist(err);
            item1.quantity.should.be.eql(1010);
            Item.findById(item2ID, function(err, item2){
              should.not.exist(err);
              item2.quantity.should.be.eql(1000);
              Loan.findById(loan._id, function(err, loan){
                should.not.exist(err);
                loan.items[0].status.should.be.eql("RETURNED");
                loan.items[1].status.should.be.eql("DISBURSED");
                done();
              })
            });
          })
        });
      });
    });
  });
});
