import type { Metadata } from "next";

export const metadata: Metadata = { title: "Hulp | NextDNS Assistent" };

export default function Support() {
  return <main className="nd-shell nd-info">
    <a href="/">← NextDNS Assistent</a>
    <h1>Hulp bij NextDNS Assistent</h1>
    <h2>Vragen en opmerkingen</h2>
    <p>Gebruik <a href="https://github.com/erikleblansch/nextdns-assistent/issues" target="_blank" rel="noreferrer">GitHub Issues</a> voor een vraag, foutmelding of suggestie. Deze berichten zijn openbaar; laat API-sleutels, profiel-ID’s, IP-adressen en persoonlijke logs weg.</p>
    <h2>Een schrijf- of verwijderactie ontbreekt</h2>
    <p>Schakel ‘Wijzigingen toestaan’ alleen in als je vanuit de chat wilt wijzigen. Selecteer de plug-in opnieuw of vernieuw de verbinding als een chat alleen leesacties ziet. De server maakt voor een verwijdering eerst een wijzigingsvoorstel en voert dat daarna uit; een aparte verwijdertool is niet nodig. Geef in je verzoek duidelijk de lijst en het domein aan.</p>
    <h2>Verbinden lukt niet</h2>
    <p>Controleer het profiel-ID van zes tekens en de API-sleutel onderaan je NextDNS-accountpagina. Een ingetrokken sleutel moet worden vervangen. Probeer het later opnieuw bij een tijdelijke netwerkfout of wanneer NextDNS te veel aanvragen ontvangt.</p>
    <h2>Een voorstel wordt geweigerd</h2>
    <p>Voorstellen verlopen na tien minuten. Een wijziging aan de verbinding of aan de betrokken waarden kan een voorstel ongeldig maken. Vraag de chat dan om de actuele waarden te lezen en een nieuw voorstel te maken. Bij een onzekere of gedeeltelijke uitvoering moet eerst de huidige toestand worden gecontroleerd.</p>
    <h2>Gegevens verwijderen</h2>
    <p>Je kunt je eigen verbinding en wijzigingsvoorstellen verwijderen via ‘Verbinding ontkoppelen’ op de startpagina. Zie ook <a href="/privacy">Privacy & gegevens</a>.</p>
    <p className="nd-notice">De directorypublicatie is nog in voorbereiding. Deel bij foutmeldingen nooit je API-sleutel of onnodige DNS-logs.</p>
  </main>;
}
