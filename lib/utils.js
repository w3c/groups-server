"use strict";

import debuglog from "debug";

const debug = debuglog('utils');

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
 * @param {string} propertyTarget the targeted property
 * @param {string} link URL to iterate
 * @param {boolean} embed true if you need embedded information
 * @param {function?} objFct a function to further process the resulting object
 * @returns {Generator<object>} the target property object
 */
export
async function* iterateHAL(propertyTarget, link, embed, objFct) {
  debug(`fetch HAL ${link}`);
  while (true) {
    let apiURL = new URL(link);
    if (embed === true) {
      apiURL.searchParams.set("embed", "1"); // grab everything
    }
    let data = await fetchJSON(apiURL);
    if (embed) {
      for (const target of data._embedded[propertyTarget]) {
        if (objFct) {
          yield objFct(target);
        } else {
          yield target;
        }
      }
    } else {
      if (data._links[propertyTarget]) {
        for (const target of data._links[propertyTarget]) {
          if (objFct) {
            yield objFct(target);
          } else {
            yield target;
          }
        }
      }
    }
    if (data.pages && data.pages > 1 && data.page < data.pages) {
      link = data._links.next.href;
    } else {
      return;
    }
  }
}

