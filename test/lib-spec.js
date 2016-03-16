'use strict';
var pm2HealthCheck = require('..');
var pm2 = require('pm2');
var request = require('supertest');
var express = require('express');

describe('pm2 health check', function () {
  var app, processes;
  beforeEach(function () {
    app = express();
    processes = [];
    pm2HealthCheck(app);
    sinon.stub(pm2, 'connect', function (callback) { callback(null); });
    sinon.stub(pm2, 'list', function (callback) { callback(null, processes); });
    sinon.stub(pm2, 'disconnect');
  });
  afterEach(function () {
    pm2.connect.restore();
    pm2.list.restore();
    pm2.disconnect.restore();
  });
  it('should return 200 if at least one process is online', function (done) {
    processes = [{pm2_env: {status: 'online'}}, {pm2_env: {status: 'offline'}}];
    request(app)
      .get('/health')
      .expect(200, done);
  });
  it('should return 500 if all processes are not online', function (done) {
    processes = [{pm2_env: {status: 'halted'}}, {pm2_env: {status: 'offline'}}];
    request(app)
      .get('/health')
      .expect(500, done);
  });
  describe('optional params', function () {
    it('should mount the endpoint to the passed url', function (done) {
      var url = '/health-check';
      app = express();
      pm2HealthCheck(app, {url: url});
      request(app)
        .get(url)
        .end(function () {
          pm2.connect.should.have.been.calledOnce;
          done()
        });
    });
    describe('take the optimistic approach if `optimistic: true` is passed', function () {
      beforeEach(function () {
        app = express();
        pm2HealthCheck(app, {optimistic: true});
      });
      it ('should return 500 if one process is not online', function (done) {
        processes = [{pm2_env: {status: 'online'}}, {pm2_env: {status: 'offline'}}];
        request(app)
          .get('/health')
          .expect(500, done);
      });
      it ('should return 200 if all processes is online', function (done) {
        processes = [{pm2_env: {status: 'online'}}, {pm2_env: {status: 'online'}}];
        request(app)
          .get('/health')
          .expect(200, done);
      });
    });
  });
  describe('function calls', function () {
    it('should call connect to the pm2 daemon', function (done) {
      request(app)
        .get('/health')
        .end(function () {
          pm2.connect.should.have.been.calledOnce;
          done()
        });
    });
    it('should call disconnect to the pm2 daemon', function (done) {
      request(app)
        .get('/health')
        .end(function () {
          pm2.disconnect.should.have.been.calledOnce;
          done()
        });
    });
    it('should call pm2.list to get the process list', function (done) {
      request(app)
        .get('/health')
        .end(function () {
          pm2.list.should.have.been.calledOnce;
          done()
        });
    });
  });
});
