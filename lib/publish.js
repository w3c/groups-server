"use strict";
import fs from "node:fs/promises";
import path from 'path';
import config from "./config.js";
import debuglog from "debug";
import github from "./github.js";

const debug = debuglog('publish');

/* Create a directory if needed */
let DIRS = {}; // remember which directory you created
async function mkdir(param_path) {
  if (DIRS[param_path]) {
    return Promise.resolve(param_path);
  } else {
    return fs.mkdir(param_path, { "recursive": true }).catch(err => {
      DIRS[param_path] = true;
      return param_path;
    });
  }
};

/**
 * Do we need to save a data?
 *
 * @param {string} filename Absolute file system path
 * @param {string} data JSON.stringify JS object
 * @returns {boolean}
 */
async function needsSave(filename, data, format) {
  debug("needs save " + filename);
  // first read the file
  let current = await fs.readFile(filename)
    .then(raw=>(format==="json")?JSON.parse(raw):raw).catch(e => undefined);

  if (current) {
    const value = (format==="json")?JSON.stringify(current, null, " "):current;
    if (value === data) {
      return false;
    } else {
      return true;
    }
  } else {
    return true;
  }
}

/**
 * Save a JS object in the file system and GitHub based on the relative path
 *
 * @param {string} relative_path relative file system path
 * @param {object} data Object to be saved
 * @returns {boolean} true if the object needed to be saved, false otherwise
 */
export
async function saveData(relative_path, data) {
  const filepath = path.resolve(config.destination, relative_path);
  let format = "text";
  if (typeof data === "object") {
    data = JSON.stringify(data, null, " ");
    format = "json";
  }

  // this will write to GitHub then to the local disk
  async function _writeData(filepath, data) {
    debug("save " + filepath);
    if (config.production) {
      await github.createContent(relative_path, `Update from upstream ${relative_path}`, data, "main").then(data => {
        if (data.status !== 200 && data.status !== 201) {
          throw data;
        }
      });
    }
    return mkdir(path.dirname(filepath)).then(() => fs.writeFile(filepath, data));
  }

  if (await needsSave(filepath, data, format)) {
    return _writeData(filepath, data).then(() => true);
  } else {
    debug("no save needed " + filepath);
    return false;
  }
}

/**
 * Save group information in the file system and in GitHub
 *
 * @param {object} group The Group from the W3C API
 * @param {Array} repos The repositories from the GitHub API directly owned by the Group
 * @param {Array} others The repositories from the GitHub API indirectly owned by the Group (e.g. task forces)
 * @returns true if the information needed to be saved, false otherwise
 */
export
async function saveGroupRepositories(group, repos, others) {
  let changed = false;
  changed |= await saveData(`${group.identifier}/group.json`, group);
  changed |= await saveData(`${group.identifier}/repositories.json`, repos);
  changed |= await saveData(`${group.identifier}/others.json`, others);
  return changed;
}

/**
 * used for debugging purposes and to serve data
 * @param {string} relative file system path
 * @returns {object} the data
 */
export
async function getData(fs_path) {

  const filepath = path.resolve(config.destination, fs_path);

  // first read the file
  return fs.readFile(filepath).then(JSON.parse).catch(e => undefined);
}
