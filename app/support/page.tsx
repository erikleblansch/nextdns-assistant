import type { Metadata } from "next";

export const metadata: Metadata = { title: "Help | NextDNS Assistant" };

export default function Support() {
  return <main className="nd-shell nd-info">
    <a href="/">← NextDNS Assistant</a>
    <h1>Help with NextDNS Assistant</h1>
    <h2>Questions and feedback</h2>
    <p>Use <a href="https://github.com/erikleblansch/nextdns-assistent/issues" target="_blank" rel="noreferrer">GitHub Issues</a> for questions, bug reports or suggestions. These messages are public; omit API keys, profile IDs, IP addresses and personal logs.</p>
    <h2>A write or removal action is missing</h2>
    <p>Enable ‘Allow changes’ if you want to make changes from chat. Select the plugin again or refresh the connection if a conversation only sees read actions. To remove an entry, the server first creates a change proposal and then applies it; a separate delete tool is not needed. Specify the list and domain in your request.</p>
    <h2>Connection fails</h2>
    <p>Check the six-character profile ID and the API key at the bottom of your NextDNS account page. Replace a revoked key. Try again later after a temporary network error or when NextDNS is receiving too many requests.</p>
    <h2>A proposal is rejected</h2>
    <p>Proposals expire after ten minutes. Changes to the connection or affected values can invalidate a proposal. Ask the chat to read current values and create a new proposal. Check the current state first after an uncertain or partial execution.</p>
    <h2>Delete your app data</h2>
    <p>Use ‘Disconnect’ on the home page to delete your own connection and change proposals. See <a href="/privacy">Privacy &amp; data</a>.</p>
    <p className="nd-notice">The directory listing is still being prepared. Never include your API key or unnecessary DNS logs in a bug report.</p>
  </main>;
}
