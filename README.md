# NextDNS Assistent

NextDNS-loganalyse en gericht profielbeheer vanuit ChatGPT. Een gratis,
onafhankelijke integratie van **Erik Le Blansch**; geen officieel NextDNS-product.

## Beschikbaarheid

De broncode staat openbaar op GitHub. De bestaande ChatGPT-plug-in werkt privé; publicatie in de openbare plug-indirectory is nog niet
ingediend of goedgekeurd. Het publiceren van deze code installeert de plug-in
niet automatisch en maakt geen toegang tot een NextDNS-account openbaar.

## Wat de integratie kan

- DNS-logs lezen en een begrensd tijdvenster samenvatten.
- Officiële querytotalen en tijdreeksen ophalen.
- Beveiliging, privacy en overige profielinstellingen uitlezen.
- Specifieke allowlist- en denylistregels toevoegen, verwijderen of activeren.
- Gerichte booleaanse instellingen voorstellen en uitvoeren.
- Oude waarden en resultaten van eigen wijzigingsvoorstellen terugkijken.

Een wijziging begint met een voorvertoning. Uitvoering vereist toestemming van
de gebruiker en ingeschakelde schrijfbevoegdheid. De huidige waarden worden
gecontroleerd en de uitkomst wordt teruggelezen. Meerdere wijzigingen zijn niet
atomair; gedeeltelijke of onzekere uitkomsten worden niet automatisch herhaald.
De integratie maakt of verwijdert geen profielen en wist geen DNS-logs.

## Vragen en opmerkingen

Open een [GitHub Issue](https://github.com/erikleblansch/nextdns-assistent/issues).
Gebruik het formulier voor een foutmelding, vraag of suggestie. **Issues zijn
openbaar:** deel geen API-sleutels, profiel-ID's, IP-adressen of persoonlijke
logexports. De Issue-formulieren vragen alleen om de informatie die voor het
beschrijven van het probleem nodig is.

## Privacy

Elke gebruiker koppelt zijn eigen profiel via het verbindingsscherm. De sleutel
hoeft niet in de chat en is versleuteld opgeslagen met AES-256-GCM en binding
aan de platformgebruikers-ID. De beheerder heeft technische beheermogelijkheden;
dit is geen versleuteling waarbij alleen de gebruiker kan ontsleutelen.

De app bewaart geen afzonderlijke kopie van de opgehaalde DNS-logs. Opgevraagde
resultaten gaan wel naar ChatGPT voor verwerking in het gesprek. Client- en
lokale IP-adressen worden standaard uit logresultaten verwijderd. Voorstellen,
oude waarden en uitvoeringsresultaten worden door de app bewaard. Ontkoppelen
verwijdert de actieve appverbinding en voorstellen.

Meer informatie: [privacybeschrijving](docs/privacy.md) en
[conceptgebruiksvoorwaarden](docs/terms.md).

## Ontwikkeling

De app gebruikt React, Vinext/Vite, Cloudflare Workers en D1. Sites verzorgt
de ChatGPT-authenticatie en de MCP/OAuth-verbinding. De taal van de interface
en toolbeschrijvingen is Nederlands.

Vereist: Node.js 22.13 of hoger; de tests zijn uitgevoerd met Node.js 22 en
de ingebouwde SQLite-ondersteuning. De package manager staat in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

Voor eigen hosting via Sites registreer je een **eigen** project, configureer
je de D1-binding `DB`, voer je de SQL-migratie uit en stel je de serversecret
`NEXTDNS_ENCRYPTION_KEY` in. `.env.example` bevat alleen de naam, geen waarde.
Die secret is een willekeurige sleutel van 32 bytes, Base64-gecodeerd; bewaar
dezelfde secret om bestaande verbindingen te kunnen ontsleutelen.

De opgenomen `.openai/hosting.json` bevat bewust geen bestaand project-ID.
Gebruik de gebruikelijke Sites-workflow om je eigen project te registreren
en de identiteit van dat project vast te leggen.

Productieroutes vertrouwen alleen de gebruikersidentiteit die Sites injecteert.
Een los gehoste Worker heeft een eigen vertrouwde authenticatielaag nodig;
rechtstreeks aangeleverde identiteitheaders zijn daarvoor geen authenticatie.
De lokale mock-authenticatie van de starter is alleen voor ontwikkeling.

## Code en controles

- `lib/nextdns-core.mjs`: API-client, versleuteling, MCP-tools en wijzigingsplannen.
- `app/api/connection/route.ts`: accountgebonden koppelen en ontkoppelen.
- `app/mcp/route.ts`: stateless Streamable HTTP MCP-endpoint.
- `app/setup-screen.tsx`: verbindingsscherm en voorbeeldvragen.
- `db/` en `drizzle/`: opslagstructuur en SQL-migratie; geen opgeslagen gegevens.
- `tests/`: zeventien controles met uitsluitend synthetische gegevens.
- `publication/`: conceptmetadata en reviewgevallen voor de directory.

De zeventien implementatiecontroles slagen, inclusief gebruikersscheiding,
anonieme ontdekking, gerichte verwijdering, sleutelafscherming, paginering,
verlopen/verouderde voorstellen en de native Worker-fetch-runtime. De acht
directoryreviewprompts zijn nog niet uitgevoerd in een onafhankelijke
reviewerinstallatie.

Deze bronexport bevat geen database, runtimegegevens, omgevingssecret,
persoonlijke NextDNS-profiel-ID of oorspronkelijke Git-geschiedenis.
Derdepartijlicenties blijven bij de betreffende bestanden aanwezig.

Officiële API-documentatie: <https://nextdns.github.io/api/>.
