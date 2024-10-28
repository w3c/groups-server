import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import * as w3c from '../../lib/w3c.js';

suite('lib/w3c', () => {

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
      if (s.title === 'Version Control') {
        gh = s;
        break;
      }
    }
    assert.equal(gh.href, 'https://api.w3.org/services/43860');
  });
});

}); // suite lib/w3c
