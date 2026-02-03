"use strict";
import debuglog from "debug";
import { json } from "./fetch.js";
import { iterateHAL } from "./utils.js";
import { groupIdentifier } from './w3c_utils.js';

const debug = debuglog('w3c');

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
  for await (const v of iterateHAL("groups", "https://api.w3.org/groups", true, decorateGroup))
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
  const safeIdentifier = groupIdentifier(identifier);
  if (safeIdentifier === undefined) {
    debug(`invalid group identifier ${identifier}`);
    return;
  }
  for await (const v of iterateHAL("services",
      `https://api.w3.org/groups/${safeIdentifier}/services`, false))
    yield v;
}

/**
 * Return the list of all W3C specifications
 * @returns {Generator<object>} The specifications
 */
export
async function* listSpecifications() {
  for await (const v of utils.iterateHAL("specifications", "https://api.w3.org/groups/specifications", true))
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
  const safeIdentifier = groupIdentifier(identifier);
  if (safeIdentifier === undefined) {
    debug(`invalid group identifier ${identifier}`);
    return;
  }
  for await (const v of iterateHAL("specifications", `https://api.w3.org/groups/${safeIdentifier}/specifications`, true))
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
  const safeIdentifier = groupIdentifier(identifier);
  if (safeIdentifier === undefined) {
    debug(`invalid group identifier ${identifier}`);
    return undefined;
  }

  let link = `https://api.w3.org/groups/${safeIdentifier}`;

  debug(`fetch ${link}`);

  let apiURL = new URL(link);
  apiURL.searchParams.set("embed", "1"); // grab everything
  // ignore errors
  return json(apiURL)
    .then(group => decorateGroup(group))
    .catch(() => {
      debug(`Unknown group ${safeIdentifier}`);
      return undefined;
    });
}
