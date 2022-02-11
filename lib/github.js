import config from './config.js';
import { Octokit as OCore } from "@octokit/core";
import { throttling } from "@octokit/plugin-throttling";
import * as monitor from "./monitor.js";

const Octokit = OCore.plugin(throttling);

const MAX_RETRIES = 3;

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
    onAbuseLimit: (retryAfter, options) => {
      if (options.request.retryCount < MAX_RETRIES) {
        monitor.warn(`Abuse detection triggered, retrying after ${retryAfter} seconds`)
        return true;
      } else {
        monitor.error(`Abuse detection triggered, giving up after ${MAX_RETRIES} retries`);
        return false;
      }
    }
  }
});

const repoQuery = `
  query ($org: String!, $cursor: String) {
    organization(login: $org) {
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

async function *listRepos(org) {

  for (let cursor = null; ;) {
    const res = await octokit.graphql(repoQuery, {org, cursor});
    for (const repo of res.organization.repositories.nodes) {
      yield repo;
    }
    if (res.organization.repositories.pageInfo.hasNextPage) {
      cursor = res.organization.repositories.pageInfo.endCursor;
    } else {
      break;
    }
  }
}
octokit.listRepos = listRepos; // export

async function createContent(path, message, content, branch) {
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
