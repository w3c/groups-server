"use strict";
import config from "./config.js";
import * as monitor from './monitor.js';

// export default
const w3c = {};


// return the list of all W3C groups that are currently open
async function *listGroups() {
  if (config.debug) monitor.log("load groups");
  for (let link = "https://api.w3.org/groups"; ;) {
    let apiURL = new URL(link);
    apiURL.searchParams.set("embed", "1"); // grab everything
    let data = await fetch(apiURL).then(res => res.json());
    for (const group of data._embedded.groups) {
      yield group;
    }
    if (data.pages && data.pages > 1 && data.page < data.pages) {
      link = data._links.next.href;
    } else {
      break;
    }
  }
}
w3c.listGroups = listGroups;

// return a W3C group, whether it is opened or closed
// @ident a number(eg 100074) or a string (eg "wg/pm")
async function group(identifier) {
  if (config.debug) monitor.log("load group " + identifier);
  let link = "https://api.w3.org/groups/";

  if (typeof identifier === "number") {
    link += identifier;
  } else if (typeof identifier === "string" && identifier.match("^[a-z]+/[-_a-zA-Z0-9]+$"))  {
    link += identifier;
  } else {
    return undefined;
  }

  let apiURL = new URL(link);
  apiURL.searchParams.set("embed", "1"); // grab everything
  // ignore errors
  return fetch(apiURL).then(res => res.json())
    .then(group => {
      // group.status could be 404
      if (group._links && group._links.self)
        return group;
      else
        return undefined;
    })
    .catch(() => undefined);
}
w3c.group = group;

// return the list of all W3C groups that are currently open
async function *listServices(identifier) {
  for (let link = `https://api.w3.org/groups/${identifier}/services`; ;) {
    let apiURL = new URL(link);
    let data = await fetch(apiURL).then(res => res.json());
    if (data._links.services) {
      for (const service of data._links.services) {
        yield service;
      }
    }
    if (data.pages && data.pages > 1 && data.page < data.pages) {
      link = data._links.next.href;
    } else {
      break;
    }
  }
}
w3c.listServices = listServices;



export default w3c;
