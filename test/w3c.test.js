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
        it(`should work with ${GRPS[index]}`, () => {
            assert.deepEqual(w3c.safeGroupID(GRPS[index]), GRPS[index]);
        });
      }
    });
    it('should work with a simple string number', () => {
        assert.deepEqual(w3c.safeGroupID("45745"), 45745);
    });
    it('should work with a simple number', () => {
        assert.deepEqual(w3c.safeGroupID(45745), 45745);
    });

    it('should work with a "0"', () => {
        assert.deepEqual(w3c.safeGroupID("0"), undefined);
    });
    it('should work with a 0', () => {
        assert.deepEqual(w3c.safeGroupID(0), undefined);
    });
    it('should work with a "100000000000000000"', () => {
        assert.deepEqual(w3c.safeGroupID("100000000000000000"), undefined);
    });
    it('should work with a 100000000000000000', () => {
        assert.deepEqual(w3c.safeGroupID(100000000000000000), undefined);
    });
    it('should work with a boolean', () => {
        assert.deepEqual(w3c.safeGroupID(true), undefined);
    });
    it('should work with an array', () => {
        assert.deepEqual(w3c.safeGroupID([346456]), undefined);
    });
    it('should work with null', () => {
        assert.deepEqual(w3c.safeGroupID(null), undefined);
    });
});

});