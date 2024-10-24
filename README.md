# groups-server

A server to refresh group repositories in [`w3c/groups`](https://github.com/w3c/groups/).

[`settings.json`](https://github.com/w3c/groups/blob/main/settings.json)
(within the groups repository) also contains configuration settings used by this server.
It may be edited by hand.

## Local Development

By default, the server is in `dev` mode and will not save to GitHub nor send email reports.

1. Copy `config.json.default` to `config.json`
2. Change `"debug": false,` to `"debug": true,`
   to avoid making unecessary GitHub API calls
3. Also clone the [`w3c/groups`](https://github.com/w3c/groups/) repository
4. Update the value of `"destination"` to reflect the relative path
   from this repository's root directory to that one,
   e.g. `"../groups"` if the two projects are cloned into sibling directories
5. Run `npm start` to run the server locally, which will write to the local `groups`
   repository folder

## Debugging

Run `npm test` to run the local set of test files.

Run `npm run coverage` to get a test coverage report.

The code uses the [debug](https://github.com/debug-js/debug) module. The `DEBUG` environment variable is used to filter debug messages.

Use `DEBUG=* npm start` to see all debug messages. You may filter debugging modules using `DEBUG=w3c,loop npm start` for example.

`DEBUG=w3c node --test --test-name-pattern "lib/w3c group"` will debug the lib/w3c.js module, running only the tests related to that module

## Production

`export NODE_ENV=production` environment variable will be necessary
(see [express documentation](http://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production"))
Note that the pm2 config already contains it.

When in `production` mode, the server will write to GitHub and sends email reports.
