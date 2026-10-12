# NextDNS Assistant

Analyze NextDNS logs and manage targeted profile settings from ChatGPT. A free,
independent integration by **Erik Le Blansch**, unaffiliated with NextDNS.

## Availability

The source code is public on GitHub. The existing ChatGPT plugin is currently
private; its public plugin directory listing has not been submitted or approved.
Publishing this code does not automatically install the plugin or expose access
to a NextDNS account.

## Features

- Read DNS logs and summarize a bounded time window.
- Retrieve official query totals and time series.
- Inspect security, privacy and other profile settings.
- Add, remove or activate specific allowlist and denylist entries.
- Preview and apply targeted boolean setting changes.
- Review previous values and results of your own change proposals.

Changes begin with a preview. Execution requires the user's authorization and
enabled write access. The app checks current values and reads back the result.
Multiple changes are not atomic; partial or uncertain results are never retried
automatically. The integration cannot create or delete profiles or erase DNS logs.

## Questions and feedback

Open a [GitHub Issue](https://github.com/erikleblansch/nextdns-assistent/issues)
using the bug report or question/suggestion form. **Issues are public:** do not
share API keys, profile IDs, IP addresses or personal DNS log exports. Use
fictional examples and remove private information from error messages.

## Privacy

Each user connects their own profile through the connection screen. API keys do
not need to be shared in chat. They are stored using AES-256-GCM encryption,
bound to the platform user ID. The administrator has technical access to the
hosted application; this is not encryption that only the user can decrypt.

The app does not separately store fetched DNS logs. Results requested in chat
are sent to ChatGPT for processing in the conversation. Client and local IP
addresses are omitted from log results by default. Proposals, previous values
and execution results are stored. Disconnecting deletes the active app
connection and its proposals.

Read the [privacy description](docs/privacy.md) and
[draft terms of use](docs/terms.md).

## Development

The app uses React, Vinext/Vite, Cloudflare Workers and D1. Sites provides
ChatGPT authentication and the MCP/OAuth connection. The interface, tool
descriptions and documentation are in English. Chat responses can use the
user's preferred language.

Requirements: Node.js 22.13 or later. The tests use Node.js 22 and its built-in
SQLite support. The package manager version is specified in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

For your own Sites deployment, register your own project, configure the D1
binding `DB`, apply the SQL migration and set the server secret
`NEXTDNS_ENCRYPTION_KEY`. `.env.example` contains only the variable name, with
no value. Generate a random 32-byte key encoded as Base64. Keep the same secret
to decrypt existing connections.

The included `.openai/hosting.json` deliberately omits the existing project's
ID. Use the standard Sites workflow to register and retain your own project
identity.

Production routes trust the user identity injected by Sites. A separately
hosted Worker needs its own trusted authentication layer; client-supplied
identity headers are not authentication. The starter's local mock
authentication is for development only.

## Source and validation

- `lib/nextdns-core.mjs`: API client, encryption, MCP tools and change plans.
- `app/api/connection/route.ts`: account-specific connection and disconnection.
- `app/mcp/route.ts`: stateless Streamable HTTP MCP endpoint.
- `app/setup-screen.tsx`: connection screen and example prompts.
- `db/` and `drizzle/`: storage schema and SQL migration, with no stored data.
- `tests/`: seventeen checks using synthetic data only.
- `publication/`: draft directory metadata and review cases.

The seventeen implementation checks pass, covering user isolation, anonymous
discovery, targeted deletion, key redaction, pagination, expired/stale proposals
and the native Worker fetch runtime. The eight directory review prompts have
not yet been run in an independent reviewer installation.

This source export contains no database, runtime data, environment secret,
personal NextDNS profile ID or original Git history. Third-party license
notices are retained in the relevant files.

Official API documentation: <https://nextdns.github.io/api/>.
