# groups-server

A server to refresh group repositories in [`w3c/groups`](https://github.com/w3c/groups/).

[`settings.json`](https://github.com/w3c/groups/blob/main/settings.json)
(within the groups repository) also contains configuration settings used by this server.
It may be edited by hand.

## Local Development

1. Copy `config.json.default` to `config.json`
2. Change `"debug": false,` to `"debug": true,`
   to avoid making GitHub API calls or sending error emails
3. Also clone the [`w3c/groups`](https://github.com/w3c/groups/) repository
4. Update the value of `"destination"` to reflect the relative path
   from this repository's root directory to that one,
   e.g. `"../groups"` if the two projects are cloned into sibling directories
5. Run `npm start` to run the server locally, which will write to the local `groups`
   repository folder
