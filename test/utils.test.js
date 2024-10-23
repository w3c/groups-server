import { strict as assert } from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as utils from '../lib/utils.js';

describe('lib/utils', () => {

describe('arrayOfString', () => {
    it('should work with array with one string', () => {
        assert.deepEqual(utils.arrayOfString(["foobar"]), ["foobar"]);
    });
    it('should work with string', () => {
        assert.deepEqual(utils.arrayOfString("foobar"), ["foobar"]);
    });

    it('should work with array with a string and null', () => {
      assert.deepEqual(utils.arrayOfString(["foobar", null]), ["foobar"]);
    });

    it('should work with empty string', () => {
        assert.equal(utils.arrayOfString(""), undefined);
    });
    it('should work with null', () => {
        assert.equal(utils.arrayOfString(null), undefined);
    });
    it('should work with a number', () => {
        assert.equal(utils.arrayOfString(0), undefined);
    });
    it('should work with a boolean', () => {
        assert.equal(utils.arrayOfString(true), undefined);
    });

    it('should work with array containing an empty string', () => {
        assert.equal(utils.arrayOfString([""]), undefined);
    });
    it('should work with array containing null ', () => {
        assert.equal(utils.arrayOfString([null]), undefined);
    });
    it('should work with array containing a number ', () => {
        assert.equal(utils.arrayOfString([0]), undefined);
    });
    it('should work with array containing a boolean ', () => {
        assert.equal(utils.arrayOfString([true]), undefined);
    });
});

describe('toBoolean', () => {
  it('should work with a boolean', () => {
      assert.deepEqual(utils.toBoolean(true), true);
  });
  it('should work with a boolean', () => {
    assert.deepEqual(utils.toBoolean(false), false);
  });
  it('should work with a string', () => {
      assert.deepEqual(utils.toBoolean("true"), true);
  });
  it('should work with a string', () => {
      assert.deepEqual(utils.toBoolean("1"), true);
  });
  it('should work with a string', () => {
    assert.deepEqual(utils.toBoolean("false"), false);
  });
  it('should work with a string', () => {
    assert.deepEqual(utils.toBoolean("0"), false);
  });
  it('should work with an invalid string', () => {
      assert.deepEqual(utils.toBoolean("foobar"), undefined);
  });
  it('should work with a number', () => {
      assert.deepEqual(utils.toBoolean(1), true);
  });
  it('should work with a number', () => {
      assert.deepEqual(utils.toBoolean(0), false);
  });
  it('should work with a number', () => {
    assert.deepEqual(utils.toBoolean(10), undefined);
  });

  it('should work with an array', () => {
    assert.deepEqual(utils.toBoolean([10]), undefined);
  });
  it('should work with a null', () => {
    assert.deepEqual(utils.toBoolean(null), undefined);
  });

});

});