import github from "./lib/github.js";
import w3c from "./lib/w3c.js";
import * as publish from "./lib/publish.js";
import * as monitor from "./lib/monitor.js";
import config from "./lib/config.js";
import fetch from 'node-fetch';
import { sanitizeW3CJSON } from "./lib/utils.js";

/**
 * Get the groups from the W3C API, sort them based on names
 * Save the mapping between id and [category]/shortname
 * @returns {Array} the Groups
 */
async function w3cgroups() {
  let groups;
  function compare(g1, g2) {
    if (g1.name < g2.name) {
      return -1;
    }
    if (g1.name > g2.name) {
      return 1;
    }
    return 0;
  }
  if (config.debug) {
    groups = await publish.getData("w3c-groups.json");
  }
  if (!groups) {
    groups = [];
    for await (const group of w3c.listGroups()) {
      groups.push(group);
    }
  }
  return groups.sort(compare);
}

async function repositories() {
  let repos;
  function compare(r1, r2) {
    const c1 = r1.owner.login + '/' + r1.name;
    const c2 = r2.owner.login + '/' + r2.name;
    if (c1 < c2) {
      return -1;
    }
    if (c1 > c2) {
      return 1;
    }
    return 0;
  }
  if (config.debug) {
    repos = await publish.getData("all-repositories.json");
  }
  if (!repos) {
    repos = [];
    for (const owner of settings.owners) {
      if (config.debug) monitor.log(`loading repositories for owner ${owner.login}`)
      for await (const repo of github.listRepos(owner.login)) {
        if (!repo.isPrivate) { // do not save information about private repos
          delete repo.isPrivate; // all are public
          if (config.debug) monitor.log(`found ${repo.owner.login}/${repo.name}`)
          if (repo.w3cjson && repo.w3cjson.text) {
            repo.w3cjson = sanitizeW3CJSON(repo.w3cjson.text);
            if (!repo.w3cjson) {
              delete repo.w3cjson;
            }
          } else {
            if (owner.group.length) {
              if (!repo.w3cjson) repo.w3cjson = {};
              repo.w3cjson.group = owner.group;
            }
          }
          if (repo.homepageUrl === null) {
            delete repo.homepageUrl;
          }
          if (repo.description === null) {
            delete repo.description;
          }
          repos.push(repo);
        }
      }
    }
  }
  return repos.sort(compare);
}

// updated in init()
let settings = {
  refreshCycle: 3,
  owners:  [ { "login": "w3c", "group": [] } ]
};

async function cycle() {
  monitor.log("Starting a cycle");
  const start = new Date().toISOString();
  const groups = await w3cgroups();
  monitor.log(`loaded ${groups.length} groups`)
  const allrepos = await repositories();
  monitor.log(`loaded ${allrepos.length} repositories`)

  // publish.saveData("w3c-groups.json", groups);

  publish.saveData("all-repositories.json", allrepos);
  const identifiers = groups.map(g => { return {"id":g.id,"identifier":g.identifier};});
  publish.saveData("identifiers.json", identifiers);

  function isKnown(id) {
    return groups.filter(g => g.id === id).length > 0;
  }

  const group_repos = [];
  for (const repo of allrepos) {
    if (repo.w3cjson && repo.w3cjson.group) {
      let found = false;
      for (let index = 0; index < repo.w3cjson.group.length; index++) {
         if (isKnown(repo.w3cjson.group[index])) {
           found = true;
           break;
         };
      }
      if (found) {
        group_repos.push(repo);
      }
    }
  }
  if (group_repos.length > 0) {
    publish.saveData("repositories.json", group_repos);
  } else {
    monitor.error("No group repositories found");
  }

  function getRepos(id) {
    return allrepos.filter(r => r.w3cjson && r.w3cjson.group && r.w3cjson.group.includes(id));
  }
  const subgroups = {};
  for (const group of groups) {
    const repos = getRepos(group.id);
    let others = [];
    const other_ids = groups.filter(g => g.members && g.members.filter(m => m.id === group.id).length > 0);
    for (const other of other_ids) {
      others = others.concat(getRepos(other.id));
    }
    const category = group.identifier.split('/')[0];
    if (!subgroups[category]) subgroups[category] = [];
    subgroups[category].push(group);
    await publish.saveGroupRepositories(group, repos, others);
  }
  /*
  for (const entry of Object.entries(subgroups)) {
    await publish.saveData(`${entry[0]}/groups.json`, entry[1]);
  }
  */
  const end = new Date().toISOString();
  monitor.loopTimestamp({start, end});
  monitor.log("Cycle completed");
}

/**
 * Invoke one cycle remotely
 */
export
function nudge() {
  cycle.catch(err => {
    console.log(err);
    monitor.error(`refresh loop crashed - ${err}`);
  });
}


export
function init() {
  let doCycle = true;
  if (config.debug) {
    // abort
    monitor.warn(`refresh cycle not starting (debug mode)`);
    doCycle = false;
  }
  function loop() {
    fetch("https://w3c.github.io/groups/settings.json").then(res => res.json())
     .then(_settings => {
      // we make sure we're loading a clean set of settings
      if (_settings.refreshCycle >= 1 && _settings.refreshCycle <= 24) {
        settings.refreshCycle = _settings.refreshCycle;
      }
      if (Array.isArray(_settings.owners)) {
        const new_owners = [];
        for (const obj of _settings.owners) {
          if (obj.login && typeof obj.login === "string") {
            let group = [];
            let login = obj.login;
            if (obj.group && Array.isArray(obj.group)) {
              for (const g of obj.group) {
                if (Number.isSafeInteger(g) && g >= 1) {
                  group.push(g);
                }
              }
            }
            new_owners.push({login, group})
          }
        }
        settings.owners = new_owners;
      }
     }).catch(err => {
      console.log(err);
      monitor.error(`invalid settings.json - ${err}`);
     }).then(cycle).then(() => {
       setTimeout(loop, 1000 * 60 * 60 * settings.refreshCycle);
     }).catch(err => {
       console.log(err);
       monitor.error(`refresh loop crashed - ${err}`);
     });
  }
  loop();
}