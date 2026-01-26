"use strict";

import debuglog from "debug";

const debug = debuglog('w3c_utils');

/**
* Sanitizer of string or array of strings
* Assume we're dealing with user input, so we could get anything
*
* @param {any} input from w3c.json for contacts, shortnames, repo-type
* @returns {Array} An array of strings of non-empty strings or undefined
*/
export
function arrayOfString(input) {
  if (typeof input === "string" && input !== "") {
    return [ input ];
  } else if (Array.isArray(input)) {
    const output = input.filter(c => (typeof c === "string" && c !== ""));
    if (output.length !== 0) return output;
  }
  return undefined;
}

/**
* Sanitizer of boolean
* Assume we're dealing with user input, so we could get anything
*
* @param {any} input from w3c.json for exposed
*
* @returns {boolean} boolean or undefined
*/
export
function toBoolean(input) {
  if (typeof input === "boolean") {
    return input;
  } else if (input === "true" || input === "1" || input === 1) {
    return true;
  } else if (input === "false" || input === "0" || input === 0) {
    return false;
  }
  return undefined;
}

/**
* Sanitize a Group Identifier
*
* @param {any} id the group ID as written in w3c.json
* @returns {string | number | undefined} the group ID as a string or a number
*/
export
function groupIdentifier(id) {
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
  function w3cJSON(text) {
    /** @type {object} the resulting W3C JSON object */
    let newObject = {}; // the returned object
    try {
      text = JSON.parse(text);
    } catch {
      // we give up if it's not even JSON
      return undefined;
    };
    if (text === null) return undefined;
    for (const [ prop, value ] of Object.entries(text)) {
      let holder;
      switch (prop) {
        case "group":
        if (Array.isArray(value)) {
          holder = value.map(groupIdentifier).filter(n => n !== undefined);
        } else if (value) {
          holder = [groupIdentifier(value)].filter(n => n !== undefined);
        }
        if (holder && holder.length) {
          newObject.group = [...new Set(holder)];
        }
        break;
        case "contacts":
        case "repo-type":
        case "shortname":
        holder = arrayOfString(value);
        if (holder && holder.length) {
          newObject[prop] = [...new Set(holder)];
        }
        break;
        case "policy":
        if (value === "restricted") {
          newObject.policy = "restricted";
        } else if (value === "open") {
          newObject.policy = "open";
        }
        break;
        case "exposed":
        holder = toBoolean(value);
        if (typeof holder === "boolean") {
          newObject.exposed = holder;
        }
        break;
        default:
        // other properties are left as-is, for backward and forward compatibility
        newObject[prop] = value;
      }
    }
    
    // check that we have at least one property before returning the object
    if (Object.keys(newObject).length > 0)
      return newObject;
    
    return undefined;
  }
  