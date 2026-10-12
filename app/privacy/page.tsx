import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy & gegevens | NextDNS Assistent" };

export default function Privacy() {
  return <main className="nd-shell nd-info">
    <a href="/">← NextDNS Assistent</a>
    <h1>Privacy & gegevens</h1>
    <p>NextDNS Assistent is een gratis, onafhankelijke integratie van Erik Le Blansch. Deze pagina beschrijft hoe de huidige versie gegevens verwerkt. Bijgewerkt op 12 oktober 2026.</p>
    <h2>Je eigen verbinding</h2>
    <p>Je koppelt zelf een NextDNS-profiel na het inloggen met ChatGPT. De app gebruikt de door het platform verstrekte gebruikers-ID om je verbinding en wijzigingsvoorstellen van die van andere gebruikers te scheiden. Er is geen gedeeld NextDNS-account.</p>
    <h2>Wat de app bewaart</h2>
    <p>De actieve opslag bevat je gebruikers-ID, versleutelde NextDNS-API-sleutel, profiel-ID en profielnaam, de instelling voor schrijfbevoegdheid en technische revisies en tijdstippen. De sleutel wordt met AES-256-GCM versleuteld en wordt niet teruggestuurd naar de browser of chat. De beheerder heeft technische beheermogelijkheden voor de gehoste app; dit is geen versleuteling waarbij alleen jij kunt ontsleutelen.</p>
    <p>Wijzigingsvoorstellen bevatten de gekozen domeinen of instellingen, oude en voorgestelde waarden, tijdstippen en het uitvoeringsresultaat. Voorstellen kunnen ongeveer dertig dagen worden teruggekeken. Oudere records worden opgeruimd wanneer dezelfde gebruiker een nieuw voorstel maakt. Dit is geen garantie dat ieder record na dertig dagen uit alle opslag verdwenen is.</p>
    <h2>Logs en resultaten in je gesprek</h2>
    <p>Op jouw verzoek haalt de app logs, statistieken, lijsten of instellingen op bij NextDNS. De app bewaart geen afzonderlijke kopie van de opgehaalde DNS-logs. Resultaten die je in de chat opvraagt gaan naar ChatGPT voor verwerking in je gesprek. Client- en lokale IP-adressen worden bij logresultaten standaard weggelaten; je kunt expliciet vragen ze mee te nemen. Domeinen, apparaatnamen en profielinstellingen kunnen ook persoonlijke informatie bevatten.</p>
    <h2>Hosting en andere diensten</h2>
    <p>De app gebruikt ChatGPT Sites en de Cloudflare Worker-runtime voor hosting en opslag, en de NextDNS API voor het gekoppelde profiel. De app bevat geen eigen advertentietrackers of analytics-script. De gebruikte platforms kunnen zelf authenticatiegegevens, verzoekmetadata, operationele logs en back-ups verwerken volgens hun eigen afspraken. Deze pagina doet geen toezegging over hun bewaartermijnen.</p>
    <h2>Ontkoppelen en intrekken</h2>
    <p>Met ‘Verbinding ontkoppelen’ op de startpagina verwijder je je opgeslagen verbinding en wijzigingsvoorstellen uit de actieve appdatabase. Je NextDNS-profiel en gegevens die al in je ChatGPT-gesprekken staan blijven bij die diensten bestaan. Je kunt ook je API-sleutel bij NextDNS intrekken; dat maakt de opgeslagen sleutel onbruikbaar.</p>
    <p className="nd-notice">De openbare plug-invermelding is nog in voorbereiding. Publicatievoorwaarden en de vereiste review moeten vóór directorypublicatie worden afgerond. Vragen en opmerkingen kunnen via GitHub Issues. Zie <a href="/support">Hulp</a> voor de huidige gebruiksinformatie.</p>
  </main>;
}
