"use strict";
import config from "./config.js";
import debuglog from "debug";
import { arrayOfString, toBoolean, fetchJSON, iterateHAL } from './utils.js';

const debug = debuglog('w3c');

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
  let newObject = {}; // the returned object
  try {
    text = JSON.parse(text);
  } catch {
    // we give up if it's not even JSON
    return undefined;
  };
  let isSet = false; // true if we set a property on newObject
  for (const [ prop, value ] of Object.entries(text)) {
    let holder;
    switch (prop) {
      case "group":
        if (Array.isArray(value)) {
          holder = value.map(safeGroupID).filter(n => n !== undefined);
        } else if (value) {
          holder = [safeGroupID(value)].filter(n => n !== undefined);
        }
        if (holder && holder.length) {
          newObject.group = holder;
          isSet = true;
        }
        break;
      case "contacts":
      case "repo-type":
      case "shortname":
        holder = arrayOfString(value);
        if (holder && holder.length) {
          newObject[prop] = holder;
          isSet = true;
        }
        break;
      case "policy":
        if (value === "restricted") {
          newObject.policy = "restricted";
          isSet = true;
        } else if (value === "open") {
          newObject.policy = "open";
          isSet = true;
        }
        break;
      case "exposed":
        holder = toBoolean(text.exposed);
        if (typeof holder === "boolean") {
          text.exposed = holder;
          isSet = true;
        }
        break;
      default:
        // other properties are left as-is, for backward and forward compatibility
        newObject[prop] = value;
        isSet = true;
      }
  }

  // check that we have at least one property before returning the object
  if (!isSet) return undefined;

  return newObject;
}

/**
 * Enhance a group object from the W3C API
 * @param {*} group 
 * @returns {object} the same object as the parameter group
 */
function decorateGroup(group) {
  // Add "identifier" a group identifier {string} representing "{type}/{shortname}"
  // Always set "group-type", "identifier", "tr-publisher"
  group['tr-publisher'] = false; // by default, groups can't publish in /TR
  switch (group.discr) {
    case "tf":
      group.identifier = `tf/${group.shortname}`;
      group["group-type"] = "tf";
      if (group.members && group.members.length) {
        group.members.forEach(group => decorateGroup(group));
      }
      break;
    case "w3cgroup":
      switch (group.type) {
        case "working group":
          group["group-type"] = "wg";
          group.identifier = `wg/${group.shortname}`;
          group['tr-publisher'] = true;
          break;
        case "interest group":
          group["group-type"] = "ig";
          group.identifier = `ig/${group.shortname}`;
          group['tr-publisher'] = true;
          break;
        case "community group":
          group["group-type"] = "cg";
          group.identifier = `cg/${group.shortname}`;
          break;
        case "business group":
          group["group-type"] = "bg";
          group.identifier = `bg/${group.shortname}`;
          break;
        default:
          debug(`Unrecognized group.type ${group.type} ${group.id}`);
          group["group-type"] = "unknown";
          group.identifier = `unknown/${group.shortname}`;
          break;
      }
      break;
    case "group":
      group["group-type"] = "other";
      group.identifier = `other/${group.shortname}`;
      if (["ab", "tag"].includes(group.shortname)) {
        // "ac" is not a TR publisher so excluded here
        group['tr-publisher'] = true;
      }
      break;
    case "coord":
      group["group-type"] = "coord";
      group.identifier = `coord/${group.shortname}`;
      group['tr-publisher'] = true;
      break;
    case "xg":
      group["group-type"] = "xg";
      group.identifier = `xg/${group.shortname}`;
      break;
    default:
      debug(`Unrecognized group.discr ${group.discr} ${group.id}`);
  }
  return group;
}

/**
 * Return the list of all W3C groups that are currently open
 * @returns {Generator<object>} The groups
 */
export
async function* listGroups() {
  for await (const v of iterateHAL("groups", "https://api.w3.org/groups", decorateGroup))
    yield v;
}

/**
 * Returns services tied to a group
 * 
 * @param {number | string} identifier  a number(eg 100074) or a string (eg "wg/pm")
 * @returns {Generator<object>} Services associated with a group
 */
export
async function* listGroupServices(identifier) {
  const safeIdentifier = safeGroupID(identifier);
  if (safeIdentifier === undefined) {
    debug(`invalid group identifier ${identifier}`);
    return;
  }
  for await (const v of iterateHAL("services", `https://api.w3.org/groups/${safeIdentifier}/services`))
    yield v;
}

/**
 * Return the list of all W3C specifications
 * @returns {Generator<object>} The specifications
 */
export
async function* listSpecifications() {
  for await (const v of utils.iterateHAL("specifications", "https://api.w3.org/groups/specifications"))
    yield v;
}

/**
 * Returns specifications tied to a group
 * 
 * @param {number | string} identifier  a number(eg 100074) or a string (eg "wg/pm")
 * @returns {Generator<object>} Specifications associated with a group
 */
export
async function* listGroupSpecifications(identifier) {
  const safeIdentifier = safeGroupID(identifier);
  if (safeIdentifier === undefined) {
    debug(`invalid group identifier ${identifier}`);
    return;
  }
  for await (const v of iterateHAL("specifications", `https://api.w3.org/groups/${safeIdentifier}/specifications`))
    yield v;
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
    debug(`invalid group identifier ${identifier}`);
    return undefined;
  }

  let link = `https://api.w3.org/groups/${safeIdentifier}`;

  debug(`fetch ${link}`);

  let apiURL = new URL(link);
  apiURL.searchParams.set("embed", "1"); // grab everything
  // ignore errors
  return fetchJSON(apiURL)
    .then(group => decorateGroup(group))
    .catch(() => {
      debug(`Unknown group ${safeIdentifier}`);
      return undefined;
    });
}
