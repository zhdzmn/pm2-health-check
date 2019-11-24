'use strict';
const pm2HealthCheck = require('..');
const pm2 = require('pm2');
const request = require('supertest');
const express = require('express');

describe('pm2 health check', () => {
  const sandbox = sinon.createSandbox();
  afterEach(sandbox.restore);
  describe('Unit test', () => {
    let app, processes;
    beforeEach(() => {
      app = express();
      processes = [];
      pm2HealthCheck(app);
      sandbox.stub(pm2, 'connect').callsFake(callback => callback(null));
      sandbox.stub(pm2, 'list').callsFake(callback => callback(null, processes));
      sandbox.stub(pm2, 'disconnect');
    });
    it('should return 200 if at least one process is online', async () => {
      processes = [{pm2_env: {status: 'online'}}, {pm2_env: {status: 'offline'}}];
      await request(app)
        .get('/health')
        .expect(200);
    });
    it('should return 500 if all processes are not online', async () => {
      processes = [{pm2_env: {status: 'halted'}}, {pm2_env: {status: 'offline'}}];
      await request(app)
        .get('/health')
        .expect(500);
    });
    describe('optional params', () => {
      it('should mount the endpoint to the passed url', async () => {
        const url = '/health-check';
        app = express();
        pm2HealthCheck(app, {url: url});
        await request(app).get(url);
        pm2.connect.should.have.been.calledOnce;
      });
      describe('take the optimistic approach if `optimistic: true` is passed', () => {
        beforeEach(() => {
          app = express();
          pm2HealthCheck(app, {optimistic: true});
        });
        it ('should return 500 if one process is not online', async () => {
          processes = [{pm2_env: {status: 'online'}}, {pm2_env: {status: 'offline'}}];
          await request(app)
            .get('/health')
            .expect(500);
        });
        it ('should return 200 if all processes is online', async () => {
          processes = [{pm2_env: {status: 'online'}}, {pm2_env: {status: 'online'}}];
          await request(app)
            .get('/health')
            .expect(200);
        });
      });
    });
    describe('function calls', () => {
      it('should call connect to the pm2 daemon', async () => {
        await request(app).get('/health');
        pm2.connect.should.have.been.calledOnce;
      });
      it('should call disconnect to the pm2 daemon', async () => {
        await request(app).get('/health');
        pm2.disconnect.should.have.been.calledOnce;
      });
      it('should call pm2.list to get the process list', async () => {
        await request(app).get('/health');
        pm2.list.should.have.been.calledOnce;
      });
    });
  });
});
