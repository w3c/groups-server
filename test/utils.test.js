import { strict as assert } from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as utils from '../lib/utils.js';

describe('lib/utils', () => {

describe('arrayOfString', () => {
    it('array with one string', () => {
        assert.deepEqual(utils.arrayOfString(["foobar"]), ["foobar"]);
    });
    it('string', () => {
        assert.deepEqual(utils.arrayOfString("foobar"), ["foobar"]);
    });

    it('array with a string and null', () => {
      assert.deepEqual(utils.arrayOfString(["foobar", null]), ["foobar"]);
    });
    it('array with a string and an array with null', () => {
      assert.deepEqual(utils.arrayOfString(["foobar", [null]]), ["foobar"]);
    });

    it('empty string', () => {
        assert.equal(utils.arrayOfString(""), undefined);
    });
    it('null', () => {
        assert.equal(utils.arrayOfString(null), undefined);
    });
    it('a number', () => {
        assert.equal(utils.arrayOfString(0), undefined);
    });
    it('a boolean', () => {
        assert.equal(utils.arrayOfString(true), undefined);
    });

    it('array containing an empty string', () => {
        assert.equal(utils.arrayOfString([""]), undefined);
    });
    it('array containing null ', () => {
        assert.equal(utils.arrayOfString([null]), undefined);
    });
    it('array containing a number ', () => {
        assert.equal(utils.arrayOfString([0]), undefined);
    });
    it('array containing a boolean ', () => {
        assert.equal(utils.arrayOfString([true]), undefined);
    });
});

describe('toBoolean', () => {
  it('a boolean', () => {
      assert.equal(utils.toBoolean(true), true);
  });
  it('a boolean', () => {
    assert.equal(utils.toBoolean(false), false);
  });
  it('a string', () => {
      assert.equal(utils.toBoolean("true"), true);
  });
  it('a string', () => {
      assert.equal(utils.toBoolean("1"), true);
  });
  it('a string', () => {
    assert.equal(utils.toBoolean("false"), false);
  });
  it('a string', () => {
    assert.equal(utils.toBoolean("0"), false);
  });
  it('an invalid string', () => {
      assert.equal(utils.toBoolean("foobar"), undefined);
  });
  it('a number', () => {
      assert.equal(utils.toBoolean(1), true);
  });
  it('a number', () => {
      assert.equal(utils.toBoolean(0), false);
  });
  it('a number', () => {
    assert.equal(utils.toBoolean(10), undefined);
  });

  it('an array', () => {
    assert.equal(utils.toBoolean([10]), undefined);
  });
  it('a null', () => {
    assert.equal(utils.toBoolean(null), undefined);
  });

});

});