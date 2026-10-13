# Privacy & data — NextDNS Assistant

**Publisher:** Erik Le Blansch. **Updated:** October 12, 2026.

NextDNS Assistant is a free, independent integration. This page describes
data processing in the current implementation.

## Account-specific data

You sign in with ChatGPT and connect your own NextDNS profile. The platform
user ID separates your data from other users' data. The active database stores
that user ID, your encrypted API key, profile ID, profile name, write permission,
technical revisions and timestamps.

Keys are encrypted with AES-256-GCM and bound to the user ID. The app does not
return the stored key to the browser or chat. The administrator has technical
access to the hosted application; this is not encryption that only you can
decrypt.

## Results and change proposals

At your request, the app retrieves logs, analytics, lists and settings from
NextDNS. It does not separately store fetched DNS logs. Results requested in
your conversation are sent to ChatGPT. Domains, device names and settings may
contain personal information. Client and local IP addresses are omitted from
log results by default; you can explicitly request their inclusion.

The app stores change proposals, previous and proposed values, affected domains
or settings, timestamps and execution results. Proposals can be viewed for
approximately thirty days. Older records are deleted when the same user
creates a new proposal. This is not a guarantee that every record is deleted
from all storage within thirty days.

## Hosting

The app uses ChatGPT Sites, the Cloudflare Worker runtime and the NextDNS API.
It contains no advertising trackers or custom analytics scripts. Those
platforms may process authentication data, request metadata, operational logs
and backups under their own policies. This description does not promise
retention periods or data uses on behalf of those providers.

## Deletion and revocation

Use **Disconnect** to delete your stored connection and change proposals from
the active app database. This does not delete your NextDNS profile or existing
ChatGPT conversations. You can also revoke your API key at NextDNS.

## Questions and feedback

Use [GitHub Issues](https://github.com/erikleblansch/nextdns-assistant/issues)
for questions and feedback. Issues are public: do not include keys, profile
IDs, IP addresses or personal logs. Use the disconnection function to remove
your own active app data.

The directory listing is still being prepared. The publisher must complete
the remaining publication decisions and required portal attestations before
submitting the public service.
