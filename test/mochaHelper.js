var chai = require('chai');
chai.config.includeStack = true;
global.should = chai.should();

global.sinon = require('sinon');
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;

var sinonChai = require('sinon-chai');
chai.use(sinonChai);
