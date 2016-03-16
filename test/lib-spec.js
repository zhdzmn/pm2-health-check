'use strict';
var pm2HealthCheck = require('..');
var pm2 = require('pm2');
var request = require('supertest');
var express = require('express');

describe('pm2 health check', function () {
  var app;
  beforeEach(function () {
    app = express();
    pm2HealthCheck(app);
    sinon.stub(pm2, 'connect', function (callback) { callback(null); });
    sinon.stub(pm2, 'list', function (callback) { callback(null, []); });
    sinon.stub(pm2, 'disconnect');
  });
  afterEach(function () {
    pm2.connect.restore();
    pm2.list.restore();
    pm2.disconnect.restore();
  });
  it('should call connect to the pm2 daemon', function (done) {
    request(app)
      .get('/health')
      .end(function () {
        pm2.connect.should.have.been.calledOnce;
        done()
      });
  });
});
