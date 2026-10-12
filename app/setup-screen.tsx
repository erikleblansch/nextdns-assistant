"use client";

import { useEffect, useState, type FormEvent } from "react";

type Connection = { configured: boolean; profile_id?: string; profile_name?: string; allow_writes: boolean; updated_at?: string };
const examples = [
  { label: "Logs onderzoeken", text: "Analyseer mijn NextDNS-logs van de afgelopen 24 uur. Geef uitgebreide adviezen voor tracking en telemetrie, optionele functies en onvoldoende geverifieerde domeinen. Houd e-maillinks en afbeeldingen werkend." },
  { label: "Instellingen nakijken", text: "Lees mijn NextDNS-instellingen en leg uit welke verbeteringen zinvol zijn, inclusief het effect en de huidige waarden." },
  { label: "Blokkade verklaren", text: "Zoek in mijn NextDNS-logs waarom deze website geblokkeerd wordt en stel zo nodig een gerichte uitzondering voor." },
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
      if (!res.ok) throw new Error(body.error ?? "Verbindingsstatus niet beschikbaar.");
      if (active) { setConnection(body); setProfileId(body.profile_id ?? ""); setAllowWrites(Boolean(body.allow_writes)); }
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [signedIn]);

  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice(""); setRemoveReady(false);
    try {
      const res = await fetch("/api/connection", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ apiKey, profileId: profileId.trim().toLowerCase(), allowWrites }) });
      const body = await res.json() as Connection & { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Verbinden is niet gelukt.");
      setConnection(body); setApiKey(""); setProfileId(body.profile_id ?? ""); setAllowWrites(body.allow_writes);
      setNotice(`Verbonden met ${body.profile_name}. Je kunt de NextDNS-plug-in nu in de chat gebruiken.`);
    } catch (err) { setError(err instanceof Error ? err.message : "Verbinden is niet gelukt."); }
    finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true); setError(""); setNotice("");
    try {
      const res = await fetch("/api/connection", { method: "DELETE" });
      const body = await res.json() as Connection & { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Ontkoppelen is niet gelukt.");
      setConnection(body); setApiKey(""); setProfileId(""); setAllowWrites(false); setRemoveReady(false);
      setNotice("De opgeslagen sleutel en wijzigingsvoorstellen zijn verwijderd. Je NextDNS-profiel blijft bestaan.");
    } catch (err) { setError(err instanceof Error ? err.message : "Ontkoppelen is niet gelukt."); }
    finally { setBusy(false); }
  }

  async function copyExample(index: number) {
    try { await navigator.clipboard.writeText(examples[index].text); setCopied(index); }
    catch { setError("Kopiëren is niet beschikbaar. Selecteer de voorbeeldtekst om hem te kopiëren."); }
  }

  return (
    <main className="nd-shell">
      <header className="nd-header">
        <a href="/" className="nd-brand" aria-label="NextDNS Assistent startpagina">
          <span className="nd-logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3 20 6v6c0 4-5 7-8 9-3-2-8-5-8-9V6l8-3Z" stroke="currentColor" strokeWidth="1.5"/><path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.5"/></svg></span>
          <span>NextDNS <span className="nd-dim">Assistent</span></span>
        </a>
        <span className="nd-private"><span aria-hidden="true">◌</span> Je eigen profiel</span>
      </header>
      <section className="nd-intro">
        <p className="nd-eyebrow">JE DNS, BINNEN HANDBEREIK</p>
        <h1>Meer inzicht.<br/><span>Minder handwerk.</span></h1>
        <p>Onderzoek je NextDNS-logs, begrijp je instellingen en beheer je lijsten vanuit ChatGPT.</p>
      </section>
      <div className="nd-grid">
        <section className="nd-card nd-connection" aria-labelledby="connection-heading">
          <div className="nd-card-top"><span className="nd-step">01</span><h2 id="connection-heading">Koppel je profiel</h2></div>
          <div className="nd-status" role="status">
            <span className={`nd-dot ${connection?.configured ? "nd-connected" : ""}`} aria-hidden="true"/>
            <span>{loading ? "Verbindingsstatus laden…" : connection?.configured ? `${connection.profile_name} · ${connection.profile_id}` : "Nog niet gekoppeld"}</span>
            {connection?.configured && <small>{connection.allow_writes ? "Lezen & wijzigen" : "Alleen lezen"}</small>}
          </div>
          {!signedIn ? <div className="nd-signin"><p>Log in met je ChatGPT-account om je eigen sleutel veilig te koppelen.</p><a className="nd-button" href="/signin-with-chatgpt?return_to=%2F" target="_top">Inloggen met ChatGPT <span aria-hidden="true">↗</span></a></div> : (
            <form onSubmit={save}>
              <fieldset disabled={busy || loading}>
                <label htmlFor="api-key">API-sleutel <span>{connection?.configured ? "opgeslagen" : "vereist"}</span></label>
                <input id="api-key" name="nextdns-api-key" type="password" autoComplete="off" spellCheck={false} value={apiKey} onChange={e => setApiKey(e.target.value)} required={!connection?.configured} placeholder={connection?.configured ? "Laat leeg om je bestaande sleutel te gebruiken" : "Plak hier je NextDNS-API-sleutel"} maxLength={200} aria-describedby="key-help"/>
                <p id="key-help" className="nd-help">Je vindt deze onderaan je <a href="https://my.nextdns.io/account" target="_blank" rel="noreferrer">NextDNS-accountpagina ↗</a>.</p>
                <label htmlFor="profile-id">Profiel-ID <span>6 tekens</span></label>
                <input id="profile-id" name="profile-id" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} value={profileId} onChange={e => setProfileId(e.target.value)} required placeholder="abc123" minLength={6} maxLength={6} pattern="[A-Za-z0-9]{6}" aria-describedby="profile-help"/>
                <p id="profile-help" className="nd-help">De ID op de tab Instellen van je NextDNS-profiel.</p>
                <label className="nd-check"><input type="checkbox" checked={allowWrites} onChange={e => setAllowWrites(e.target.checked)}/><span>Wijzigingen toestaan<small>Gerichte wijzigingen aan lijsten en instellingen, na een voorvertoning in de chat.</small></span></label>
                <button className="nd-button" type="submit">{busy ? "Bezig…" : connection?.configured ? "Verbinding bijwerken" : "Verbind met NextDNS"}<span aria-hidden="true">→</span></button>
              </fieldset>
            </form>
          )}
          <div className="nd-security"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="4" y="8" width="12" height="9" rx="2" stroke="currentColor"/><path d="M6 8V6a4 4 0 0 1 8 0v2" stroke="currentColor"/></svg><p>Je sleutel wordt versleuteld opgeslagen en alleen gebruikt om NextDNS aan te spreken. Vul hem hier in; hij hoeft niet in de chat.</p></div>
          {connection?.configured && <div className="nd-disconnect">{removeReady ? <><p>De opgeslagen sleutel en voorstellen verwijderen?</p><div><button type="button" className="nd-textbutton nd-danger" onClick={remove} disabled={busy}>Ja, ontkoppelen</button><button type="button" className="nd-textbutton" onClick={() => setRemoveReady(false)} disabled={busy}>Annuleren</button></div></> : <button type="button" className="nd-textbutton" onClick={() => setRemoveReady(true)} disabled={busy}>Verbinding ontkoppelen</button>}</div>}
          <div aria-live="polite" aria-atomic="true">{error && <p className="nd-message nd-error">{error}</p>}{notice && <p className="nd-message nd-success">{notice}</p>}</div>
        </section>
        <section className="nd-card nd-chat" aria-labelledby="chat-heading">
          <div className="nd-card-top"><span className="nd-step">02</span><h2 id="chat-heading">Ga verder in de chat</h2></div>
          <p className="nd-chat-description">Selecteer NextDNS Assistent in je gesprek nadat je de plug-in hebt geïnstalleerd. Iedere gebruiker koppelt zijn eigen NextDNS-profiel.</p>
          <p className="nd-footnote">De openbare vermelding in de plug-indirectory is in voorbereiding. Deze verbindingspagina is geen installatieknop.</p>
          <div className="nd-examples">{examples.map((example, i) => <article className="nd-example" key={example.label}><div><h3>{example.label}</h3><button type="button" className="nd-copy" onClick={() => copyExample(i)} aria-label={`Kopieer voorbeeld: ${example.label}`}>{copied === i ? "Gekopieerd ✓" : "Kopiëren ↗"}</button></div><p>{example.text}</p></article>)}</div>
          <div className="nd-capabilities"><span>Logs & statistieken</span><span>Allowlist & denylist</span><span>Instellingen</span><span>Wijzigingshistorie</span></div>
          <p className="nd-footnote">Je DNS-logs worden op verzoek opgehaald. De plug-in bewaart geen kopie van je browsegeschiedenis. Je eigen wijzigingsvoorstellen en oude waarden zijn tot 30 dagen terug te bekijken.</p>
        </section>
      </div>
      <footer className="nd-footer"><span>Gratis integratie van Erik Le Blansch. Onafhankelijk van NextDNS.</span><nav aria-label="Meer informatie"><a href="/privacy">Privacy & gegevens</a><a href="/support">Hulp</a><a href="https://nextdns.github.io/api/" target="_blank" rel="noreferrer">API-documentatie ↗</a></nav></footer>
    </main>
  );
}
