"use strict";
import config from './config.js';
import { Octokit as OCore } from "@octokit/core";
import { throttling } from "@octokit/plugin-throttling";
import * as monitor from "./monitor.js";
import debuglog from "debug";
import { w3cJSON } from "./w3c_utils.js";

const debug = debuglog('github');

// maximun amount of retries with the GH API
const MAX_RETRIES = 3;

// our octokit toolkit, throttled
const Octokit = OCore.plugin(throttling);
const octokit = new Octokit({
  auth: config.ghToken,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      if (options.request.retryCount < MAX_RETRIES) {
        monitor.warn(`Rate limit exceeded, retrying after ${retryAfter} seconds`)
        return true;
      } else {
        monitor.error(`Rate limit exceeded, giving up after ${MAX_RETRIES} retries`);
        return false;
      }
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      if (options.request.retryCount < MAX_RETRIES) {
        monitor.warn(`Secondary detection triggered, retrying after ${retryAfter} seconds`)
        return true;
      } else {
        monitor.error(`Secondary detection triggered, giving up after ${MAX_RETRIES} retries`);
        return false;
      }
    }
  }
});

function setDefaultExposed(repo) {
  if (repo && repo.w3cjson &&repo.w3cjson.exposed === undefined) {
    if (repo.isPrivate === true || repo.isArchived === true) {
      // by default, archived or private repos are not exposed
      repo.w3cjson.exposed = false;
    } else {
      // public
      repo.w3cjson.exposed = true;
    }
  }
}
octokit.setDefaultExposed = setDefaultExposed; // export

/**
* Sanitizes a repository object from GitHub API
*
* @param {object} inputRepository
* @returns {object} sanitized repository
*/
async function sanitizeRepository(inputRepository) {
  const outputRepository = {};
  outputRepository.name = inputRepository.name;
  outputRepository.owner = { "login": inputRepository.owner.login } ;
  if (inputRepository.homepageUrl !== null && inputRepository.homepageUrl !== "") {
    outputRepository.homepageUrl = inputRepository.homepageUrl;
  }
  if (inputRepository.description !== null && inputRepository.description !== "") {
    outputRepository.description = inputRepository.description;
  }
  outputRepository.isArchived = inputRepository.isArchived;
  outputRepository.isPrivate = inputRepository.isPrivate;
  let text;
  if (inputRepository.w3cjson) {
    outputRepository.w3cjson = w3cJSON(inputRepository.w3cjson);
    setDefaultExposed(outputRepository);
  }
  return outputRepository;
}

/**
* Returns an Organization or User object, with its repositories
* See also https://docs.github.com/en/graphql/reference/queries
* @param {string} type "organization" or "user"
* @returns {object} Organization or User
*/
function getQuery(type) {
  return `
  query ($org: String!, $cursor: String) {
    ${type}(login: $org) {
      repositories(first: 10, after: $cursor) {
        nodes {
          name
          owner {
            login
          }
          homepageUrl
          description
          isArchived
          isPrivate
          w3cjson: object(expression: "HEAD:w3c.json") {
            ... on Blob {
              text
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;
}

/**
* Iterates through the repositories for a given GH account
* See also https://docs.github.com/en/graphql/reference/objects#repository
* @param {string} org
* @return {Iterable<object>} Repository
*/
async function *listRepos(org) {
  debug(`list repos ${org}`);
  let type = "organization"; // or "user"
  const account = await octokit.request(`GET /users/${org}`).then(r => r.data);
  if (account && account.type) {
    // make sure if we get the proper type
    type = account.type.toLowerCase();
  }
  const repoQuery = getQuery(type);
  for (let cursor = null; ;) {
    const res = await octokit.graphql(repoQuery, {org, cursor});
    for (const repo of res[type].repositories.nodes) {
      if (repo.w3cjson && repo.w3cjson.text) {
        repo.w3cjson = repo.w3cjson.text;
      } else {
        repo.w3cjson = undefined;
      }
      yield sanitizeRepository(repo);
    }
    if (res[type].repositories.pageInfo.hasNextPage) {
      cursor = res[type].repositories.pageInfo.endCursor;
    } else {
      break;
    }
  }
}
octokit.listRepos = listRepos; // export

/**
* Returns a Repository oject
* @param {string} repo the repository name, eg "w3c/groups-server"
* @returns {object} the repository
*/
async function getRepo(repo) {
  debug(`getRepo ${repo}`);
  const gh = await octokit.request(`GET /repos/${repo}`).then(r => r.data);
  gh.homepageUrl = gh.homepage;
  gh.isPrivate = gh.private;
  gh.isArchived = gh.archived;
  const res = await octokit.request(`GET /repos/${gh.owner.login}/${gh.name}/contents/w3c.json`)
  .catch(err=>undefined);
  if (res && res.status === 200 && res.data.type === "file")
    gh.w3cjson = Buffer.from(res.data.content, res.data.encoding).toString("utf-8");
  
  return sanitizeRepository(gh);
}
octokit.getRepo = getRepo; // export

async function createContent(path, message, content, branch) {
  debug(`create content ${path}`);
  const file = await octokit.request(`GET /repos/w3c/groups/contents/${path}`).catch(err=>err);
  
  let sha;
  if (file.status === 200) {
    if (file.data.type !== "file") {
      throw new Error(`${path} isn't a file to be updated. it's ${file.data.type}.`);
    }
    // we're about to update the file
    sha = file.data.sha;
  } else if (file.status === 404) {
    // we're about to create the file
  } else {
    throw file;
  }
  content = Buffer.from(content, "utf-8").toString('base64');
  return octokit.request(`PUT /repos/w3c/groups/contents/${path}`, {
    message: message,
    content: content,
    sha: sha,
    branch: branch
  });
}
octokit.createContent = createContent;

export default octokit;
