# Privacy & gegevens — NextDNS Assistent

**Maker:** Erik Le Blansch. **Bijgewerkt:** 12 oktober 2026.

NextDNS Assistent is een gratis, onafhankelijke integratie. Deze pagina
beschrijft de gegevensverwerking van de huidige implementatie.

## Accountgebonden gegevens

Je logt in met ChatGPT en koppelt zelf een NextDNS-profiel. De platform-
gebruikers-ID scheidt je gegevens van die van andere gebruikers. De actieve
database bevat die gebruikers-ID, je versleutelde API-sleutel, profiel-ID,
profielnaam, schrijfbevoegdheid en technische revisies en tijdstippen.

Sleutels worden met AES-256-GCM versleuteld en aan de gebruikers-ID gebonden.
De app stuurt de opgeslagen sleutel niet terug naar de browser of chat.
De beheerder heeft technische beheermogelijkheden voor de gehoste app;
deze opslag is geen versleuteling waarbij alleen jij kunt ontsleutelen.

## Resultaten en wijzigingsvoorstellen

Op jouw verzoek haalt de app logs, statistieken, lijsten en instellingen op
bij NextDNS. Er wordt geen afzonderlijke kopie van de opgehaalde DNS-logs
bewaard. Resultaten die je in je gesprek opvraagt gaan naar ChatGPT. Domeinen,
apparaatnamen en instellingen kunnen persoonlijke informatie bevatten.
Client- en lokale IP-adressen worden standaard uit logresultaten weggelaten;
je kunt expliciet vragen ze mee te nemen.

De app bewaart wijzigingsvoorstellen, oude en nieuwe waarden, de betrokken
domeinen of instellingen, tijdstippen en uitvoeringsresultaten. Die voorstellen
zijn ongeveer dertig dagen terug te bekijken. Oudere records worden verwijderd
wanneer dezelfde gebruiker een nieuw voorstel maakt. Dit is geen garantie dat
ieder record binnen dertig dagen uit alle opslag wordt verwijderd.

## Hosting

De app gebruikt ChatGPT Sites, de Cloudflare Worker-runtime en de NextDNS API.
Er zijn geen eigen advertentietrackers of analytics-scripts. De platforms
kunnen zelf authenticatiegegevens, verzoekmetadata, operationele logs en
back-ups verwerken. Deze beschrijving doet geen toezegging over hun
bewaartermijnen of gebruik van gegevens; daarvoor gelden hun eigen afspraken.

## Verwijderen en intrekken

Met **Verbinding ontkoppelen** verwijder je je opgeslagen verbinding en
wijzigingsvoorstellen uit de actieve appdatabase. Daarmee wis je geen
NextDNS-profiel en geen bestaande ChatGPT-gesprekken. Je kunt je API-sleutel
ook bij NextDNS intrekken.

## Vragen en opmerkingen

Voor vragen en opmerkingen kun je terecht bij [GitHub Issues](https://github.com/erikleblansch/nextdns-assistent/issues).
Die berichten zijn openbaar: vermeld daar geen sleutels, profiel-ID's,
IP-adressen of persoonlijke logs. Voor het verwijderen van je eigen actieve
appgegevens gebruik je de ontkoppelfunctie.

De directorypublicatie is nog in voorbereiding. De maker moet aanvullende
privacy- en publicatiebeslissingen en de vereiste portaalverklaringen afronden
voordat de openbare dienst wordt ingediend.
