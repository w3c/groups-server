import config from "./config.js";
import fetch from 'node-fetch';
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
async function group(ident) {
  if (config.debug) monitor.log("load group " + ident);
  let link = "https://api.w3.org/groups/";

  if (typeof ident === "number") {
    link += ident;
  } else if (typeof ident === "string" && ident.match("^[a-z]+/[-_a-zA-Z0-9]+$"))  {
    link += ident;
  } else {
    return undefined;
  }

  let apiURL = new URL(link);
  apiURL.searchParams.set("embed", "1"); // grab everything
  // ignore errors
  return fetch(apiURL).then(res => res.json())
    .then(group => {
      if (group._links && group._links.self)
        return group;
      else
        return undefined;
    })
    .catch(() => undefined);
}
w3c.group = group;

export default w3c;
