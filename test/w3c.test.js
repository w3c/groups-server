import { strict as assert } from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as w3c from '../lib/w3c.js';

describe('lib/w3c', () => {


describe('safeGroupID', () => {

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
    describe('simple group', () => {
      for (let index = 0; index < GRPS.length; index++) {
        it(`${GRPS[index]}`, () => {
            assert.equal(w3c.safeGroupID(GRPS[index]), GRPS[index]);
        });
      }
    });
    it('a simple string number', () => {
        assert.equal(w3c.safeGroupID("45745"), 45745);
    });
    it('a simple number', () => {
        assert.equal(w3c.safeGroupID(45745), 45745);
    });

    it('a "0"', () => {
        assert.equal(w3c.safeGroupID("0"), undefined);
    });
    it('a 0', () => {
        assert.equal(w3c.safeGroupID(0), undefined);
    });
    it('a "100000000000000000"', () => {
        assert.equal(w3c.safeGroupID("100000000000000000"), undefined);
    });
    it('a 100000000000000000', () => {
        assert.equal(w3c.safeGroupID(100000000000000000), undefined);
    });
    it('a boolean', () => {
        assert.equal(w3c.safeGroupID(true), undefined);
    });
    it('an array', () => {
        assert.equal(w3c.safeGroupID([346456]), undefined);
    });
    it('null', () => {
        assert.equal(w3c.safeGroupID(null), undefined);
    });
});

});

describe('safeW3CJSON', () => {

    it('invalid group', () => {
        const input = `{
  "group": [
    "credentials"
  ]
}`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });

    it('contacts', () => {
        const input = `{
  "contacts": [
    "msporny", "dlongley", "OR13"
  ]
}`;
        assert.deepEqual(w3c.safeW3CJSON(input), {
                "contacts": [
                  "msporny", "dlongley", "OR13"
                ]
              });
    });
    it('repo-type should be an array', () => {
        const input = `{
  "repo-type": "cg-report"
}`;
        assert.deepEqual(w3c.safeW3CJSON(input), {
          "repo-type": [ "cg-report" ]
        });
    });
    describe('unknown is untouched', () => {
        const input = `{
  "unknown": "citizenship-vocab"
}`;
        assert.deepEqual(w3c.safeW3CJSON(input), {
            "unknown": "citizenship-vocab"
        });
    });
    describe('invalid JSON', () => {
        const input = `{
  "unknown": "citizenship-vocab"
  ,
}`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });
    it('simple group', () => {
        const input = `{
  "group": [
    "wg/timed-text"
  ],
  "contacts": [
    "msporny", "dlongley", "OR13"
  ],
  "unknown": "citizenship-vocab",
  "repo-type": [ "cg-report", "homepage" ]
}`;
        assert.deepEqual(w3c.safeW3CJSON(input), {
            "group": [
                    "wg/timed-text"
            ],
            "contacts": [
                  "msporny", "dlongley", "OR13"
            ],
            "unknown": "citizenship-vocab",
            "repo-type": [ "cg-report", "homepage" ]
        });
    });
    describe('invalid boolean group', () => {
        const input = `{
  "group": true
}`;
        assert.deepEqual(w3c.safeW3CJSON(input), undefined);
    });

});