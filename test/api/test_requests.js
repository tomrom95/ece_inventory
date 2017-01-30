

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
  beforeEach((done) => { //Before each test we empty the database
      Item.remove({}, (err) => {
       Request.remove({}, (err)=>{
        User.remove({}, (err) => {
          helpers.createNewUser('test_user', 'test', true, function(error, user) {
            token = helpers.createAuthToken(user);
            Item.insertMany(fakeItemData).then(function(obj){
                Item.findOne({'name':'1k resistor'}, function(err,items){
                  item_id = items._id;
                  fakeRequestData.forEach(function(obj){
                    obj.item = item_id;
                    obj.user_id = user._id;
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
        res.body.should.all.have.property("user_id");
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
          let request = new Request({
              "reviewer_comment": "NONADMIN",
              "requestor_comment": "NONADMIN",
              "reason": "NONADMIN",
              "quantity": 2000,
              "status": "PENDING",
              "created": "2019-01-29T05:00:00.000Z"
            });
            request.item = item_id;
            request.user_id = user._id;
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


    // GET query works for all params
    // GET status works for all enums
    // POST - not entering Date should return today's date string
    // POST should post for specific user id
  });
});
