import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy & data | NextDNS Assistant" };

export default function Privacy() {
  return <main className="nd-shell nd-info">
    <a href="/">← NextDNS Assistant</a>
    <h1>Privacy &amp; data</h1>
    <p>NextDNS Assistant is a free, independent integration by Erik Le Blansch. This page describes how the current version processes data. Updated October 12, 2026.</p>
    <h2>Your own connection</h2>
    <p>You connect your own NextDNS profile after signing in with ChatGPT. The app uses the platform-provided user ID to separate your connection and change proposals from those of other users. There is no shared NextDNS account.</p>
    <h2>What the app stores</h2>
    <p>The active database stores your user ID, encrypted NextDNS API key, profile ID and name, write permission, technical revisions and timestamps. The key is encrypted with AES-256-GCM and is not returned to the browser or chat. The administrator has technical access to the hosted app; this is not encryption that only you can decrypt.</p>
    <p>Change proposals contain selected domains or settings, previous and proposed values, timestamps and execution results. Proposals can be viewed for approximately thirty days. Older records are deleted when the same user creates a new proposal. This does not guarantee that every record disappears from all storage after thirty days.</p>
    <h2>Logs and results in your conversation</h2>
    <p>At your request, the app retrieves logs, analytics, lists or settings from NextDNS. It does not separately store fetched DNS logs. Results requested in chat are sent to ChatGPT for processing in your conversation. Client and local IP addresses are omitted from log results by default; you can explicitly request their inclusion. Domains, device names and profile settings may also contain personal information.</p>
    <h2>Hosting and other services</h2>
    <p>The app uses ChatGPT Sites and the Cloudflare Worker runtime for hosting and storage, and the NextDNS API for your connected profile. It contains no advertising trackers or custom analytics scripts. Those platforms may process authentication data, request metadata, operational logs and backups under their own policies. This page does not promise their retention periods.</p>
    <h2>Disconnect and revoke access</h2>
    <p>Use ‘Disconnect’ on the home page to delete your stored connection and change proposals from the active app database. Your NextDNS profile and information already in ChatGPT conversations remain with those services. You can also revoke your API key at NextDNS, which makes the stored key unusable.</p>
    <p className="nd-notice">The public plugin listing is still being prepared. Publication terms and the required review must be completed before directory release. Questions and feedback can be submitted through GitHub Issues. See <a href="/support">Help</a> for current usage information.</p>
  </main>;
}
