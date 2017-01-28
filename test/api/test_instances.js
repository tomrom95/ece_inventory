process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let auth_helpers = require('../../server/auth/auth_helpers');
let instances_helpers = require('./test_instances_helpers');
let server = require('../../server');
let fakeJSONData = require('./test_instances_data');

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

describe('Instance API Test', function() {
  var token;
  var item_id;
  beforeEach((done) => { //Before each test we empty the database
      Item.remove({}, (err) => {
        User.remove({}, (err) => {
          auth_helpers.createNewUser('test_user', 'test', false, function(error, user) {
            token = auth_helpers.createAuthToken(user);
            fakeJSONData.instances = instances_helpers.createMockInstances();
            Item.insertMany(fakeJSONData).then(function(obj){
              item_id = obj[0]._id;
              done();
            });
          });
          });
        });
      });

      describe('GET Instances', () =>{
        it('GETs all instances', (done) => {
          chai.request(server)
            .get('/api/inventory/'+item_id+'/instances')
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(2);
              res.body.should.all.have.property('serial_number');
              res.body.should.all.have.property('condition');
              res.body.should.all.have.property('status','AVAILABLE');
            done();
          });
        });
        it('GETs instance by serial number', (done) => {
          chai.request(server)
            .get('/api/inventory/'+item_id+'/instances?serial_number=123')
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(1);
              res.body.should.all.have.property('serial_number', '123');
              res.body.should.all.have.property('condition', 'GOOD');
              res.body.should.all.have.property('status','AVAILABLE');
            done();
          });
        });

      });


})


//    GET Query /instances
//      ✓ GETs item by exact name
//      ✓ GETs all instances with null name
//      ✓ GETs item by model number
//      ✓ GETs all instances with null model number
//      ✓ GETs items with location
//      ✓ GETs all instances with null location
//      ✓ GETs items with one required tag
//      ✓ GETs items with multiple required tags
//      ✓ GETs all instances with no required tags
//      ✓ GETs items with 1 excluded tag
//      ✓ GETs items with multiple excluded tags
//      ✓ GETs all instances with no excluded tags
//      ✓ GETs items with multiple required and excluded tags
//      ✓ GETs items with name, multiple required and excluded tags
//      ✓ GETs all instances with wrong parameter fields
//    GET /:instance_id
//      ✓ GETs instances item by item id
//    PUT /:instance_id
//      ✓ PUTs instances item by item id
//    POST /instances
//      ✓ Should not POST without name field
//      ✓ Should not POST without quantity field
//      ✓ Should not POST without has_instance_objects field
//      ✓ POSTs successfully
//    DELETE /:instances_id
//      ✓ DELETE instances item by item id
//      ✓ DELETE instances item by item id, then DELETE should fail
//      ✓ DELETE instances item by item id, then GET should fail
//      ✓ DELETE instances item by item id, then PUT should fail
