

/**
 * Sanitize Group IDs
 *
 * @param {any} id the group ID as written in w3c.json
 * @returns {Number} the group ID as a Number or NaN
 */
function toGroupID(id) {

  if (typeof id === "string") {
    if (id.indexOf('/') !== -1) { // eg "wg/webperf"
      return id;
    }
    return Number.parseInt(id); // eg "34563"
  } else if (typeof id === "number"
    && Number.isSafeInteger(id)
    && id > 1) {
    return id;
  } // else
  return Number.NaN;
}

/**
 * Sanitizer of string or array of strings
 *
 * @param {any} input from w3c.json for contacts, shortnames, repo-type
 *
 * @returns {Array} An array of strings of non-empty strings or undefined
 */
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
function toBoolean(input) {
  if (typeof input === "boolean") {
    return input;
  } else if (typeof input === "string" && input === "true") {
    return true;
  } else if (typeof input === "string" && input === "false") {
    return false;
  }
  return undefined;
}

/**
* Sanitize w3c.json files based on https://w3c.github.io/w3c.json.html
* It will omit any entry which is not considered valid
* Unknown entries
*
* @param {string} the string contains the w3c.json file
* @returns a clean w3c.json object or undefined
*/
export
function sanitizeW3CJSON(text) {

  let obj;
  try {
    obj = JSON.parse(text);
  } catch (e) {
    return undefined;
  };

  // group
  if (Array.isArray(obj.group)) {
    obj.group = obj.group.map(toGroupID).filter(n => !(n === Number.NaN));
  } else if (obj.group) {
    obj.group = [toGroupID(obj.group)].filter(n => !(n === Number.NaN));
  }
  if (obj.group && !obj.group.length) {
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

  return obj;
}
