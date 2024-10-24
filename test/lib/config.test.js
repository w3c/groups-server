import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import config from '../../lib/config.js';

suite('lib/config', () => {

  test('env', () => assert.equal(config.env, "dev"));
  test('port', () => assert.equal(config.port, 8080));
  test('host', () => assert.equal(typeof config.host, "string"));
  test('basedir', () => assert.equal(typeof config.basedir, "string"));
  test('debug', () => assert.equal(config.debug, true));
  test('production', () => assert.equal(config.production, false));
  test('ghToken', () => assert.equal(typeof config.ghToken, "string"));
  test('destination', () => assert.equal(typeof config.destination, "string"));
  test('refreshCycle', () => assert.equal(Number.isInteger(config.refreshCycle), true));

  suite('checkOptions', () => {
    test("valid", () => {
      let s = config.checkOptions("port");
      assert.equal(s, null, 'port');
      s = config.checkOptions("port", "env");
      assert.equal(s, null, 'port,env');
    });
    test('missing', () => {
      let s = config.checkOptions("missing");
      assert.equal(s.has('missing'), true, 'missing');
      s = config.checkOptions("port", "env", "missing");
      assert.equal(s.has('missing'), true, 'port,env,missing');
    });
  });

});