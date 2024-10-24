"use strict";

import debuglog from "debug";

const debug = debuglog('utils');

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
 * Fetch any JSON data. Throws on 404.
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
      return r.json();
    });
}

/**
 * Iterate through W3C API HAL pages, yelding the target property
 * @returns {Generator<object>} the target property object
 */
export
async function* iterateHAL(propertyTarget, link, objFct) {
  debug(`fetch ${link}`);
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

