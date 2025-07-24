import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import * as utils from '../../lib/utils.js';

suite('lib/utils', () => {

suite('fetchJSON', () => {
  test('group exists', async () => {
    const f1 = await utils.fetchJSON("https://api.w3.org/groups/other/tag");
    assert.deepEqual(f1.id, 34270);
  });
  test('group does not exist', () => {
    assert.rejects(utils.fetchJSON("https://api.w3.org/groups/other/unknown"));
  });
  test('not even JSON', () => {
    assert.rejects(utils.fetchJSON("https://www.w3.org/"));
  });
});

suite('iterateHAL', () => {
  test('service exists', async () => {
    let gh = {};
    for await (const s of utils.iterateHAL("services", "https://api.w3.org/groups/other/tag/services")) {
      if (s.title.indexOf('Version Control') != -1) {
        gh = s;
        break;
      }
    }
    assert.equal(gh.href, 'https://api.w3.org/services/43860');
  });
});

}); // suite lib/utils