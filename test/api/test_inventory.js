process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

var request = require('supertest');
require = require('really-need');

describe('Loading Express Server', function () {
  var server;
  beforeEach(function () {
    server = require('/server', { bustCache: true });
  });
  afterEach(function (done) {
    server.close(done);
  });

  it('GETs all inventory', function testSlash(done) {
    chai.request(server)
      .get('/inventory')
      .end((err, res) => {
        res.should.have.status(200);
        // res.body.should.be.a('array');
        // res.body.length.should.be.eql(0);
      done();
    });
  });
  // it('Successful POST /inventory', function testPath(done) {
  //   request(server)
  //     .post({
  //
  //     })
  //     .expect(200, done);
  // });
});
