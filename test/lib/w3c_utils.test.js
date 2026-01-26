import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import * as wutils from '../../lib/w3c_utils.js';

suite('lib/w3c_utils', () => {

suite('arrayOfString', () => {
    test("arrays", () => {
      assert.deepEqual(wutils.arrayOfString(["foobar"]), ["foobar"],
          'array with one string');
      assert.deepEqual(wutils.arrayOfString(["foobar", null]), ["foobar"],
        'array with a string and null');
      assert.deepEqual(wutils.arrayOfString(["foobar", [null]]), ["foobar"],
        'array with a string and an array with null');
    });
    test('strings', () => {
        assert.deepEqual(wutils.arrayOfString("foobar"), ["foobar"]);
    });

    test('undefined', () => {
        assert.equal(wutils.arrayOfString(""), undefined,
          'empty string');
        assert.equal(wutils.arrayOfString(null), undefined, 'null');
        assert.equal(wutils.arrayOfString(0), undefined, 'a number');
        assert.equal(wutils.arrayOfString(true), undefined, 'a boolean');
        assert.equal(wutils.arrayOfString([""]), undefined,
          'array containing an empty string');
        assert.equal(wutils.arrayOfString([null]), undefined,
          'array containing null');
        assert.equal(wutils.arrayOfString([0]), undefined, 'array containing a number');
        assert.equal(wutils.arrayOfString([true]), undefined, 'array containing a boolean');
    });
});

suite('toBoolean', () => {
  test("true", () => {
    assert.equal(wutils.toBoolean(true), true, 'a boolean');
    assert.equal(wutils.toBoolean("true"), true, 'a string true');
    assert.equal(wutils.toBoolean("1"), true, 'a string 1');
    assert.equal(wutils.toBoolean(1), true, 'a number');
  });
  test('false', () => {
    assert.equal(wutils.toBoolean(false), false, 'a boolean');
    assert.equal(wutils.toBoolean("false"), false, 'a string false');
    assert.equal(wutils.toBoolean("0"), false, 'a string 0');
    assert.equal(wutils.toBoolean(0), false, 'a number');
  });
  test('undefined', () => {
    assert.equal(wutils.toBoolean("foobar"), undefined, 'an invalid string');
    assert.equal(wutils.toBoolean(10), undefined, 'a number');
    assert.equal(wutils.toBoolean([10]), undefined, 'an array');
    assert.equal(wutils.toBoolean(null), undefined, 'a null');
  });

});

suite('groupIdentifier', () => {

  const GRPS = [
      "tf/i18n-sealreq",
      "wg/sdw",
      "cg/sport-schema",
      "cg/sustainability",
      "cg/sync-media-pub",
      "other/tag",
      "tf/i18n-tlreq",
      "wg/timed-text",
      "tf/transportation-ont-cc",
      "tf/vision",
      "tf/personalization-tf",
      "ig/wai",
      "tf/wcag2x-backlog",
      "tf/wcag2ict",
      "ig/web-networks"
  ]
  test('strings', () => {
    for (let index = 0; index < GRPS.length; index++) {
      assert.equal(wutils.groupIdentifier(GRPS[index]), GRPS[index]);
    }
  });
  test('numbers', () => {
      assert.equal(wutils.groupIdentifier("45745"), 45745,
        'a simple string number');
      assert.equal(wutils.groupIdentifier(45745), 45745,
        'a simple number');
  });
  test("undefined", () => {
      assert.equal(wutils.groupIdentifier(457.45), undefined,
        'a number which is not an integer');
      assert.equal(wutils.groupIdentifier("0"), undefined,
        'a string "0"');
      assert.equal(wutils.groupIdentifier(0), undefined,
        'a number 0');
      assert.equal(wutils.groupIdentifier("-1"), undefined,
        'a negative string number');
      assert.equal(wutils.groupIdentifier(-1), undefined,
        'a negative number');
      assert.equal(wutils.groupIdentifier("100000000000000000"), undefined,
        'a string "100000000000000000"');
      assert.equal(wutils.groupIdentifier(100000000000000000), undefined,
        'a number 100000000000000000');
      assert.equal(wutils.groupIdentifier(true), undefined,
        'a boolean');
      assert.equal(wutils.groupIdentifier([346456]), undefined,
        'an array');
      assert.equal(wutils.groupIdentifier(null), undefined,
        'null');
  });
});

suite('w3cJSON', () => {

  test('simple group', () => {
      const input = `{
       "group": [ "wg/timed-text" ],
       "contacts": [ "user1", "user2" ],
       "unknown": "citizenship-vocab",
       "repo-type": [ "cg-report", "homepage" ]
      }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input));
  });
  test('group', () => {
      let input = `{ "group": "other/tag" }`;
      assert.deepEqual(wutils.w3cJSON(input), { "group": ["other/tag"] },
        'group should be an array');
      input = `{ "group": [ "other/tag", "other/tag" ] }`;
      assert.deepEqual(wutils.w3cJSON(input), { "group": ["other/tag"] },
        'group should be unique');
      input = `{ "group": "supreme/tag" }`;
      assert.deepEqual(wutils.w3cJSON(input), { "group": ["supreme/tag"] },
        'group accepts unknown group type');
  });

  test('contacts', () => {
      let input = `{ "contacts": [ "user1", "user2" ] }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input));
      input = `{ "contacts": [ "user1", "user1" ] }`;
      assert.deepEqual(wutils.w3cJSON(input), { "contacts": [ "user1" ] },
        "contacts should be unique");
      input = `{ "contacts": "user1" }`;
      assert.deepEqual(wutils.w3cJSON(input), {"contacts":["user1"]},
        'one contact');
  });
  test('shortname', () => {
      let input = `{ "shortname": [ "short", "old_short" ] }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input));
      input = `{ "shortname": [ "short", "short" ] }`;
      assert.deepEqual(wutils.w3cJSON(input), { "shortname": [ "short" ] },
        'shortname should be unique');
      input = `{ "shortname": "short" }`;
      assert.deepEqual(wutils.w3cJSON(input), {"shortname":["short"]},
        'one shortname');
  });
  test('repo-type', () => {
      let input = `{ "repo-type": [ "cg-report", "homepage" ] }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input));
      input = `{ "repo-type": [ "homepage", "homepage" ] }`;
      assert.deepEqual(wutils.w3cJSON(input), { "repo-type": [ "homepage" ] },
        'repo-type should be unique');
      input = `{ "repo-type": "cg-report" }`;
      assert.deepEqual(wutils.w3cJSON(input), {"repo-type":["cg-report"]},
        'one repo-type');
  });

  test('policy', () => {
      let input = `{ "policy": "open" }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input),
        'policy may be open');
      input = `{ "policy": "restricted" }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input),
        'policy may be restricted');
  });

  test('exposed', () => {
      let input = `{ "exposed": true }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input),
        'exposed may be true');
      assert.deepEqual(wutils.w3cJSON(`{ "exposed": "1" }`), JSON.parse(input),
        'exposed may be true, with string "1"');
      assert.deepEqual(wutils.w3cJSON(`{ "exposed": "true" }`), JSON.parse(input),
        'exposed may be true, with string "true"');
      input = `{ "exposed": false }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input),
        'exposed may be false');
      assert.deepEqual(wutils.w3cJSON(`{ "exposed": "0" }`), JSON.parse(input),
        'exposed may be false, with string "0"');
      assert.deepEqual(wutils.w3cJSON(`{ "exposed": "false" }`), JSON.parse(input),
        'exposed may be false, with string "false"');
      assert.deepEqual(wutils.w3cJSON(`{ "policy": "open", "exposed": "echo" }`), JSON.parse(`{ "policy": "open" }`),
        'exposed is ignored if not a boolean-like value');
  });

  test('unknown properties are untouched', () => {
      const input = `{ "unknown": "citizenship-vocab" }`;
      assert.deepEqual(wutils.w3cJSON(input), JSON.parse(input));
  });
  test('undefined', () => {
      let input = `{ "group": [ "credentials" ] }`;
      assert.equal(wutils.w3cJSON(input), undefined,
        'invalid group');
      input = `{ "group": true }`;
      assert.equal(wutils.w3cJSON(input), undefined,
        'invalid boolean group');
      input = `{ "group": null }`;
      assert.equal(wutils.w3cJSON(input), undefined,
        'invalid null group');
      input = `{ "contacts": null }`;
      assert.equal(wutils.w3cJSON(input), undefined,
        'one null contact');
      input = `{ "policy": "unknown" }`;
      assert.equal(wutils.w3cJSON(input), undefined,
        'policy may be unknown');
      input = `{ "policy": null }`;
      assert.equal(wutils.w3cJSON(input), undefined,
        'policy may be null');
      input = `{ "unknown": "citizenship-vocab", }`;
      assert.equal(wutils.w3cJSON(input), undefined,
        'invalid JSON');
      assert.equal(wutils.w3cJSON(null), undefined,
        'invalid JSON');
      assert.equal(wutils.w3cJSON(undefined), undefined,
        'invalid JSON');
  });

});


}); // suite lib/utils