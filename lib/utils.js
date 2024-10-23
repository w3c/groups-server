"use strict";

/**
 * Sanitizer of string or array of strings
 *
 * @param {any} input from w3c.json for contacts, shortnames, repo-type
 * @returns {Array} An array of strings of non-empty strings or undefined
 */
export
function arrayOfString(input) {
  if (typeof input === "string" && input !== "") {
    return [ input ];
  } else if (Array.isArray(input)) {
    return input.filter(c => (typeof c === "string" && c !== ""));
  }
  return undefined;
}

/**
 * Sanitizer of boolean
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
