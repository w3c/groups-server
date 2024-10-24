"use strict";
import config from "./config.js";
import * as monitor from './monitor.js';
import { arrayOfString, toBoolean, fetchJSON } from './utils.js';

/**
 * Sanitize a Group ID
 *
 * @param {any} id the group ID as written in w3c.json
 * @returns {string | number | undefined} the group ID as a string or a number
 */
export
function safeGroupID(id) {
  if (typeof id === "string") {
    if (id.match(/^[a-z]{2,10}\/[\w-]{2,255}$/i)) { // eg "wg/webperf", "other/tag"
      return id;
    }
    if (id.match(/^\d{1,10}$/)) {  // eg "34563"
      id = Number.parseInt(id);
      if (id > 1 && id < 10000000) {
        return id;
      }
    }
    // else return undefined
  } else if (typeof id === "number"
    && Number.isInteger(id)
    && id > 1 && id < 10000000) {
    return id;
  } // else
  return undefined;
}

/**
* Sanitize a w3c.json file based on https://w3c.github.io/w3c.json.html
* It will omit any entry which is not considered valid
*
* @param {string} text the string containing the w3c.json file
* @returns {object | undefined} a clean w3c.json object or undefined
*/
export
function safeW3CJSON(text) {
  /** @type {object} the resulting W3C JSON object */
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    // we give up if it's not even JSON
    return undefined;
  };

  // group
  if (Array.isArray(obj.group)) {
    obj.group = obj.group.map(safeGroupID).filter(n => n !== undefined);
  } else if (obj.group) {
    obj.group = [safeGroupID(obj.group)].filter(n => n !== undefined);
  }
  if (obj.group && !obj.group.length) {
    // if it's empty, we clean up
    delete obj.group;
  }

  // contacts
  if (obj.contacts) {
    obj.contacts = arrayOfString(obj.contacts);
  }
  if (obj.contacts && !obj.contacts.length) {
    delete obj.contacts;
  }

  // repo-type
  if (obj["repo-type"]) {
    obj["repo-type"] = arrayOfString(obj["repo-type"]);
  }
  if (obj["repo-type"] && !obj["repo-type"].length) {
    delete obj["repo-type"];
  }

  // policy
  if (obj.policy !== undefined) {
    const policy = obj.policy;
    if (policy === "restricted") {
      obj.policy = "restricted";
    } else if (policy === "open") {
      obj.policy = "open";
    } else {
      delete obj.policy;
    }
  }

  // exposed
  if (obj.exposed !== undefined) {
    obj.exposed = toBoolean(obj.exposed);
    if (obj.exposed === undefined) {
      delete obj.exposed;
    }
  }

  // shortname
  if (obj.shortname !== undefined) {
    obj.shortname = arrayOfString(obj.shortname);
  }
  if (obj.shortname !== undefined && !obj.shortname.length) {
    delete obj.shortname;
  }

  // other properties are left as-is, for backward and forward compatibility

  // check that we have at least one property
  let entries = 0;
  for (const props of Object.entries(obj)) {
    entries++;
  }
  if (entries === 0) return undefined;

  return obj;
}

/**
 * Enhance a group object from the W3C API
 * @param {*} group 
 * @returns {object} the same object as the parameter group
 */
function decorateGroup(group) {
  // Add "identifier" a group identifier {string} representing "{type}/{shortname}"
  // Ensure "type" is always set
  switch (group.discr) {
    case "tf":
      group.identifier = `tf/${group.shortname}`;
      group.type = "task force";
      if (group.members && group.members.length) {
        group.members.forEach(group => decorateGroup(group));
      }
      break;
    case "w3cgroup":
      switch (group.type) {
        case "working group":
          group.identifer = `wg/${group.shortname}`;
          break;
        case "interest group":
          group.identifer = `wg/${group.shortname}`;
          break;
        case "community group":
          group.identifer = `wg/${group.shortname}`;
          break;
        case "business group":
          group.identifer = `wg/${group.shortname}`;
          break;
        default:
          monitor.warn(`Unrecognized group.type ${group.type}`);
          break;
      }
      break;
    default:
      monitor.warn(`Unrecognized group.discr ${group.discr}`);
  }
}

/**
 * Iterate through W3C API HAL pages, yelding the target property
 * @returns {Generator<object>} the target property object
 */
async function* iterateHAL(propertyTarget, link, objFct) {
  if (config.debug) monitor.log(`fetch ${link}`);
  while (true) {
    let apiURL = new URL(link);
    apiURL.searchParams.set("embed", "1"); // grab everything
    let data = await fetchJSON(apiURL);
    for (const target of data._embedded[propertyTarget]) {
      if (objFct) {
        yield objFct(target);
      } else {
        yield target;
      }
    }
    if (data.pages && data.pages > 1 && data.page < data.pages) {
      link = data._links.next.href;
    } else {
      return;
    }
  }
}

/**
 * Return the list of all W3C groups that are currently open
 * @returns {Generator<object>} The groups
 */
export
async function* listGroups() {
  return iterateHAL("groups", "https://api.w3.org/groups", decorateGroup);
}

/**
 * Returns services tied to a group
 * 
 * @param {number | string} identifier  a number(eg 100074) or a string (eg "wg/pm")
 * @returns {Generator<object>} Services associated with a group
 */
export
async function* listServices(identifier) {
  const safeIdentifier = safeGroupID(identifier);
  if (safeIdentifier === undefined) {
    if (config.debug) monitor.error(`invalid group identifier ${identifier}`);
    return;
  }
  return iterateHAL("services", `https://api.w3.org/groups/${safeIdentifier}/services`);
}

/**
 * Return the list of all W3C specifications
 * @returns {Generator<object>} The specifications
 */
export
async function* listSpecifications() {
  return iterateHAL("specifications", "https://api.w3.org/groups/specifications");
}

/**
 * Returns a W3C group
 *  
 * @param {number | string} identifier a number(eg 100074) or a string (eg "wg/pm")
 * @returns {object} A Group
 */
export
async function group(identifier) {
  const safeIdentifier = safeGroupID(identifier);
  if (safeIdentifier === undefined) {
    if (config.debug) {
      monitor.error(`invalid group identifier ${identifier}`);
    }
    return undefined;
  }

  let link = `https://api.w3.org/groups/${safeIdentifier}`;

  if (config.debug) monitor.log(`fetch ${link}`);

  let apiURL = new URL(link);
  apiURL.searchParams.set("embed", "1"); // grab everything
  // ignore errors
  return fetchJSON(apiURL)
    .then(group => decorateGroup(group))
    .catch(() => {
      if (config.debug) monitor.error(`Unknown group ${safeIdentifier}`);
      return undefined;
    });
}
