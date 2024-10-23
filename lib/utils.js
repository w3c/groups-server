"use strict";

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
 * Fetch any JSON data
 *
 * @param {String} url
 */
export
async function fetchJSON(url) {
  return fetch(url)
    .then(r => {
      if (!r.ok) {
        throw new Error(`GET ${r.url} ${r.status}`);
      }
      return r.text();
    }).then(text => {
      if (text.length > 0) {
        try {
          return JSON.parse(text);
        } catch (orig) {
          let e = new Error(`${ENTRY} has a JSON syntax error`);
          e.url = ENTRY;
          e.error = orig;
          throw e;
        }
      } else {
        let e = new Error(`${ENTRY} is empty`);
        e.url = ENTRY;
        throw e;
      }
    });
}
