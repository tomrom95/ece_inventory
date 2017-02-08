process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Item = require('../../server/model/items');
let User = require('../../server/model/users');
let helpers = require('../../server/auth/auth_helpers');
let server = require('../../server');
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);
chai.use(require('chai-things'));

let itemData = [
  {
    "quantity": 1000,
    "name": "a",
    "tags": [
      "component",
      "electric",
      "cheap"
    ]
  },
  {
    "quantity": 1000,
    "name": "b",
    "tags": [
      "component",
      "electric",
      "expensive"
    ]
  },
  {
    "quantity": 1000,
    "name": "c",
    "tags": [
      "other",
      "tags",
      "here"
    ]
  }
];

describe('Tag API Test', function () {
  var token;
  beforeEach((done) => { //Before each test we empty the database
      Item.remove({}, (err) => {
        User.remove({}, (err) => {
          helpers.createNewUser('test_user', 'test', true, function(error, user) {
            token = helpers.createAuthToken(user);
            Item.insertMany(itemData).then(function(obj){
              done();
            });
          });
        });
      });
    });

  it('GETs all distinct tags', (done) => {
    chai.request(server)
      .get('/api/inventory/tags')
      .set('Authorization', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(7);
        res.body.should.include.members(["component", "electric", "cheap", "expensive", "other", "tags", "here"]);
        var distinct = {}
        // test for distinct values
        for (var i = 0; i < res.body.length; i++) {
          var elem = res.body[i];
          if (!distinct[elem]) {
            distinct[elem] = 0;
          }
          distinct[elem]++;
          // we should only see each element once
          distinct[elem].should.be.at.most(1);
        }
        done();
      });
  });

  it('GETs less tags after delete', (done) => {
    Item.findOne({name: 'c'}, function (error, result) {
      chai.request(server)
        .delete('/api/inventory/' + result._id)
        .set('Authorization', token)
        .end((err, res) => {
          chai.request(server)
            .get('/api/inventory/tags')
            .set('Authorization', token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(4);
              res.body.should.not.include('other');
              done();
            });
        });
    });
  });

  it('GETs more tags after post', (done) => {
    var item = {
      "quantity": 1000,
      "name": "d",
      "tags": ["different_tag"],
      "has_instance_objects": false
    };
    chai.request(server)
      .post('/api/inventory/')
      .set('Authorization', token)
      .send(item)
      .end((err, res) => {
        chai.request(server)
          .get('/api/inventory/tags')
          .set('Authorization', token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(8);
            res.body.should.include('different_tag');
            done();
          });
      });
  });
});
