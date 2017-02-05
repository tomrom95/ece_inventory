process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let Request = require('../../server/model/requests');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let fakeItemData = require('./test_inventory_data');
let fakeRequestData = require('./test_requests_data');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Requests API Test', function () {
  var token;
  var item_id;
  var user_id;
  beforeEach((done) => { //Before each test we empty the database
    Item.remove({}, (err) => {
      Request.remove({}, (err)=>{
        User.remove({}, (err) => {
          helpers.createNewUser('test_user', 'test', true, function(error, user) {
            token = helpers.createAuthToken(user);
            user_id = user._id;
            Item.insertMany(fakeItemData).then(function(obj){
              // Get the id from one item
              Item.findOne({'name':'1k resistor'}, function(err,items){
                item_id = items._id;
                // Add the user id manually, and the item associated
                fakeRequestData.forEach(function(obj){
                  obj.item = item_id;
                  obj.user = user._id;
                });
                Request.insertMany(fakeRequestData, function(obj){
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  describe('GET /requests', () =>{
    it('GETs all requests', (done) => {
      chai.request(server)
      .get('/api/requests')
      .set('Authorization', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(5);
        res.body.should.all.have.property("user");
        res.body.should.all.have.property("quantity");
        res.body.should.all.have.property("item");
        res.body[0].item.should.have.property("name","1k resistor");
        res.body[0].item._id.should.eql(item_id.toString());
        done();
      });
    });
    it('Non-admin user gets only their requests', (done) => {
      helpers.createNewUser('standard', 'test', false, function(error, user) {
        standard_token = helpers.createAuthToken(user);
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "quantity": 2000,
          "status": "PENDING",
          "created": "2019-01-29T05:00:00.000Z"
        });
        request.item = item_id;
        request.user = user._id;
        request.save(function(err){
          chai.request(server)
          .get('/api/requests')
          .set('Authorization', standard_token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(1);
            res.body.should.all.have.property("reviewer_comment", "NONADMIN");
            res.body.should.all.have.property("requestor_comment","NONADMIN");
            res.body[0].item.should.have.property("name","1k resistor");
            res.body[0].item._id.should.eql(item_id.toString());
            res.body.should.all.have.property("reason", "NONADMIN");
            res.body.should.all.have.property("_id",request.id);
            done();
          });
        });
      });
    });
    it('GETs requests by item id', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "quantity": 2000,
          "status": "PENDING",
          "created": "2019-01-29T05:00:00.000Z"
        });
        request.item = item2._id;
        request.user = user_id;
        request.save(function(err){
          chai.request(server)
          .get('/api/requests?item_id='+item_id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(5);
            res.body.should.all.have.property("user");
            res.body.should.all.have.property("quantity");
            res.body.should.all.have.property("item");
            res.body[0].item.should.have.property("name","1k resistor");
            res.body[0].item._id.should.eql(item_id.toString());
            done();
          });
        });
      });
    });
    it('GETs requests by item id, for new item', (done) => {
      var item2_id;
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "quantity": 2000,
          "status": "PENDING",
          "created": "2019-01-29T05:00:00.000Z"
        });
        request.item = item2._id;
        request.user = user_id;
        request.save(function(err){
          chai.request(server)
          .get('/api/requests?item_id='+item2._id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(1);
            res.body.should.all.have.property("user");
            res.body.should.all.have.property("quantity");
            res.body.should.all.have.property("item");
            res.body[0].item.should.have.property("name","2k resistor");
            res.body[0].item._id.should.eql(item2._id.toString());
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
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(3);
        res.body.should.all.have.property("quantity", 2000);
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
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(1);
        res.body.should.all.have.property("requestor_comment", "Urgent");
        res.body.should.all.have.property("quantity", 2000);
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
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(2);
        res.body.should.all.have.property("reason", "greed");
        res.body.should.all.have.property("requestor_comment", "Hello");
        res.body.should.all.have.property("quantity", 2000);
        res.body.should.all.have.property("reviewer_comment", "Bye");
        done();
      });
    });
    it('GETs NO requests by non-existent reason (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?reason=wi3u4rhfkwes')
      .set('Authorization', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
    it('GETs requests by quantity', (done) => {
      chai.request(server)
      .get('/api/requests?quantity=2000')
      .set('Authorization', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(5);
        res.body.should.all.have.property("quantity", 2000);
        done();
      });
    });
    it('GETs requests by non-existent quantity', (done) => {
      chai.request(server)
      .get('/api/requests?quantity=123098')
      .set('Authorization', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
    it('GETs requests by status (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?status=PenDiNG')
      .set('Authorization', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(2);
        res.body.should.all.have.property("status", "PENDING");
        res.body.should.all.have.property("reason", "happiness");
        res.body.should.all.have.property("quantity", 2000);
        done();
      });
    });
    it('GETs requests by invalid status (case-insensitive)', (done) => {
      chai.request(server)
      .get('/api/requests?status=LOL')
      .set('Authorization', token)
      .end((err, res) => {
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
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
  });

  describe('GET by ID /requests', () =>{
    it('GET request by request ID successful', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "quantity": 2000,
          "status": "PENDING",
          "created": "2019-01-29"
        });
        request.item = item2._id;
        request.user = user_id;
        request.save(function(err){
          chai.request(server)
          .get('/api/requests/' + request._id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("reviewer_comment", "NONADMIN");
            res.body.should.have.property("created", "2019-01-29T00:00:00.000Z");
            res.body.should.have.property("quantity", 2000);
            res.body._id.should.be.eql(request._id.toString());
            res.body.item._id.should.be.eql(item2._id.toString());
            done();
          });
        });
      });
    });
    it('GET no Request by invalid request ID successful', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "quantity": 2000,
          "status": "PENDING",
          "created": "2019-01-29"
        });
        request.item = item2._id;
        request.user = user_id;
        request.save(function(err){
          chai.request(server)
          .get('/api/requests/' + '988f8c2448c10662691386ab')
          .set('Authorization', token)
          .end((err, res) => {
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
    it('Should not POST without item id', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "quantity": 2000,
          "status": "PENDING",
          "created": "2019-01-29"
        });
        chai.request(server)
        .post('/api/requests/')
        .set('Authorization', token)
        .send(request)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property("error", "Item ID null");
          done();
        });
      });
    });
    // it('Should POST without Date, defaulting to Today', (done) => {
    //   Item.findOne({"name": "2k resistor"}, function(err, item2){
    //     var request = new Request({
    //       "reviewer_comment": "NONADMIN",
    //       "requestor_comment": "NONADMIN",
    //       "reason": "NONADMIN",
    //       "quantity": 2000,
    //       "status": "PENDING",
    //     });
    //     request.item = item2._id;
    //     request.save(function(err){
    //       chai.request(server)
    //       .post('/api/requests/')
    //       .set('Authorization', token)
    //       .send(request)
    //       .end((err, res) => {
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
    it('Should not POST without quantity', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "status": "PENDING",
          "created": "2019-01-29"
        });
        request.item = item2._id;
        chai.request(server)
        .post('/api/requests/')
        .set('Authorization', token)
        .send(request)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property("error");
          res.body.error.should.have.property("errors");
          res.body.error.errors.quantity.should.have.property("message","Path `quantity` is required.");
          res.body.error.errors.quantity.should.have.property("name", "ValidatorError");
          res.body.error.errors.quantity.should.have.property("kind", "required");
          done();
        });
      });
    });
    it('Should not POST with wrong status enum', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "status": "DSFJHK",
          "quantity": 2000,
          "created": "2019-01-29"
        });
        request.item = item2._id;
        chai.request(server)
        .post('/api/requests/')
        .set('Authorization', token)
        .send(request)
        .end((err, res) => {
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
        var request = new Request({
          "status": "PENDING",
          "quantity": 2000,
        });
        request.item = item2._id;
        chai.request(server)
        .post('/api/requests/')
        .set('Authorization', token)
        .send(request)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property("status", "PENDING");
          res.body.should.have.property("quantity", 2000);
          res.body.item.should.be.eql(item2._id.toString());
          done();
        });
      });
    });
    it('Should POST as admin with specified user id', (done) => {
      Item.findOne({"name": "2k resistor"}, function(err, item2){
        var request = new Request({
          "status": "PENDING",
          "quantity": 2000,
        });
        request.user = "5896510c820ada1a8d7b5875";
        request.item = item2._id;
        chai.request(server)
        .post('/api/requests/')
        .set('Authorization', token)
        .send(request)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property("status", "PENDING");
          res.body.should.have.property("quantity", 2000);
          res.body.should.have.property("user","5896510c820ada1a8d7b5875");
          done();
        });
      });
    });
    it('Should not POST as standard user with specified different user id in body', (done) => {
      helpers.createNewUser('standard_user', 'test', false , function(error, user) {
        var standard_token = helpers.createAuthToken(user);
        Item.findOne({"name": "2k resistor"}, function(err, item2){
          var request = new Request({
            "status": "PENDING",
            "quantity": 2000,
          });
          request.user = "1896510c820ada1a8d7b5875";
          request.item = item2._id;
          chai.request(server)
          .post('/api/requests/')
          .set('Authorization', standard_token)
          .send(request)
          .end((err, res) => {
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
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "PENDING",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = user_id;
      request.save((err, request) => {
        chai.request(server)
        .put('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'reason': 'NONE',
          'status': 'FULFILLED',
          'quantity': 3000
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.reason.should.be.eql('NONE');
          res.body.status.should.be.eql('FULFILLED');
          res.body.quantity.should.be.eql(3000);
          res.body.user.should.be.eql(user_id.toString());
          res.body._id.should.be.eql(request._id.toString());
          done();
        });
      });
    });
    it('PUTS request - admin user can specify user id', (done) => {
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "PENDING",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = "1896510c820ada1a8d7b5875";
      request.save((err, request) => {
        chai.request(server)
        .put('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'reason': 'NONE',
          'status': 'FULFILLED',
          'quantity': 3000
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.reason.should.be.eql('NONE');
          res.body.status.should.be.eql('FULFILLED');
          res.body.quantity.should.be.eql(3000);
          res.body.user.should.be.eql("1896510c820ada1a8d7b5875");
          res.body._id.should.be.eql(request._id.toString());
          done();
        });
      });
    });
    it('Should not PUT request for standard user specifying another user id in PUT body', (done) => {
        helpers.createNewUser('standard_user', 'test', false , function(error, user) {
        var standard_token = helpers.createAuthToken(user);
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "status": "PENDING",
          "quantity": 2000,
          "created": "2019-01-29"
        });
        request.item = item_id;
        request.user = user._id;
        request.save((err, request) => {
          chai.request(server)
          .put('/api/requests/'+request._id)
          .set('Authorization', standard_token)
          .send({
            'reason': 'NONE',
            'status': 'FULFILLED',
            'quantity': 3000,
            'user': "1896510c820ada1a8d7b5875"
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.error.should.be.eql("You are not authorized to modify another user's request");
            done();
          });
        });
      });
  });
  it('Should not PUT request for standard user with another user id in request', (done) => {
      helpers.createNewUser('standard_user', 'test', false , function(error, user) {
      var standard_token = helpers.createAuthToken(user);
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "PENDING",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = "1896510c820ada1a8d7b5875";
      request.save((err, request) => {
        chai.request(server)
        .put('/api/requests/'+request._id)
        .set('Authorization', standard_token)
        .send({
          'reason': 'NONE',
          'status': 'FULFILLED',
          'quantity': 3000
        })
        .end((err, res) => {
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
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "PENDING",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = user_id;
      request.save((err, request)=>{
        chai.request(server)
        .delete('/api/requests/'+request._id)
        .set('Authorization', token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Delete successful');
          done();
        });
      })
    });
    it('DELETE request by request id then DELETE should fail', (done) =>{
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "PENDING",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = user_id;
      request.save((err, request)=>{
        chai.request(server)
        .delete('/api/requests/'+request._id)
        .set('Authorization', token)
        .end((err, res) => {
          chai.request(server)
          .delete('/api/requests/'+request._id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('Request does not exist');
            done();
          });
        });
      })
    });
    it('DELETE request by request id then GET should fail', (done) =>{
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "PENDING",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = user_id;
      request.save((err, request)=>{
        chai.request(server)
        .delete('/api/requests/'+request._id)
        .set('Authorization', token)
        .end((err, res) => {
          chai.request(server)
          .get('/api/requests/'+request._id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('Request does not exist');
            done();
          });
        });
      });
    });
    it('DELETE request by request id then PUT should fail', (done) =>{
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "PENDING",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = user_id;
      request.save((err, request)=>{
        chai.request(server)
        .delete('/api/requests/'+request._id)
        .set('Authorization', token)
        .end((err, res) => {
          chai.request(server)
          .put('/api/requests/'+request._id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('Request does not exist');
            done();
          });
        });
      });
    });
    it('DELETE own request by non-admin user', (done) =>{
      helpers.createNewUser('standard', 'standard', false , function(error, user) {
        token = helpers.createAuthToken(user);
        user_id = user._id;
        var request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "status": "PENDING",
          "quantity": 2000,
          "created": "2019-01-29"
        });
        request.item = item_id;
        request.user = user_id;
        request.save((err, request)=>{
          chai.request(server)
          .delete('/api/requests/'+request._id)
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Delete successful');
            // Check to make sure it does not exist in db
            chai.request(server)
            .get('/api/requests/'+request._id)
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('error').eql('Request does not exist');
              done();
            });
          });
        });
      });
    });
    it('DELETE someone elses request by non-admin user', (done) =>{
      var admin_request = new Request({
        "reviewer_comment": "ADMIN",
        "requestor_comment": "ADMIN",
        "reason": "ADMIN",
        "status": "PENDING",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      admin_request.item = item_id;
      admin_request.user = user_id;
      admin_request.save(function(err, admin_request){
        helpers.createNewUser('standard', 'standard', false , function(error, user) {
          var standard_token = helpers.createAuthToken(user);
          standard_user_id = user._id;
          var standard_request = new Request({
            "reviewer_comment": "NONADMIN",
            "requestor_comment": "NONADMIN",
            "reason": "NONADMIN",
            "status": "PENDING",
            "quantity": 2000,
            "created": "2019-01-29"
          });
          standard_request.item = item_id;
          standard_request.user = standard_user_id;
          standard_request.save(function(err, request){
            chai.request(server)
            .delete('/api/requests/'+admin_request._id)
            .set('Authorization', standard_token)
            .end((err, res) => {
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
      helpers.createNewUser('standard', 'standard', false , function(error, user) {
        standard_token = helpers.createAuthToken(user);
        standard_user_id = user._id;
        var standard_request = new Request({
          "reviewer_comment": "NONADMIN",
          "requestor_comment": "NONADMIN",
          "reason": "NONADMIN",
          "status": "PENDING",
          "quantity": 2000,
          "created": "2019-01-29"
        });
        standard_request.item = item_id;
        standard_request.user = standard_user_id;
        standard_request.save((err, request)=>{
          chai.request(server)
          .delete('/api/requests/'+request._id)
          .set('Authorization', token) // admin token
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Delete successful');
            // Check to make sure it does not exist in db
            chai.request(server)
            .get('/api/requests/'+request._id)
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.should.have.property('error').eql('Request does not exist');
              done();
            });
          });
        });
      });
    });
  });

  describe('PATCH /requests/:request_id', ()=> {
    it('updates the request and item after disbursement', (done) => {
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "APPROVED",
        "quantity": 400,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = user_id;
      request.save((err, request) => {
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'DISBURSE'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.request.status.should.be.eql('FULFILLED');
          res.body.item.quantity.should.be.eql(600);
          Item.findById(item_id, function(err, item) {
            item.quantity.should.be.eql(600);
            Request.findById(request._id, function(err, request) {
              request.status.should.be.eql('FULFILLED');
              done();
            });
          });
        });
      });
    });

    it('cannot update a quantity below 0', (done) => {
      var request = new Request({
        "reviewer_comment": "NONADMIN",
        "requestor_comment": "NONADMIN",
        "reason": "NONADMIN",
        "status": "APPROVED",
        "quantity": 2000,
        "created": "2019-01-29"
      });
      request.item = item_id;
      request.user = user_id;
      request.save((err, request) => {
        chai.request(server)
        .patch('/api/requests/'+request._id)
        .set('Authorization', token)
        .send({
          'action': 'DISBURSE'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.error.should.be.eql('Insufficient quantity');
          Request.findById(request._id, function(err, request) {
            request.status.should.be.eql('APPROVED');
            done();
          });
        });
      });
    });
  });

});
