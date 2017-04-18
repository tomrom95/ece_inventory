process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Loan = require('../../server/model/loans');
let Item = require('../../server/model/items');
let Instance = require('../../server/model/instances');
let User = require('../../server/model/users');
let helpers = require('../../server/auth/auth_helpers');
let fakeInventoryData = require('./test_inventory_data');
let fakeLoanData = require('./test_loans_data');
let fakeInstanceData = require('./test_instances_data');
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
    Instance.remove({}, (err) => {
      should.not.exist(err);
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
          res.body.length.should.be.eql(4);
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
          res.body.length.should.be.eql(1);
          res.body.should.satisfy(function(loans){
            return loans.every(function(loan){
              return loan.items.every(function(element){
                return ['DISBURSED','RETURNED','BACKFILL_REQUESTED'].should.include(element.status);
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
    it('returns loans with query item_id', (done) => {
      Item.findOne({"name":"1k resistor"}, function(err, item){
        chai.request(server)
          .get('/api/loans?item_id='+item._id)
          .set('Authorization', adminToken)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(2);
            res.body.should.satisfy(function(loans){
              return loans.every(function(loan){
                  return ['666666666666666666666666','444444444444444444444444'].should.include(loan.request);
              });
            });
            done();
          });
      })
    });

    it('returns loans with query item_name and item_type', (done) => {
      chai.request(server)
        .get('/api/loans?item_name=2k resistor&item_type=OUTSTANDING')
        .set('Authorization', adminToken)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
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
    it('PUT request fail for DISBURSED when initiated by standard user', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        let item2ID = loan.items[1].item;
        let putBody = {
          items:[{
            item: item2ID,
            status:'DISBURSED'
          }]
        };
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', standardToken)
        .send(putBody)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("You are not authorized");
          done();
        });
      });
    });
    it('PUT request fail for RETURNED when initiated by standard user', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        let item1ID = loan.items[0].item;
        let putBody = {
          items:[{
            item: item1ID,
            status:'RETURNED'
          }]
        };
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', standardToken)
        .send(putBody)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("You are not authorized");
          Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
            should.not.exist(err);
            loan.items[0].status.should.not.be.eql("RETURNED");
            done();
          });
        });
      });
    });
    it('PUT request fail for LENT when initiated by standard user', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        let item2ID = loan.items[1].item;
        let putBody = {
          items:[{
            item: item2ID,
            status:'LENT'
          }]
        };
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', standardToken)
        .send(putBody)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("You are not authorized");
          Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
            should.not.exist(err);
            loan.items[1].status.should.not.be.eql("LENT");
            done();
          });
        });
      });
    });
    it('PUT request fail for BACKFILL_REQUESTED when initiated by standard user for non-LENT loans', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        // item2 has status RETURNED
        let item2ID = loan.items[1].item;
        let putBody = {
          items:[{
            item: item2ID,
            status:'BACKFILL_REQUESTED'
          }]
        };
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', standardToken)
        .send(putBody)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("You are not authorized");
          Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
            should.not.exist(err);
            loan.items[1].status.should.not.be.eql("BACKFILL_REQUESTED");
            done();
          });
        });
      });
    });
    it('PUT request successful for BACKFILL_REQUESTED when initiated by standard user for LENT loans', (done) => {
      Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
        should.not.exist(err);
        // item2 has status RETURNED
        let item1ID = loan.items[0].item;
        let putBody = {
          items:[{
            item: item1ID,
            status:'BACKFILL_REQUESTED'
          }]
        };
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', standardToken)
        .send(putBody)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          Loan.findOne({"request": "444444444444444444444444"}, function(err, loan){
            should.not.exist(err);
            loan.items[0].status.should.be.eql("BACKFILL_REQUESTED");
            done();
          });
        });
      });
    });
    it('PUT successful, backfill_rejected marked as true if status is BACKFILL_REQUESTED and changed to LENT', (done) => {
      Loan.findOne({"request": "222222222222222222222222"}, function(err, loan){
        should.not.exist(err);
        // item2 has status RETURNED
        let item1ID = loan.items[0].item;
        let putBody = {
          items:[{
            item: item1ID,
            status:'LENT'
          }]
        };
        chai.request(server)
        .put('/api/loans/' + loan._id)
        .set('Authorization', adminToken)
        .send(putBody)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          Loan.findOne({"request": "222222222222222222222222"}, function(err, loan){
            should.not.exist(err);
            loan.items[0].status.should.be.eql("LENT");
            loan.items[0].backfill_rejected.should.be.eql(true);
            done();
          });
        });
      });
    });
    it('PUT successful, backfill_rejected marked as false if status is BACKFILL_REQUESTED and changed to DISBURSED', (done) => {
      Loan.findOne({"request": "222222222222222222222222"}, function(err, loan){
        should.not.exist(err);
        // item2 has status RETURNED
        let item1ID = loan.items[0].item;
        let putBody = {
          items:[{
            item: item1ID,
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
          Loan.findOne({"request": "222222222222222222222222"}, function(err, loan){
            should.not.exist(err);
            loan.items[0].status.should.be.eql("DISBURSED");
            loan.items[0].backfill_rejected.should.be.eql(false);
            done();
          });
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
      it('PUT request successful for backfill_rejected and comment', (done) => {
        Loan.findOne({"request": "666666666666666666666666"}, function(err, loan){
          should.not.exist(err);
          let item1ID = loan.items[0].item;
          let item2ID = loan.items[1].item;
          let putBody = {
            items:[{
              item: item1ID,
              backfill_rejected: true,
            }],
            backfill_comment: "It is rejected"
          };
          chai.request(server)
          .put('/api/loans/' + loan._id)
          .set('Authorization', adminToken)
          .send(putBody)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            Item.findById(item1ID, function(err, item1){
              should.not.exist(err);
              item1.backfill_rejected.should.be.eql(true);
              Loan.findById(loan._id, function(err, loan){
                should.not.exist(err);
                loan.backfill_comment.should.be.eql("It is rejected");
                done();
              });
            });
          });
        });
    });
});
    describe('with instances', () => {
      var allItems;
      var allInstances;
      var mockInstanceLoan;
      var requestId = '111111111111111111111111';

      beforeEach((done) => {
        Item.insertMany(fakeInstanceData.items, function(error, items) {
          should.not.exist(error);
          allItems = {};
          items.forEach(function(item) {
            allItems[item.name] = item;
          });
          Instance.insertMany(fakeInstanceData.instances, function(error, instances) {
            should.not.exist(error);
            allInstances = {};
            instances.forEach(function(instance) {
              allInstances[instance.tag] = instance;
            });
            mockInstanceLoan = new Loan({
              user: standardUser,
              request: requestId,
              items: [
                {
                  item: allItems['Laptop']._id,
                  quantity: 2,
                  status: 'LENT',
                  instances: [allInstances['3']._id, allInstances['10']._id]
                },
                {
                  item: allItems['Steve']._id,
                  quantity: 1,
                  status: 'LENT',
                  instances: [allInstances['5']._id]
                },
                {
                  item: allItems['Not an asset']._id,
                  quantity: 50,
                  status: 'LENT'
                }
              ]
            });
            mockInstanceLoan.save(function(error, newLoan) {
              should.not.exist(error);
              mockInstanceLoan = newLoan;
              done();
            });
          });
        });
      });

      it('PUT request successful for both disburse and return', (done) => {
          let putBody = {
            items:[
              {
                item: allItems['Laptop']._id,
                status: 'RETURNED'
              },
              {
                item: allItems['Steve']._id,
                status: 'DISBURSED'
              },
              {
                item: allItems['Not an asset']._id,
                status: 'RETURNED'
              }
            ]
          };
          chai.request(server)
            .put('/api/loans/' + mockInstanceLoan._id)
            .set('Authorization', adminToken)
            .send(putBody)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              Item.findById(allItems['Laptop']._id, function(err, item1){
                should.not.exist(err);
                item1.quantity.should.be.eql(4);
                Item.findById(allItems['Steve']._id, function(err, item2){
                  should.not.exist(err);
                  item2.quantity.should.be.eql(1);
                  Instance.find({tag: {$in: ['3', '10']}}, function(error, instances) {
                    should.not.exist(error);
                    instances.should.all.have.property('in_stock', true);
                    Instance.findOne({tag: '5'}, function(error, instance) {
                      should.not.exist(error);
                      should.not.exist(instance);
                      Loan.findById(mockInstanceLoan._id, function(err, loan){
                        should.not.exist(err);
                        loan.items.forEach(function(itemObj) {
                          if (String(itemObj.item) === String(allItems['Laptop']._id)) {
                            itemObj.status.should.be.eql('RETURNED');
                          } else if (String(itemObj.item) === String(allItems['Laptop']._id)) {
                            itemObj.status.should.be.eql('DISBURSED');
                          }
                        });
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
});
