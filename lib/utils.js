

/**
 * Sanitize Group IDs
 *
 * @param {any} id the group ID as written in w3c.json
 * @returns {Number} the group ID as a Number or NaN
 */
function toGroupID(id) {
  if (typeof id === "string") {
    return Number.parseInt(id);
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
 * @returns {Array} An array of strings
 */
function arrayOfString(input) {
  if (typeof input === "string") {
    return [ input ];
  } else if (Array.isArray(input)) {
    return input.filter(c => typeof c === "string");
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
  if (!(obj.policy && typeof obj.policy === "string")) {
    delete obj.policy;
  }

  // shortname
  if (obj.shortname) {
    obj.shortname = arrayOfString(obj.shortname);
  }
  if (obj.shortname && !obj.shortname.length) {
    delete obj.shortname;
  }

  return obj;
}
