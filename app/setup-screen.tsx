"use client";

import { useEffect, useState, type FormEvent } from "react";

type Connection = { configured: boolean; profile_id?: string; profile_name?: string; allow_writes: boolean; updated_at?: string };
const examples = [
  { label: "Explore logs", text: "Analyze my NextDNS logs from the last 24 hours. Give detailed recommendations for tracking and telemetry, optional features and insufficiently verified domains. Keep email links and images working." },
  { label: "Review settings", text: "Read my NextDNS settings and explain useful improvements, including their effects and current values." },
  { label: "Explain a block", text: "Check my NextDNS logs to explain why this website is blocked and propose a narrow exception if needed." },
];

export default function SetupScreen({ signedIn }: { signedIn: boolean }) {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [profileId, setProfileId] = useState("");
  const [allowWrites, setAllowWrites] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(signedIn);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [removeReady, setRemoveReady] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    fetch("/api/connection", { cache: "no-store" }).then(async res => {
      const body = await res.json() as Connection & { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Connection status is unavailable.");
      if (active) { setConnection(body); setProfileId(body.profile_id ?? ""); setAllowWrites(Boolean(body.allow_writes)); }
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [signedIn]);

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice(""); setRemoveReady(false);
    try {
      const res = await fetch("/api/connection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, profileId: profileId.trim().toLowerCase(), allowWrites }) });
      const body = await res.json() as Connection & { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not connect.");
      setConnection(body); setApiKey(""); setProfileId(body.profile_id ?? ""); setAllowWrites(body.allow_writes);
      setNotice(`Connected to ${body.profile_name}. You can now use the NextDNS plugin in chat.`);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not connect."); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true); setError(""); setNotice("");
    try {
      const res = await fetch("/api/connection", { method: "DELETE" });
      const body = await res.json() as Connection & { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not disconnect.");
      setConnection(body); setApiKey(""); setProfileId(""); setAllowWrites(false); setRemoveReady(false);
      setNotice("Your stored key and change proposals have been deleted. Your NextDNS profile still exists.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not disconnect."); }
    finally { setBusy(false); }
  }

  async function copyExample(index: number) {
    try { await navigator.clipboard.writeText(examples[index].text); setCopied(index); }
    catch { setError("Copying is unavailable. Select the example text to copy it."); }
  }

  return (
    <main className="nd-shell">
      <header className="nd-header">
        <a href="/" className="nd-brand" aria-label="NextDNS Assistant home">
          <span className="nd-logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3 20 6v6c0 4-5 7-8 9-3-2-8-5-8-9V6l8-3Z" stroke="currentColor" strokeWidth="1.5"/><path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.5"/></svg></span>
          <span>NextDNS <span className="nd-dim">Assistant</span></span>
        </a>
        <span className="nd-private"><span aria-hidden="true">◌</span> Your own profile</span>
      </header>
      <section className="nd-intro">
        <p className="nd-eyebrow">YOUR DNS, WITHIN REACH</p>
        <h1>More insight.<br/><span>Less manual work.</span></h1>
        <p>Explore your NextDNS logs, understand your settings and manage your lists from ChatGPT.</p>
      </section>
      <div className="nd-grid">
        <section className="nd-card nd-connection" aria-labelledby="connection-heading">
          <div className="nd-card-top"><span className="nd-step">01</span><h2 id="connection-heading">Connect your profile</h2></div>
          <div className="nd-status" role="status">
            <span className={`nd-dot ${connection?.configured ? "nd-connected" : ""}`} aria-hidden="true"/>
            <span>{loading ? "Loading connection status…" : connection?.configured ? `${connection.profile_name} · ${connection.profile_id}` : "Not connected yet"}</span>
            {connection?.configured && <small>{connection.allow_writes ? "Read & change" : "Read only"}</small>}
          </div>
          {!signedIn ? <div className="nd-signin"><p>Sign in with your ChatGPT account to securely connect your own key.</p><a className="nd-button" href="/signin-with-chatgpt?return_to=%2F" target="_top">Sign in with ChatGPT <span aria-hidden="true">↗</span></a></div> : (
            <form onSubmit={save}>
              <fieldset disabled={busy || loading}>
                <label htmlFor="api-key">API key <span>{connection?.configured ? "saved" : "required"}</span></label>
                <input id="api-key" name="nextdns-api-key" type="password" autoComplete="off" spellCheck={false} value={apiKey} onChange={e => setApiKey(e.target.value)} required={!connection?.configured} placeholder={connection?.configured ? "Leave blank to keep your existing key" : "Paste your NextDNS API key here"} maxLength={200} aria-describedby="key-help"/>
                <p id="key-help" className="nd-help">Find it at the bottom of your <a href="https://my.nextdns.io/account" target="_blank" rel="noreferrer">NextDNS account page ↗</a>.</p>
                <label htmlFor="profile-id">Profile ID <span>6 characters</span></label>
                <input id="profile-id" name="profile-id" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} value={profileId} onChange={e => setProfileId(e.target.value)} required placeholder="abc123" minLength={6} maxLength={6} pattern="[A-Za-z0-9]{6}" aria-describedby="profile-help"/>
                <p id="profile-help" className="nd-help">The ID on the Setup tab of your NextDNS profile.</p>
                <label className="nd-check"><input type="checkbox" checked={allowWrites} onChange={e => setAllowWrites(e.target.checked)}/><span>Allow changes<small>Targeted list and setting changes, after a preview in chat.</small></span></label>
                <button className="nd-button" type="submit">{busy ? "Working…" : connection?.configured ? "Update connection" : "Connect to NextDNS"}<span aria-hidden="true">→</span></button>
              </fieldset>
            </form>
          )}
          <div className="nd-security"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="8" width="12" height="9" rx="2" stroke="currentColor"/><path d="M6 8V6a4 4 0 0 1 8 0v2" stroke="currentColor"/></svg><p>Your key is stored encrypted and used only to call NextDNS. Enter it here; you do not need to share it in chat.</p></div>
          {connection?.configured && <div className="nd-disconnect">{removeReady ? <><p>Delete your stored key and proposals?</p><div><button type="button" className="nd-textbutton nd-danger" onClick={remove} disabled={busy}>Yes, disconnect</button><button type="button" className="nd-textbutton" onClick={() => setRemoveReady(false)} disabled={busy}>Cancel</button></div></> : <button type="button" className="nd-textbutton" onClick={() => setRemoveReady(true)} disabled={busy}>Disconnect</button>}</div>}
          <div aria-live="polite" aria-atomic="true">{error && <p className="nd-message nd-error">{error}</p>}{notice && <p className="nd-message nd-success">{notice}</p>}</div>
        </section>
        <section className="nd-card nd-chat" aria-labelledby="chat-heading">
          <div className="nd-card-top"><span className="nd-step">02</span><h2 id="chat-heading">Continue in chat</h2></div>
          <p className="nd-chat-description">Select NextDNS Assistant in your conversation after installing the plugin. Each user connects their own NextDNS profile.</p>
          <p className="nd-footnote">The public plugin directory listing is being prepared. This connection page does not install the plugin.</p>
          <div className="nd-examples">{examples.map((example, i) => <article className="nd-example" key={example.label}><div><h3>{example.label}</h3><button type="button" className="nd-copy" onClick={() => copyExample(i)} aria-label={`Copy example: ${example.label}`}>{copied === i ? "Copied ✓" : "Copy ↗"}</button></div><p>{example.text}</p></article>)}</div>
          <div className="nd-capabilities"><span>Logs & analytics</span><span>Allowlist & denylist</span><span>Settings</span><span>Change history</span></div>
          <p className="nd-footnote">DNS logs are fetched on request. The plugin does not store a separate copy of fetched DNS logs. Your own change proposals and previous values can be viewed for approximately 30 days.</p>
        </section>
      </div>
      <footer className="nd-footer"><span>Free integration by Erik Le Blansch. Independent of NextDNS.</span><nav aria-label="More information"><a href="/privacy">Privacy & data</a><a href="/support">Help</a><a href="https://nextdns.github.io/api/" target="_blank" rel="noreferrer">API documentation ↗</a></nav></footer>
    </main>
  );
}
