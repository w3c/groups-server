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
        assert.equal(w3c.safeW3CJSON(input), undefined,
          'invalid group');
        input = `{ "group": true }`;
        assert.equal(w3c.safeW3CJSON(input), undefined,
          'invalid boolean group');
        input = `{ "group": null }`;
        assert.equal(w3c.safeW3CJSON(input), undefined,
          'invalid null group');
        input = `{ "contacts": null }`;
        assert.equal(w3c.safeW3CJSON(input), undefined,
          'one null contact');
        input = `{ "policy": "unknown" }`;
        assert.equal(w3c.safeW3CJSON(input), undefined,
          'policy may be unknown');
        input = `{ "policy": null }`;
        assert.equal(w3c.safeW3CJSON(input), undefined,
          'policy may be null');
        input = `{ "unknown": "citizenship-vocab", }`;
        assert.equal(w3c.safeW3CJSON(input), undefined,
          'invalid JSON');
    });

});

suite('group', () => {

  // shortcut to check object properties, without deepEqual
  function check(grp, props) {
    test(`properties for ${grp}`, async () => {
      grp = await w3c.group(grp);
      for (const [prop, value] of Object.entries(props))
        assert.equal(grp[prop], value, prop);
    });  
  }

  test('api.w3.org works', async () => {
    // f1 and f2 are both the TAG group
    const f1 = await w3c.group("other/tag");
    const f2 = await w3c.group("34270");
    assert.deepEqual(f1, f2);
  });
  check("other/tag", {
    id: 34270,
    name: "Technical Architecture Group",
    is_closed: false,
    "group-type": "other",
    shortname: "tag",
    "tr-publisher": true,
    identifier: "other/tag"
  });
  check("other/ac", {
    is_closed: false,
    "group-type": "other",
    shortname: "ac",
    "tr-publisher": false,
    identifier: "other/ac"
  });
  check("wg/webperf", {
    is_closed: false,
    "group-type": "wg",
    shortname: "webperf",
    "tr-publisher": true,
    identifier: "wg/webperf"
  });
  check(157284, {
    id: 157284,
    name: "Document Object Model Interest Group",
    is_closed: true,
    "group-type": "ig",
    shortname: "dom",
    "tr-publisher": true,
    identifier: "ig/dom"
  });
  check(80485, {
    id: 80485,
    name: "Web Platform Incubator Community Group",
    is_closed: false,
    "group-type": "cg",
    shortname: "wicg",
    "tr-publisher": false,
    identifier: "cg/wicg"
  });
  check(144308, {
    id: 144308,
    name: "Privacy Principles Task Force",
    is_closed: false,
    "group-type": "tf",
    shortname: "tag-privacy",
    "tr-publisher": false,
    identifier: "tf/tag-privacy"
  });
  check(54505, {
    id: 54505,
    is_closed: true,
    "group-type": "bg",
    shortname: "websignage",
    "tr-publisher": false,
    identifier: "bg/websignage"
  });
  test('ab-w3m (34730) is not exposed by api.w3.org', async () => {
    const f = await w3c.group(34730);
    assert.equal(f, undefined);
  });
  // old coordination groups are still exposed
  check(35676, {
    id: 35676,
    is_closed: true,
    "group-type": "coord",
    shortname: "xml",
    "tr-publisher": true,
    identifier: "coord/xml"
  });
  check(44811, {
    id: 44811,
    is_closed: true,
    "group-type": "xg",
    shortname: "audio",
    "tr-publisher": false,
    identifier: "xg/audio"
  });
  test('foobar is not a group', async () => {
    const f = await w3c.group("foobar");
    assert.equal(f, undefined);
  });
});

suite('listGroups', () => {
  test('a group exists', async () => {
    let grp = {};
    for await (const s of (w3c.listGroups())) {
      grp = s;
      break;
    }
    assert.equal(grp.is_closed, false);
  });
});

suite('listGroupServices', () => {
  test('a service exists', async () => {
    let gh;
    for await (const s of (w3c.listGroupServices("other/tag"))) {
      if (s.type === 'repository') {
        gh = s;
        break;
      }
    }
    assert.equal(gh.link, 'https://github.com/w3ctag');
  });
});


}); // suite lib/w3c
