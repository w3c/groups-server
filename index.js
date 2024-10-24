"use strict";

// Measure the time spent to load the service
const t0 = Date.now();

import express from "express";
import bodyParser from "body-parser";
import fs from 'fs/promises';
// import ghHandler from require("./lib/GHEventHandler.js"); @@UNUSED
import { nudge, serve, init } from "./loop.js";

import path from 'path';

import config from "./lib/config.js";

import * as monitor from "./lib/monitor.js";
let app = express();

app.enable("trust proxy");

app.use(bodyParser.json());

monitor.setName("Group data dumper");
monitor.install(app);

/**
 * Check if a payload comes from GH
 * @param {object} req - an HTTP Request object
 * @returns {boolean} true if the request comes from GitHub
 */
function fromGitHub(req) {
  let ghEvent = req.get("X-GitHub-Event");
  let header = req.get("X-Hub-Signature");
  let secret = config.webhook_secret;
  let contentType = req.get("Content-Type");
  return (secret === undefined || header === secret)
          && contentType === "application/json"
          && ghEvent !== undefined;
}

/**
 * Process a payload sent by GitHub (UNUSED)
 * @returns {void}
 */
app.post("/payload", function (req, res, next) {
  if (!fromGitHub(req)) {
    monitor.warn("POST isn't from GitHub");
    res.status(400).send("<p>Not a GitHub payload</p>");
    next();
    return; // no action
  }
  let ghEvent = req.get("X-GitHub-Event");
  debug("GitHub event " + ghEvent + " " + req.body.action);

  try {
    // HOOK DEACTIVATED ghHandler.dispatchEvent(ghEvent, req.body);
    monitor.log("Webhook disabled");
    res.status(200).send("<p>roger</p>");
  } catch (error) {
    monitor.error(error);
    res.status(500).send("mayday");
  }
  next();
  return;
});

/**
 * Nudge the service
 * @returns {void}
 */
app.post("/nudge", function (req, res, next) {
  try {
    nudge();
    res.status(200).send("<p>Nudged</p>");
  } catch (error) {
    monitor.error(error);
    res.status(500).send("mayday");
  }
  next();
  return;
});

/**
 * Get groups data (UNUSED)
 * @returns {void}
 */
app.get("/data/groups", function (req, res, next) {
  serve(req, res, next)
  .catch((err) => {
    console.log(err)
    res.status(500).send("contact Starman. He is orbiting somewhere in space in his car.")
  })
  .then(() => next());
});

app.get("/data/repositories", function (req, res, next) {
  serve(req, res, next)
  .catch(() => res.status(500).send("contact Starman. He is orbiting somewhere in space in his car."))
  .then(() => next());
});

/**
 * Get index.html documentation
 * @returns {void}
 */
app.get("/doc", function (req, res, next) {
  fs.readFile(path.resolve(config.basedir, "./docs/index.html")).then(data => {
    res.set('Content-Type', 'text/html')
    res.send(data);

  }).catch(() => res.status(500).send("contact Starman. He is orbiting somewhere in space in his car."))
  .then(() => next());

});

/**
 * Get nudge HTML form
 * @returns {void}
 */
app.get("/doc/nudge", function (req, res, next) {
  fs.readFile(path.resolve(config.basedir, "./docs/nudge.html")).then(data => {
    res.set('Content-Type', 'text/html');
    res.send(data);

  }).catch(() => res.status(500).send("contact Starman. He is orbiting somewhere in space in his car."))
  .then(() => next());

});

// Plug the monitor interfaces
monitor.stats(app);

/* eslint-disable no-console */
// check that our default options are properly setup, or abort
const missing = config.checkOptions("host", "port", "env");
if (missing) {
  console.error("Improper configuration. Not Starting");
  for (const opt of missing) {
    console.error(`${opt} config option missing`);
  }
  process.abort();
}

app.listen(config.port, () => {
  console.log(`Express server ${config.host} listening on port ${config.port} in ${config.env} mode`);
  console.log("App started in", (Date.now() - t0) + "ms.");
  init();
});
/* eslint-enable no-console */
