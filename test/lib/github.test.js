import { strict as assert } from 'node:assert/strict';
import { suite, test } from 'node:test';
import gh from '../../lib/github.js';

suite('lib/github', () => {

  const testrepo = {
    owner: "w3c-fedid",
    name: "FedCM"
  };
  async function testrepos() {
    const repos = {
      getRepo: await gh.getRepo(`${testrepo.owner}/${testrepo.name}`)
    }
    for await (const r of (gh.listRepos(testrepo.owner))) {
      if (r.name === testrepo.name) {
        repos.listRepos = r;
        break;
      }
    }
    return repos;
  }

  suite('listRepos', () => {
    test(`${testrepo.owner}/${testrepo.name} is a listed repository`, async () => {
      const repos = await testrepos();
      assert.deepEqual(repos.listRepos.w3cjson["repo-type"], ["rec-track"]);
    });
  });

  suite('getRepo', () => {

    // shortcut to check object properties, without deepEqual
    function check(repoName, props) {
      test(`properties for ${repoName}`, async () => {
        const repo = await gh.getRepo(repoName);
        for (const [prop, value] of Object.entries(props))
          assert.deepEqual(repo[prop], value, prop);
      });
    }

    check('w3c/csswg-drafts', {
      "name": "csswg-drafts",
      "owner": {
        "login": "w3c"
      },
      "homepageUrl": "https://drafts.csswg.org/",
      "description": "CSS Working Group Editor Drafts",
      "isArchived": false,
      "isPrivate": false,
      "w3cjson": {
        "group": [
          "wg/css"
        ],
        "contacts": [
          "svgeesus"
        ],
        "repo-type": [
          "rec-track"
        ],
        "policy": "open",
        "exposed": true
      }
    });

    check('w3c/process', {
      "name": "process",
      "owner": {
        "login": "w3c"
      },
      "homepageUrl": "https://www.w3.org/policies/process/drafts/",
      "description": "W3C Process Document",
      "isArchived": false,
      "isPrivate": false,
      "w3cjson": {
        "group": [ "other/ab", "cg/w3process" ]
        , "contacts":   ["plehegar", "fantasai", "frivoal"]
        , "policy": "restricted"
        , "repo-type": [ "process" ]
        , "exposed": true
      }
    });

    test("listRepos and getRepo are consistent", async () => {
      const repos = await testrepos();
      assert.deepEqual(repos.getRepo, repos.listRepos);
    });

    test("isArchived and exposed properties for webauthn-pay", async () => {
      const repo = await gh.getRepo(`w3c/webauthn-pay`);
      assert.deepEqual(repo.isArchived, false, 'isArchived');
      assert.deepEqual(repo.w3cjson.exposed, false, 'exposed');
    });

    test("isPrivate and exposed properties for AB-private", async () => {
      const repo = await gh.getRepo(`w3c/AB-private`);
      assert.deepEqual(repo.isPrivate, true, 'isPrivate');
      assert.deepEqual(repo.w3cjson.exposed, true, 'exposed');
    });
  });

}); // suite lib/github
