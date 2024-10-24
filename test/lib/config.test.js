import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import config from '../../lib/config.js';

suite('lib/config', () => {

  test('env', () => assert.equal(config.env, "development"));
  test('port', () => assert.equal(config.port, 8080));
  test('host', () => assert.equal(typeof config.host, "string"));
  test('basedir', () => assert.equal(typeof config.basedir, "string"));
  test('debug', () => assert.equal(config.debug, true));
  test('ghToken', () => assert.equal(typeof config.ghToken, "string"));
  test('destination', () => assert.equal(typeof config.destination, "string"));
  test('refreshCycle', () => assert.equal(Number.isInteger(config.refreshCycle), true));

  suite('checkOptions', () => {
    test('checkOptions port', () => {
      assert.equal(config.checkOptions("port"), true);
    });
    test('checkOptions port,env', () => {
      assert.equal(config.checkOptions("port", "env"), true);
    });
    test('checkOptions missing', () => {
      assert.equal(config.checkOptions("missing"), false);
    });
    test('checkOptions port,env,missing', () => {
      assert.equal(config.checkOptions("port", "env", "missing"), false);
    });
  });

});