import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import * as utils from '../../lib/utils.js';

suite('lib/utils', () => {

suite('arrayOfString', () => {
    test("arrays", () => {
      assert.deepEqual(utils.arrayOfString(["foobar"]), ["foobar"],
          'array with one string');
      assert.deepEqual(utils.arrayOfString(["foobar", null]), ["foobar"],
        'array with a string and null');
      assert.deepEqual(utils.arrayOfString(["foobar", [null]]), ["foobar"],
        'array with a string and an array with null');
    });
    test('strings', () => {
        assert.deepEqual(utils.arrayOfString("foobar"), ["foobar"]);
    });


    test('undefined', () => {
        assert.equal(utils.arrayOfString(""), undefined,
          'empty string');
        assert.equal(utils.arrayOfString(null), undefined, 'null');
        assert.equal(utils.arrayOfString(0), undefined, 'a number');
        assert.equal(utils.arrayOfString(true), undefined, 'a boolean');
        assert.equal(utils.arrayOfString([""]), undefined,
          'array containing an empty string');
        assert.equal(utils.arrayOfString([null]), undefined,
          'array containing null');
        assert.equal(utils.arrayOfString([0]), undefined, 'array containing a number');
        assert.equal(utils.arrayOfString([true]), undefined, 'array containing a boolean');
    });
});

suite('toBoolean', () => {
  test("true", () => {
    assert.equal(utils.toBoolean(true), true, 'a boolean');
    assert.equal(utils.toBoolean("true"), true, 'a string true');
    assert.equal(utils.toBoolean("1"), true, 'a string 1');
    assert.equal(utils.toBoolean(1), true, 'a number');
  });
  test('false', () => {
    assert.equal(utils.toBoolean(false), false, 'a boolean');
    assert.equal(utils.toBoolean("false"), false, 'a string false');
    assert.equal(utils.toBoolean("0"), false, 'a string 0');
    assert.equal(utils.toBoolean(0), false, 'a number');
  });
  test('undefined', () => {
    assert.equal(utils.toBoolean("foobar"), undefined, 'an invalid string');
    assert.equal(utils.toBoolean(10), undefined, 'a number');
    assert.equal(utils.toBoolean([10]), undefined, 'an array');
    assert.equal(utils.toBoolean(null), undefined, 'a null');
  });

});

suite('fetchJSON', async () => {
  const f1 = await utils.fetchJSON("https://api.w3.org/groups/other/tag");
  test('group exists', () => {
      assert.deepEqual(f1.id, 34270);
  });
  test('group does not exist', () => {
    assert.rejects(utils.fetchJSON("https://api.w3.org/groups/other/unknown"));
  });
  test('not even JSON', () => {
    assert.rejects(utils.fetchJSON("https://www.w3.org/"));
  });
});

});