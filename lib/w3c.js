import config from "./config.js";
import fetch from 'node-fetch';
import * as monitor from './monitor.js';

// export default
const w3c = {};

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



export default w3c;
