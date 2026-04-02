"use strict";

import debuglog from "debug";
import { json } from "./fetch.js";

const debug = debuglog('utils');

/**
* Iterate through W3C API HAL pages, yelding the target property
* @param {string} propertyTarget the targeted property
* @param {string} link URL to iterate
* @param {boolean} embed true if you need embedded information
* @param {function?} objFct a function to further process the resulting object
* @returns {Generator<object>} the target property object
*/
export async function* iterateHAL(propertyTarget, initialLink, embed = false, objFct = null) {
  let nextLink = initialLink;

  while (nextLink) {
    debug(`fetch HAL ${nextLink}`);

    const apiURL = new URL(nextLink);
    if (embed) apiURL.searchParams.set("embed", "1");

    const data = await json(apiURL);

    const collection = embed
      ? data._embedded?.[propertyTarget]
      : data._links?.[propertyTarget];

    if (Array.isArray(collection)) {
      for (const item of collection) {
        yield objFct ? objFct(item) : item;
      }
    }

    nextLink = (data.pages && data.page < data.pages)
      ? data._links?.next?.href
      : null;
  }
}
