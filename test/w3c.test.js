import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import * as w3c from '../lib/w3c.js';

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
    suite('simple group', () => {
      for (let index = 0; index < GRPS.length; index++) {
        test(`${GRPS[index]}`, () => {
            assert.equal(w3c.safeGroupID(GRPS[index]), GRPS[index]);
        });
      }
    });
    test('a simple string number', () => {
        assert.equal(w3c.safeGroupID("45745"), 45745);
    });
    test('a simple number', () => {
        assert.equal(w3c.safeGroupID(45745), 45745);
    });
    test('a number which is not an integer', () => {
        assert.equal(w3c.safeGroupID(457.45), undefined);
    });

    test('a string "0"', () => {
        assert.equal(w3c.safeGroupID("0"), undefined);
    });
    test('a number 0', () => {
        assert.equal(w3c.safeGroupID(0), undefined);
    });
    test('a string "100000000000000000"', () => {
        assert.equal(w3c.safeGroupID("100000000000000000"), undefined);
    });
    test('a number 100000000000000000', () => {
        assert.equal(w3c.safeGroupID(100000000000000000), undefined);
    });
    test('a boolean', () => {
        assert.equal(w3c.safeGroupID(true), undefined);
    });
    test('an array', () => {
        assert.equal(w3c.safeGroupID([346456]), undefined);
    });
    test('null', () => {
        assert.equal(w3c.safeGroupID(null), undefined);
    });
});

});

suite('safeW3CJSON', () => {

    test('group should be an array', () => {
        const input = `{ "group": "other/tag" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), { "group": ["other/tag"] });
    });
    test('group accepts unknown group type', () => {
        const input = `{ "group": "supreme/tag" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), { "group": ["supreme/tag"] });
    });
    test('invalid group', () => {
        const input = `{ "group": [ "credentials" ] }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });
    test('invalid boolean group', () => {
        const input = `{ "group": true }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });
    test('invalid null group', () => {
        const input = `{ "group": null }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });

    test('contacts', () => {
        const input = `{ "contacts": [ "user1", "user2" ] }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"contacts":["user1","user2"]});
    });
    test('one contact', () => {
        const input = `{ "contacts": "user1" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"contacts":["user1"]});
    });
    test('one null contact', () => {
        const input = `{ "contacts": null }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });
    test('shortnames', () => {
        const input = `{ "shortname": [ "short", "old_short" ] }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"shortname":["short","old_short"]});
    });
    test('one shortname', () => {
        const input = `{ "shortname": "short" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"shortname":["short"]});
    });
    test('repo-types', () => {
        const input = `{ "repo-type": [ "cg-report", "homepage" ] }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"repo-type":["cg-report","homepage"]});
    });
    test('one repo-type', () => {
        const input = `{ "repo-type": "cg-report" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"repo-type":["cg-report"]});
    });

    test('policy may be open', () => {
        const input = `{ "policy": "open" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), { "policy": "open" });
    });
    test('policy may be restricted', () => {
        const input = `{ "policy": "restricted" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), { "policy": "restricted" });
    });
    test('policy may be unknown', () => {
        const input = `{ "policy": "unknown" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });
    test('policy may be null', () => {
        const input = `{ "policy": null }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });

    test('unknown properties are untouched', () => {
        const input = `{ "unknown": "citizenship-vocab" }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {"unknown": "citizenship-vocab"});
    });
    test('invalid JSON', () => {
        const input = `{ "unknown": "citizenship-vocab", }`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });
    test('simple group', () => {
        const input = `{
         "group": [ "wg/timed-text" ],
         "contacts": [ "user1", "user2" ],
         "unknown": "citizenship-vocab",
         "repo-type": [ "cg-report", "homepage" ]
        }`;
        assert.deepEqual(w3c.safeW3CJSON(input), {
            "group": [ "wg/timed-text" ],
            "contacts": [ "user1", "user2" ],
            "unknown": "citizenship-vocab",
            "repo-type": [ "cg-report", "homepage" ]
        });
    });

});