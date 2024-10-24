import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import * as w3c from '../../lib/w3c.js';

suite('lib/w3c', () => {


suite('safeGroupID', () => {

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
        assert.equal(w3c.safeGroupID(GRPS[index]), GRPS[index]);
      }
    });
    test('numbers', () => {
        assert.equal(w3c.safeGroupID("45745"), 45745,
          'a simple string number');
        assert.equal(w3c.safeGroupID(45745), 45745,
          'a simple number');
    });
    test("undefined", () => {
        assert.equal(w3c.safeGroupID(457.45), undefined,
          'a number which is not an integer');
        assert.equal(w3c.safeGroupID("0"), undefined,
          'a string "0"');
        assert.equal(w3c.safeGroupID(0), undefined,
          'a number 0');
        assert.equal(w3c.safeGroupID("-1"), undefined,
          'a negative string number');
        assert.equal(w3c.safeGroupID(-1), undefined,
          'a negative number');
        assert.equal(w3c.safeGroupID("100000000000000000"), undefined,
          'a string "100000000000000000"');
        assert.equal(w3c.safeGroupID(100000000000000000), undefined,
          'a number 100000000000000000');
        assert.equal(w3c.safeGroupID(true), undefined,
          'a boolean');
        assert.equal(w3c.safeGroupID([346456]), undefined,
          'an array');
        assert.equal(w3c.safeGroupID(null), undefined,
          'null');
    });
});

});

suite('safeW3CJSON', () => {

    test('simple group', () => {
        const input = `{
         "group": [ "wg/timed-text" ],
         "contacts": [ "user1", "user2" ],
         "unknown": "citizenship-vocab",
         "repo-type": [ "cg-report", "homepage" ]
        }`;
        assert.deepEqual(w3c.safeW3CJSON(input), JSON.parse(input));
    });
    test('group', () => {
        let input = `{ "group": "other/tag" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), { "group": ["other/tag"] },
          'group should be an array');
        input = `{ "group": "supreme/tag" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), { "group": ["supreme/tag"] },
          'group accepts unknown group type');
    });

    test('contacts', () => {
        let input = `{ "contacts": [ "user1", "user2" ] }`;
        assert.deepEqual(w3c.safeW3CJSON(input), JSON.parse(input));
        input = `{ "contacts": "user1" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"contacts":["user1"]},
          'one contact');
    });
    test('shortname', () => {
        let input = `{ "shortname": [ "short", "old_short" ] }`;
        assert.deepEqual(w3c.safeW3CJSON(input), JSON.parse(input));
        input = `{ "shortname": "short" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"shortname":["short"]},
          'one shortname');
    });
    test('repo-type', () => {
        let input = `{ "repo-type": [ "cg-report", "homepage" ] }`;
        assert.deepEqual(w3c.safeW3CJSON(input), JSON.parse(input));
        input = `{ "repo-type": "cg-report" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"repo-type":["cg-report"]},
          'one repo-type');
    });

    test('policy', () => {
        let input = `{ "policy": "open" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), JSON.parse(input),
          'policy may be open');
        input = `{ "policy": "restricted" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), JSON.parse(input),
          'policy may be restricted');
    });

    test('unknown properties are untouched', () => {
        const input = `{ "unknown": "citizenship-vocab" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), JSON.parse(input));
    });
    test('undefined', () => {
        let input = `{ "group": [ "credentials" ] }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined,
          'invalid group');
        input = `{ "group": true }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined,
          'invalid boolean group');
        input = `{ "group": null }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined,
          'invalid null group');
        input = `{ "contacts": null }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined,
          'one null contact');
        input = `{ "policy": "unknown" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined,
          'policy may be unknown');
        input = `{ "policy": null }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined,
          'policy may be null');
        input = `{ "unknown": "citizenship-vocab", }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined,
          'invalid JSON');
    });

});