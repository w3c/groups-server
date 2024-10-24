import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import * as utils from '../lib/utils.js';

suite('lib/utils', () => {

suite('arrayOfString', () => {
    test('array with one string', () => {
        assert.deepEqual(utils.arrayOfString(["foobar"]), ["foobar"]);
    });
    test('string', () => {
        assert.deepEqual(utils.arrayOfString("foobar"), ["foobar"]);
    });

    test('array with a string and null', () => {
      assert.deepEqual(utils.arrayOfString(["foobar", null]), ["foobar"]);
    });
    test('array with a string and an array with null', () => {
      assert.deepEqual(utils.arrayOfString(["foobar", [null]]), ["foobar"]);
    });

    test('empty string', () => {
        assert.equal(utils.arrayOfString(""), undefined);
    });
    test('null', () => {
        assert.equal(utils.arrayOfString(null), undefined);
    });
    test('a number', () => {
        assert.equal(utils.arrayOfString(0), undefined);
    });
    test('a boolean', () => {
        assert.equal(utils.arrayOfString(true), undefined);
    });

    test('array containing an empty string', () => {
        assert.equal(utils.arrayOfString([""]), undefined);
    });
    test('array containing null ', () => {
        assert.equal(utils.arrayOfString([null]), undefined);
    });
    test('array containing a number ', () => {
        assert.equal(utils.arrayOfString([0]), undefined);
    });
    test('array containing a boolean ', () => {
        assert.equal(utils.arrayOfString([true]), undefined);
    });
});

suite('toBoolean', () => {
  test('a boolean', () => {
      assert.equal(utils.toBoolean(true), true);
  });
  test('a boolean', () => {
    assert.equal(utils.toBoolean(false), false);
  });
  test('a string', () => {
      assert.equal(utils.toBoolean("true"), true);
  });
  test('a string', () => {
      assert.equal(utils.toBoolean("1"), true);
  });
  test('a string', () => {
    assert.equal(utils.toBoolean("false"), false);
  });
  test('a string', () => {
    assert.equal(utils.toBoolean("0"), false);
  });
  test('an invalid string', () => {
      assert.equal(utils.toBoolean("foobar"), undefined);
  });
  test('a number', () => {
      assert.equal(utils.toBoolean(1), true);
  });
  test('a number', () => {
      assert.equal(utils.toBoolean(0), false);
  });
  test('a number', () => {
    assert.equal(utils.toBoolean(10), undefined);
  });

  test('an array', () => {
    assert.equal(utils.toBoolean([10]), undefined);
  });
  test('a null', () => {
    assert.equal(utils.toBoolean(null), undefined);
  });

});

});