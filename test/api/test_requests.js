process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Request = require('../../server/model/requests');
let Instance = require('../../server/model/instances');
let Loan = require('../../server/model/loans');
let helpers = require('../../server/auth/auth_helpers');
let fakeItemData = require('./test_inventory_data');
let fakeRequestData = require('./test_requests_data');
let fakeInstanceData = require('./test_instances_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

let nodemailerMock = require('nodemailer-mock');
let mockery = require('mockery');

var server = require('../../server');

const pendingMockRequest = {
  "reviewer_comment": "NONADMIN",
  "requestor_comment": "NONADMIN",
  "reason": "NONADMIN",
  "status": "PENDING",
  "action": "DISBURSEMENT",
  "created": "2019-01-29"
};

const approvedMockRequest = {
  "reviewer_comment": "NONADMIN",
  "requestor_comment": "NONADMIN",
  "reason": "NONADMIN",
  "status": "APPROVED",
  "action": "DISBURSEMENT",
  "created": "2019-01-29"
};

describe('Requests API Test', function () {
  var token;
  var item1_id;
  var item2_id;
  var user_id;
  var itemsArray;
  beforeEach((done) => { //Before each test we empty the database
    Instance.remove({}, (err) => {
      Loan.remove({}, (err) => {
        should.not.exist(err);
        Item.remove({}, (err) => {
          should.not.exist(err);
          Request.remove({}, (err)=>{
            should.not.exist(err);
            User.remove({}, (err) => {
              should.not.exist(err);
              helpers.createNewUser('test_user', 'test', 'admin@email.com', 'ADMIN', function(err, user) {
                should.not.exist(err);
                token = helpers.createAuthToken(user);
                user_id = user._id;
                Item.insertMany(fakeItemData).then(function(obj){
                  // Get the id from one item
                  Item.findOne({'name':'1k resistor'}, function(err,item1){
                    should.not.exist(err);
                    item1_id = item1._id;
                    Item.findOne({'name':'2k resistor'}, function(err,item2){
                      should.not.exist(err);
                      item2_id = item2._id;
                      // Add the user id manually, and the item associated
                      fakeRequestData.forEach(function(obj){
                        itemsArray = [
                          {
                            item: item1_id,
                            quantity: 1000
                          },
                          {
                            item: item2_id,
                            quantity: 2000
                          }
                        ];
                        obj.items = itemsArray;
                        obj.user = user._id;
                      });
                      Request.insertMany(fakeRequestData, function(error, obj){
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
  });

  before((done) =>{
    mockery.enable({
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('nodemailer', nodemailerMock);

    server = require('../../server');
    done();
  });

  afterEach((done) => {
    nodemailerMock.mock.reset();
    done();
  });

  after(function() {
    mockery.deregisterAll();
    mockery.disable();
  });

  describe('GET /requests', () =>{
    it('GETs all requests', (done) => {
      chai.request(server)
      .get('/api/requests')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(5);
        res.body.should.all.have.property("user");
        res.body.should.all.have.property("items");
        res.body.forEach(function(request){
          request.items.forEach(function(element){
            element.item.should.have.property("name");
            [1000, 2000].should.include(element.quantity);
            ["1k resistor", "2k resistor"].should.include(element.item.name);
          });
        });
        done();
      });
    });
    it('Non-admin user gets only their requests', (done) => {
      helpers.createNewUser('standard', 'test', 'test@test.com', 'STANDARD', function(err, user) {
        should.not.exist(err);
        standard_token = helpers.createAuthToken(user);
        var request = new Request(pendingMockRequest);
        request.items = itemsArray;
        request.user = user._id;
        request.save(function(err){
          should.not.exist(err);
          chai.request(server)
          .get('/api/requests')
          .set('Authorization', standard_token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(1);
            res.body.should.all.have.property("reviewer_comment", "NONADMIN");
            res.body.should.all.have.property("requestor_comment","NONADMIN");
            res.body.should.all.have.property("reason", "NONADMIN");
            res.body.should.all.have.property("_id",request.id);
            res.body.should.all.have.property("items");
            res.body.forEach(function(request){
              request.items.forEach(function(element){
                element.item.should.have.property("name");
                [1000, 2000].should.include(element.quantity);
                ["1k resistor", "2k resistor"].should.include(element.item.name);
              });
            });
            done();
          });
        });
      });
    });
    it('GETs requests by item id', (done) => {
        var request = new Request(pendingMockRequest);
        request.items = [
          {
            item: item2_id,
            quantity: 1000
          }
        ]
        request.user = user_id;
        request.save(function(err){
          should.not.exist(err);
          chai.request(server)
          .get('/api/requests?item_id='+item2_id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(6);
            res.body.should.all.have.property("user");
            res.body.should.all.have.property("items");
            res.body.forEach(function(request){
              request.items.forEach(function(element){
                element.item.should.have.property("name");
                [1000, 2000].should.include(element.quantity);
                ["1k resistor","2k resistor"].should.include(element.item.name);
              });
            });
            done();
          });
        });
    });
    it('GETs requests by item id, for new item', (done) => {
      var item2_id;
      Item.findOne({"name": "5k resistor"}, function(err, item3){
        should.not.exist(err);
        var request = new Request(pendingMockRequest);
        request.items = [
          {
            item: item3._id,
            quantity: 1000
          }
        ];
        request.user = user_id;
        request.save(function(err){
          should.not.exist(err);
          chai.request(server)
          .get('/api/requests?item_id='+item3._id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(1);
            res.body.should.all.have.property("user");
            res.body.should.all.have.property("items");
            res.body.forEach(function(request){
              request.items.forEach(function(element){
                element.item.should.have.property("name");
                [1000].should.include(element.quantity);
                ["5k resistor"].should.include(element.item.name);
              });
            });
            done();
          });
        });
      });
    });

    it('GETs NO requests by incorrect item id', (done) => {
      chai.request(server)
      .get('/api/requests?item_id=988902309bfbc2d1b0d3419d')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });

    it('GETs requests by reviewer_comment (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?reviewer_comment=bYe')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(3);
        res.body.should.all.have.property("reviewer_comment", "Bye");
        res.body.should.all.have.property("requestor_comment", "Hello");
        done();
      });
    });
    it('GETs No requests by non-existent reviewer_comment (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?reviewer_comment=dliukahdilufsdblkjf')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
    it('GETs requests by requestor_comment (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?requestor_comment=UrgEnT')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        res.body.should.all.have.property("requestor_comment", "Urgent");
        res.body.should.all.have.property("reviewer_comment", "Fine");
        res.body.should.all.have.property("status", "PENDING");
        done();
      });
    });
    it('GETs NO requests by non-existent requestor_comment (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?requestor_comment=wi3u4rhfkwes')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
    it('GETs requests by reason (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?reason=gReEd')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(2);
        res.body.should.all.have.property("reason", "greed");
        res.body.should.all.have.property("requestor_comment", "Hello");
        res.body.should.all.have.property("reviewer_comment", "Bye");
        done();
      });
    });
    it('GETs NO requests by non-existent reason (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?reason=wi3u4rhfkwes')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
      it('GETs requests by invalid status (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?status=LOL')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
    // it('GETs requests by date (case-insensitive)', (done) => {
    //   chai.request(server)
    //   .get('/api/requests?created=2029-01-29')
    //   .set('Authorization', token)
    //   .end((err, res) => {
    //    should.not.exist(err);
    //     res.should.have.status(200);
    //     res.body.should.be.a('array');
    //     res.body.length.should.be.eql(2);
    //     res.body.should.all.have.property("reviewer_comment", "Fine");
    //     res.body.should.all.have.property("created", "2029-01-29T00:00:00.000Z");
    //     res.body.should.all.have.property("quantity", 2000);
    //     done();
    //   });
    // });
    it('GETs NO requests by non-existent date (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?created=9999-01-29')
      .set('Authorization', token)
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
    it('GETs 2nd page with 2 items per page', (done)=>{
        chai.request(server)
        .get('/api/requests?page=2&per_page=2')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(2);
          res.body.should.satisfy(function(requests){
            return requests.every(function(request){
              return request.items.every(function(element){
                return element.item.should.have.property("name") && request.user.should.have.property("username");
              })
            })
          });
          done();
        });
    });
    it('GETs 3rd page with 100 items per page - should return empty []', (done)=>{
        chai.request(server)
        .get('/api/requests?page=3&per_page=100')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
    it('GETs 100th page with 3 items per page - should return empty []', (done)=>{
        chai.request(server)
        .get('/api/requests?page=100&per_page=3')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
    it('GETs 100th page with 100 items per page - should return empty []', (done)=>{
        chai.request(server)
        .get('/api/requests?page=100&per_page=100')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
    it('GETs whole array for invalid per_page param', (done)=>{
        chai.request(server)
        .get('/api/requests?page=3&per_pge=3')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          res.body.should.satisfy(function(requests){
            return requests.every(function(request){
              return request.items.every(function(element){
                return element.item.should.have.property("name") && request.user.should.have.property("username");
              })
            })
          });
          done();
        });
    });
    it('GETs whole array for invalid page param', (done)=>{
        chai.request(server)
        .get('/api/requests?pag=3&per_page=3')
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(5);
          res.body.should.satisfy(function(requests){
            return requests.every(function(request){
              return request.items.every(function(element){
                return element.item.should.have.property("name") && request.user.should.have.property("username");
              })
            })
          });
          done();
        });
    });
  });

  describe('GET by ID /requests', () =>{
    it('GET request by request ID successful', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        should.not.exist(err);
        var request = new Request(pendingMockRequest);
        request.items = [
          {
            item: item2._id,
            quantity:1000
          }
        ]
        request.user = user_id;
        request.save(function(err){
          should.not.exist(err);
          chai.request(server)
          .get('/api/requests/' + request._id)
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("reviewer_comment", "NONADMIN");
            res.body.should.have.property("created", "2019-01-29T00:00:00.000Z");
            res.body._id.should.be.eql(request._id.toString());
            res.body.items[0].item._id.should.be.eql(item2._id.toString());
            done();
          });
        });
      });
    });
    it('GET no Request by invalid request ID successful', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        should.not.exist(err);
        var request = new Request(pendingMockRequest);
        request.item = item2._id;
        request.user = user_id;
        request.save(function(err){
          should.not.exist(err);
          chai.request(server)
          .get('/api/requests/' + '988f8c2448c10662691386ab')
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("error", "Request does not exist");
            done();
          });
        });
      });
    });
  });
  describe('POST /requests', () =>{
    it('Should not POST without items field specified', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        should.not.exist(err);
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "quantity": 2000,
          "status": "PENDING",
          "action": "DISBURSEMENT",
          "created": "2019-01-29"
        });
        chai.request(server)
        .post('/api/requests/')
        .set('Authorization', token)
        .send(request)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property("error", "Items not specified in request");
          done();
        });
      });
    });
    // it('Should POST without Date, defaulting to Today', (done) => {
    //   Item.findOne({"name": "2k resistor"}, function(err, item2){
    //      should.not.exist(err);
    //     var request = new Request({
    //       "reviewer_comment": "NONADMIN",
    //       "requestor_comment": "NONADMIN",
    //       "reason": "NONADMIN",
    //       "quantity": 2000,
    //       "status": "PENDING",
    //     });
    //     request.item = item2._id;
    //     request.save(function(err){
    //  should.not.exist(err);
    //       chai.request(server)
    //       .post('/api/requests/')
    //       .set('Authorization', token)
    //       .send(request)
    //       .end((err, res) => {
    //        should.not.exist(err);
    //         // This test case may fail if ran straddling a minute because of how the times are compared.
    //         // Run again.
    //         res.should.have.status(200);
    //         res.body.should.be.a('object');
    //         var bodyDate = new Date(res.body.created);
    //         bodyDate.setSeconds(0,0);
    //         bodyDate = bodyDate.toISOString();
    //         var compareDate = new Date();
    //         compareDate.setSeconds(0,0);
    //         compareDate = compareDate.toISOString();
    //         bodyDate.should.be.eql(compareDate);
    //         done();
    //       });
    //     })
    //
    //   });
    // });

    it('Should not POST with wrong status enum', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        should.not.exist(err);
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "status": "DSFJHK",
          "action": "DISBURSEMENT",
          "created": "2019-01-29"
        });
        request.items = [
          {
            item: item2._id,
            quantity:1000
          }
        ]
        chai.request(server)
        .post('/api/requests/')
        .set('Authorization', token)
        .send(request)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property("error");
          res.body.error.should.have.property("errors");
          res.body.error.errors.status.should.have.property("message","`DSFJHK` is not a valid enum value for path `status`.");
          res.body.error.errors.status.should.have.property("name", "ValidatorError");
          res.body.error.errors.status.should.have.property("kind", "enum");
          done();
        });
      });
    });
    it('Should POST with minimal fields', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        should.not.exist(err);
        var request = new Request({
          "status": "PENDING",
          "action": "DISBURSEMENT"
        });
        request.items = [
          {
            item: item2._id,
            quantity:1000
          }
        ]
        chai.request(server)
        .post('/api/requests/')
        .set('Authorization', token)
        .send(request)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property("status", "PENDING");
          res.body.items[0].item._id.should.be.eql(item2._id.toString());
          done();
        });
      });
    });
    it('Should POST as standard user', (done) => {
        helpers.createNewUser('standardUser', 'standard', 'test@test.com', 'STANDARD' , function(err, user) {
        should.not.exist(err);
        var standard_token = helpers.createAuthToken(user);
        Item.findOne({"name": "2k resistor"}, function(err, item2){
          should.not.exist(err);
          var request = {
            "action": "DISBURSEMENT",
            "status": "PENDING",
          };
          request.items = [
            {
              item: item2._id,
              quantity:1000
            }
          ]
          chai.request(server)
          .post('/api/requests/')
          .set('Authorization', standard_token)
          .send(request)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("status", "PENDING");
            res.body.should.have.property("user", user._id.toString());
            res.body.items[0].item._id.should.be.eql(item2._id.toString());
            res.body.items[0].item.name.should.be.eql("2k resistor");
            done();
          });
        });
      });
    });
    it('Should POST as standard user with own user id', (done) => {
        helpers.createNewUser('standardUser', 'standard', 'test@test.com', 'STANDARD' , function(err, user) {
        should.not.exist(err);
        var standard_token = helpers.createAuthToken(user);
        Item.findOne({"name": "2k resistor"}, function(err, item2){
          should.not.exist(err);
          var request = {
            "status": "PENDING",
            "action": "DISBURSEMENT",
            "user": user._id
          };
          request.items = [
            {
              item: item2._id,
              quantity:1000
            }
          ]
          chai.request(server)
          .post('/api/requests/')
          .set('Authorization', standard_token)
          .send(request)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("status", "PENDING");
            res.body.should.have.property("user", user._id.toString());
            res.body.items[0].item._id.should.be.eql(item2._id.toString());
            res.body.items[0].item.name.should.be.eql("2k resistor");
            done();
          });
        });
      });
    });
    it('Should POST as admin with specified user id', (done) => {
        helpers.createNewUser('standardUser', 'standard', 'test@test.com', 'STANDARD' , function(err, user) {
        should.not.exist(err);
        Item.findOne({"name": "2k resistor"}, function(err, item2){
          should.not.exist(err);
          var request = {
            "status": "PENDING",
            "action": "DISBURSEMENT",
            "user": user._id
          };
          request.items = [
            {
              item: item2._id,
              quantity:1000
            }
          ]
          chai.request(server)
          .post('/api/requests/')
          .set('Authorization', token)
          .send(request)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("status", "PENDING");
            res.body.should.have.property("user", user._id.toString());
            res.body.items[0].item._id.should.be.eql(item2._id.toString());
            res.body.items[0].item.name.should.be.eql("2k resistor");
            done();
          });
        });
      });
    });
    it('Should not POST with non-existing user id', (done) => {
        helpers.createNewUser('standardUser', 'standard', 'test@test.com', 'STANDARD' , function(err, user) {
        should.not.exist(err);
        Item.findOne({"name": "2k resistor"}, function(err, item2){
          should.not.exist(err);
          var request = {
            "status": "PENDING",
            "action": "DISBURSEMENT",
            "user": "53cb6b9b4f4ddef1ad47f943"
          };
          request.item = item2._id;
          chai.request(server)
          .post('/api/requests/')
          .set('Authorization', token)
          .send(request)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("error", "There is no such user");
            done();
          });
        });
      });
    });
    it('Should not POST as standard user with specified different user id in body', (done) => {
      helpers.createNewUser('standard_user', 'test', 'test@test.com', 'STANDARD' , function(err, user) {
        should.not.exist(err);
        var standard_token = helpers.createAuthToken(user);
        Item.findOne({"name": "2k resistor"}, function(err, item2){
          should.not.exist(err);
          var request = {
            "status": "PENDING",
            "action": "DISBURSEMENT",
            "user": user_id
          };
          request.item = item2._id;
          chai.request(server)
          .post('/api/requests/')
          .set('Authorization', standard_token)
          .send(request)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.error.should.be.eql("You are not authorized to modify another user's request");
            done();
          });
        });
    });
  });
  });
  describe('PUT /requests/:request_id', ()=> {
    it('PUTS request by request id', (done) => {
      var request = new Request(pendingMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ]
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .put('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'reason': 'NONE',
          'status': 'APPROVED',
          'items': [
            {
              item: item2_id,
              quantity:2000
            }
          ]
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.reason.should.be.eql('NONE');
          res.body.status.should.be.eql('APPROVED');
          res.body.user.should.be.eql(user_id.toString());
          res.body._id.should.be.eql(request._id.toString());
          res.body.items[0].quantity.should.be.eql(2000);
          done();
        });
      });
    });
    it('PUTS request - admin user can specify user id', (done) => {
      helpers.createNewUser('standard_user', 'test', 'test@test.com', 'STANDARD' , function(err, user) {
        should.not.exist(err);
        var request = new Request(pendingMockRequest);
        request.items = [
          {
            item: item2_id,
            quantity:1000
          }
        ]
        request.user = user_id;
        request.save((err, request) => {
          should.not.exist(err);
          chai.request(server)
          .put('/api/requests/'+request._id)
          .set('Authorization', token)
          .send({
            'reason': 'NONE',
            'status': 'APPROVED',
            'user': user._id
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.reason.should.be.eql('NONE');
            res.body.status.should.be.eql('APPROVED');
            res.body.user.should.be.eql(String(user._id));
            res.body._id.should.be.eql(request._id.toString());
            done();
          });
        });
      });
    });
    it('Should not PUT request - admin user specifies invalid user id', (done) => {
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "PENDING",
        "action": "DISBURSEMENT",
        "created": "2019-01-29"
      });
      request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ]
      request.user = "1996510c820ada1a8d7b5875";
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .put('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'reason': 'NONE',
          'status': 'APPROVED',
          'user': '111111111111111111111111'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql("There is no such user");
          done();
        });
      });
    });

    it('Should not PUT request - user tries to fulfill a request through PUT', (done) => {
      var request = new Request({
        "reason": "NONADMIN",
        "action": "DISBURSEMENT",
      });
      request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ]
      request.user = "1996510c820ada1a8d7b5875";
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .put('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          status: 'FULFILLED',
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql("You cannot fulfill a request through this endpoint. Use PATCH");
          done();
        });
      });
    });

    it('Should not PUT request for standard user specifying another username in PUT body', (done) => {
        helpers.createNewUser('standard_user', 'test', 'test@test.com', 'STANDARD' , function(err, user) {
          should.not.exist(err);
        var standard_token = helpers.createAuthToken(user);
        var request = new Request(pendingMockRequest);
        request.items = [
          {
            item: item2_id,
            quantity:1000
          }
        ]
        request.user = '1896510c820ada1a8d7b5875';
        request.save((err, request) => {
          should.not.exist(err);
          chai.request(server)
          .put('/api/requests/'+request._id)
          .set('Authorization', standard_token)
          .send({
            'reason': 'NONE',
            'status': 'APPROVED',
            'user': user_id
          })
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.error.should.be.eql("You are not authorized to modify another user's request");
            done();
          });
        });
      });
  });
  it('Should not PUT request for standard user with another username in request', (done) => {
      helpers.createNewUser('standard_user', 'test', 'test@test.com', 'STANDARD' , function(err, user) {
      should.not.exist(err);
      var standard_token = helpers.createAuthToken(user);
      var request = new Request(pendingMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ];
      request.user = "1896510c820ada1a8d7b5875";
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .put('/api/requests/'+request._id)
        .set('Authorization', standard_token)
        .send({
          'reason': 'NONE',
          'status': 'APPROVED',
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.error.should.be.eql("You are not authorized to modify another user's request");
          done();
        });
      });
    });
});
  });
  describe('DELETE /request/:item_id', ()=>{
    it('DELETE request by request id', (done) =>{
      var request = new Request(pendingMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ];
      request.user = user_id;
      request.save((err, request)=>{
        should.not.exist(err);
        chai.request(server)
        .delete('/api/requests/'+request._id)
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Delete successful');
          done();
        });
      })
    });
    it('DELETE request by request id then DELETE should fail', (done) =>{
      var request = new Request(pendingMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ];
      request.user = user_id;
      request.save((err, request)=>{
        should.not.exist(err);
        chai.request(server)
        .delete('/api/requests/'+request._id)
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          chai.request(server)
          .delete('/api/requests/'+request._id)
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('Request has already been cancelled');
            done();
          });
        });
      })
    });
    it('DELETE request by request id then GET should not fail', (done) =>{
      var request = new Request(pendingMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ];
      request.user = user_id;
      request.save((err, request)=>{
        should.not.exist(err);
        chai.request(server)
        .delete('/api/requests/'+request._id)
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          chai.request(server)
          .get('/api/requests/'+request._id)
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.is_cancelled.should.be.eql(true);
            done();
          });
        });
      });
    });
    it('DELETE request by request id then PUT should fail', (done) =>{
      var request = new Request(pendingMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ];
      request.user = user_id;
      request.save((err, request)=>{
        should.not.exist(err);
        chai.request(server)
        .delete('/api/requests/'+request._id)
        .set('Authorization', token)
        .end((err, res) => {
          should.not.exist(err);
          chai.request(server)
          .put('/api/requests/'+request._id)
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('You cannot edit a cancelled request');
            done();
          });
        });
      });
    });
    it('DELETE own request by non-admin user', (done) =>{
      helpers.createNewUser('standard', 'standard', 'test@test.com', 'STANDARD' , function(err, user) {
        should.not.exist(err);
        token = helpers.createAuthToken(user);
        user_id = user._id;
        var request = new Request(pendingMockRequest);
        request.items = [
          {
            item: item2_id,
            quantity:1000
          }
        ];
        request.user = user_id;
        request.save((err, request)=>{
          should.not.exist(err);
          chai.request(server)
          .delete('/api/requests/'+request._id)
          .set('Authorization', token)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Delete successful');
            // Check to make sure it does not exist in db
            chai.request(server)
            .get('/api/requests/'+request._id)
            .set('Authorization', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.is_cancelled.should.be.eql(true);
              done();
            });
          });
        });
      });
    });
    it('DELETE someone elses request by non-admin user', (done) =>{
      var admin_request = new Request(pendingMockRequest);
      admin_request.items = [
        {
          item: item2_id,
          quantity:1000
        }
      ];
      admin_request.user = user_id;
      admin_request.save(function(err, admin_request){
        should.not.exist(err);
        helpers.createNewUser('standard', 'standard', 'test@test.com', 'STANDARD' , function(err, user) {
          should.not.exist(err);
          var standard_token = helpers.createAuthToken(user);
          standard_user_id = user._id;
          var standard_request = new Request(pendingMockRequest);
          standard_request.items = [
            {
              item: item2_id,
              quantity:1000
            }
          ];
          standard_request.user = standard_user_id;
          standard_request.save(function(err, request){
            should.not.exist(err);
            chai.request(server)
            .delete('/api/requests/'+admin_request._id)
            .set('Authorization', standard_token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('error').eql('You are not authorized to remove this request');
              done();
            });
          });
        });
      });
    });
    it('DELETE another request by admin user', (done) =>{
      helpers.createNewUser('standard', 'standard', 'test@test.com', 'STANDARD' , function(err, user) {
        should.not.exist(err);
        standard_token = helpers.createAuthToken(user);
        standard_user_id = user._id;
        var standard_request = new Request(pendingMockRequest);
        standard_request.items = [
          {
            item: item2_id,
            quantity:1000
          }
        ];
        standard_request.user = standard_user_id;
        standard_request.save((err, request)=>{
          should.not.exist(err);
          chai.request(server)
          .delete('/api/requests/'+request._id)
          .set('Authorization', token) // admin token
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Delete successful');
            // Check to make sure it does not exist in db
            chai.request(server)
            .get('/api/requests/'+request._id)
            .set('Authorization', token)
            .end((err, res) => {
              should.not.exist(err);
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.is_cancelled.should.be.eql(true);
              done();
            });
          });
        });
      });
    });
  });

  describe('PATCH /requests/:request_id', ()=> {
    it('Error if DISBURSE not entered as action', (done) => {
      var request = new Request(pendingMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:100
        }
      ];
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'DISBRSS'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql("Action not recognized");
          done();
        });
      });
    });
    it('updates the request and item after disbursement', (done) => {
      var request = new Request(approvedMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:100
        }
      ];
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'FULFILL'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.request.status.should.be.eql('FULFILLED');
          res.body.message.should.be.eql("Fulfillment successful");
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(1);
          Item.findById(item2_id, function(err, item) {
            should.not.exist(err);
            item.quantity.should.be.eql(900);
            item.name.should.be.eql("2k resistor");
            Request.findById(request._id, function(err, request) {
              should.not.exist(err);
              request.status.should.be.eql('FULFILLED');
              done();
            });
          });
        });
      });
    });
    it('updates the request and multiple items after disbursement', (done) => {
      var request = new Request(approvedMockRequest);
      request.items = [
        {
          item: item1_id,
          quantity: 100
        },
        {
          item: item2_id,
          quantity:100
        }
      ];
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'FULFILL'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.request.status.should.be.eql('FULFILLED');
          res.body.message.should.be.eql("Fulfillment successful");
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(2);
          Item.findById(item2_id, function(err, item) {
            should.not.exist(err);
            item.quantity.should.be.eql(900);
            item.name.should.be.eql("2k resistor");
            Item.findById(item1_id, function(err, item) {
              should.not.exist(err);
              item.quantity.should.be.eql(900);
              item.name.should.be.eql("1k resistor");
              Request.findById(request._id, function(err, request) {
                should.not.exist(err);
                request.status.should.be.eql('FULFILLED');
                Loan.find({}, function(error, loans) {
                  loans.length.should.be.eql(0);
                })
                done();
              });
            });
          });
        });
      });
    });

    it('creates a loan after fulfilling a request for a loan', (done) => {
      var request = new Request(approvedMockRequest);
      request.action = 'LOAN';
      request.items = [
        {
          item: item1_id,
          quantity: 100
        },
        {
          item: item2_id,
          quantity:300
        }
      ];
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'FULFILL'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.request.status.should.be.eql('FULFILLED');
          res.body.message.should.be.eql("Fulfillment successful");
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(2);
          Item.findById(item2_id, function(err, item) {
            should.not.exist(err);
            item.quantity.should.be.eql(700);
            item.name.should.be.eql("2k resistor");
            Item.findById(item1_id, function(err, item) {
              should.not.exist(err);
              item.quantity.should.be.eql(900);
              item.name.should.be.eql("1k resistor");
              Request.findById(request._id, function(err, request) {
                should.not.exist(err);
                request.status.should.be.eql('FULFILLED');
                Loan.find({}, function(err, loans) {
                  loans.length.should.be.eql(1);
                  var loan = loans[0];
                  loan.user.should.be.eql(user_id);
                  loan.items.length.should.be.eql(2);
                  loan.items.forEach(function(itemObj) {
                    [item1_id, item2_id].should.include(itemObj.item);
                    [100, 300].should.include(itemObj.quantity);
                    itemObj.status.should.be.eql('LENT');
                  });
                  loan.request.should.be.eql(request._id);
                  done();
                });
              });
            });
          });
        });
      });
    });

    it('updates the request and multiple items after disbursement of all remaining quantity', (done) => {
      var request = new Request(approvedMockRequest);
      request.items = [
        {
          item: item1_id,
          quantity: 1000
        },
        {
          item: item2_id,
          quantity:1000
        }
      ];
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'FULFILL'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.request.status.should.be.eql('FULFILLED');
          res.body.message.should.be.eql("Fulfillment successful");
          res.body.items.should.be.a('array');
          res.body.items.length.should.be.eql(2);
          Item.findById(item2_id, function(err, item) {
            should.not.exist(err);
            item.quantity.should.be.eql(0);
            item.name.should.be.eql("2k resistor");
            Item.findById(item1_id, function(err, item) {
              should.not.exist(err);
              item.quantity.should.be.eql(0);
              item.name.should.be.eql("1k resistor");
              Request.findById(request._id, function(err, request) {
                should.not.exist(err);
                request.status.should.be.eql('FULFILLED');
                done();
              });
            });
          });
        });
      });
    });
    it('Does not disburse if first item has insufficient quantity', (done) => {
      var request = new Request(approvedMockRequest);
      request.action = 'LOAN';
      request.items = [
        {
          item: item1_id,
          quantity: 1001
        },
        {
          item: item2_id,
          quantity:100
        }
      ];
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'FULFILL'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql('Insufficient quantity of item: 1k resistor');
          Item.findById(item2_id, function(err, item) {
            should.not.exist(err);
            item.quantity.should.be.eql(1000);
            item.name.should.be.eql("2k resistor");
            Item.findById(item1_id, function(err, item) {
              should.not.exist(err);
              item.quantity.should.be.eql(1000);
              item.name.should.be.eql("1k resistor");
              Request.findById(request._id, function(err, request) {
                should.not.exist(err);
                request.status.should.be.eql('APPROVED');
                Loan.find({}, function(error, loans) {
                  loans.length.should.be.eql(0);
                  done();
                });
              });
            });
          });
        });
      });
    });
    it('Does not disburse if second item has insufficient quantity', (done) => {
      var request = new Request(approvedMockRequest);
      request.items = [
        {
          item: item1_id,
          quantity: 100
        },
        {
          item: item2_id,
          quantity:1001
        }
      ];
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'FULFILL'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql('Insufficient quantity of item: 2k resistor');
          Item.findById(item2_id, function(err, item) {
            should.not.exist(err);
            item.quantity.should.be.eql(1000);
            item.name.should.be.eql("2k resistor");
            Item.findById(item1_id, function(err, item) {
              should.not.exist(err);
              item.quantity.should.be.eql(1000);
              item.name.should.be.eql("1k resistor");
              Request.findById(request._id, function(err, request) {
                should.not.exist(err);
                request.status.should.be.eql('APPROVED');
                done();
              });
            });
          });
        });
      });
    });

    it('cannot update a quantity below 0', (done) => {
      var request = new Request(approvedMockRequest);
      request.items = [
        {
          item: item2_id,
          quantity:1001
        }
      ];
      request.user = user_id;
      request.save((err, request) => {
        should.not.exist(err);
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'FULFILL'
        })
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.body.error.should.be.eql('Insufficient quantity of item: 2k resistor');
          Request.findById(request._id, function(err, request) {
            should.not.exist(err);
            request.status.should.be.eql('APPROVED');
            done();
          });
        });
      });
    });

    describe('fulfilling requests with instances', () => {
      var allItems;
      var allInstances;
      var mockInstanceRequest;

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
            mockInstanceRequest = {
              user: user_id,
              reason: "reason",
              status: "APPROVED",
              items: [
                {item: allItems['Laptop']._id, quantity: 2},
                {item: allItems['scopey']._id, quantity: 1},
                {item: allItems['Not an asset']._id, quantity: 50}
              ]
            };
            done();
          });
        });
      });

      it('fulfills a disbursement request for asset items with instances', (done) => {
        mockInstanceRequest.action = 'DISBURSEMENT';
        var request = new Request(mockInstanceRequest);
        var body = {
          action: 'FULFILL',
          instances: {}
        };
        body.instances[allItems['Laptop']._id] = [allInstances['1']._id, allInstances['2']._id];
        body.instances[allItems['scopey']._id] = [allInstances['4']._id];
        request.save(function(error, request) {
          should.not.exist(error);
          chai.request(server)
          .patch('/api/requests/'+request._id)
          .set('Authorization', token)
          .send(body)
          .end((error, res) => {
            should.not.exist(error);
            res.should.have.status(200);
            Request.findById(request._id, function(err, request) {
              should.not.exist(err);
              request.status.should.be.eql('FULFILLED');
              Instance.find(
                {tag: {$in: ['1', '2', '4']}},
                function(error, instances) {
                  should.not.exist(error);
                  instances.length.should.be.eql(0);
                  Item.findById(allItems['Laptop']._id, function(error, item) {
                    item.quantity.should.be.eql(0);
                    done();
                  });
                }
              );
            });
          });
        });
      });

      it('does not fulfill a disbursement request if not enough instances provided', (done) => {
        mockInstanceRequest.action = 'DISBURSEMENT';
        var request = new Request(mockInstanceRequest);
        var body = {
          action: 'FULFILL',
          instances: {}
        };
        body.instances[allItems['Laptop']._id] = [allInstances['1']._id];
        body.instances[allItems['scopey']._id] = [allInstances['4']._id];
        request.save(function(error, request) {
          should.not.exist(error);
          chai.request(server)
          .patch('/api/requests/'+request._id)
          .set('Authorization', token)
          .send(body)
          .end((error, res) => {
            should.not.exist(error);
            res.should.have.status(200);
            res.body.error.should.be.eql('Incorrect number of instances supplied');
            Request.findById(request._id, function(err, request) {
              should.not.exist(err);
              request.status.should.be.eql('APPROVED');
              Instance.find(
                {tag: {$in: ['1', '2', '4']}},
                function(error, instances) {
                  should.not.exist(error);
                  instances.length.should.be.eql(3);
                  Item.findById(allItems['Laptop']._id, function(error, item) {
                    item.quantity.should.be.eql(2);
                    done();
                  });
                }
              );
            });
          });
        });
      });

      it('fulfills a loan request for asset items with instances', (done) => {
        mockInstanceRequest.action = 'LOAN';
        var request = new Request(mockInstanceRequest);
        var body = {
          action: 'FULFILL',
          instances: {}
        };
        body.instances[allItems['Laptop']._id] = [allInstances['1']._id, allInstances['2']._id];
        body.instances[allItems['scopey']._id] = [allInstances['4']._id];
        request.save(function(error, request) {
          should.not.exist(error);
          chai.request(server)
          .patch('/api/requests/'+request._id)
          .set('Authorization', token)
          .send(body)
          .end((error, res) => {
            should.not.exist(error);
            res.should.have.status(200);
            Request.findById(request._id, function(err, request) {
              should.not.exist(err);
              request.status.should.be.eql('FULFILLED');
              Instance.find(
                {tag: {$in: ['1', '2', '4']}},
                function(error, instances) {
                  should.not.exist(error);
                  instances.length.should.be.eql(3);
                  instances.should.all.have.property('in_stock', false);
                  Item.findById(allItems['Laptop']._id, function(error, item) {
                    item.quantity.should.be.eql(0);
                    Loan.findOne({}, function(error, loan) {
                      var foundItems = 0;
                      loan.items.forEach(function(itemObj) {
                        if (String(itemObj.item) === String(allItems['Laptop']._id)) {
                          itemObj.quantity.should.be.eql(2);
                          itemObj.instances.length.should.be.eql(2);
                          itemObj.instances.should.include(allInstances['1']._id)
                          itemObj.instances.should.include(allInstances['2']._id)
                          foundItems += 1;
                        }
                        if (String(itemObj.item) === String(allItems['scopey']._id)) {
                          itemObj.quantity.should.be.eql(1);
                          itemObj.instances.length.should.be.eql(1);
                          itemObj.instances.should.include(allInstances['4']._id)
                          foundItems += 1;
                        }
                      });
                      foundItems.should.be.eql(2);
                      done();
                    });
                  });
                }
              );
            });
          });
        });
      });

    });
  });

});
