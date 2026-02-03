import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import { json } from '../../lib/fetch.js';

suite('lib/utils', () => {
  
  suite('json', () => {
    test('group exists', async () => {
      const f1 = await json("https://api.w3.org/groups/other/tag");
      assert.deepEqual(f1.id, 34270);
    });
    test('group does not exist', () => {
      assert.rejects(json("https://api.w3.org/groups/other/unknown"));
    });
    test('not even JSON', () => {
      assert.rejects(json("https://www.w3.org/"));
    });
  });
  
}); // suite lib/fetch