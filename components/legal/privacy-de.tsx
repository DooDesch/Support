import type { Operator, PrivacyFacts } from "@/lib/legal";
import {
  LegalSection,
  OperatorAddress,
  OperatorEmail,
} from "@/components/legal/legal-page";

// German privacy notice (Datenschutzerklärung). Keep it in step with
// privacy-en.tsx and with what the code really processes.
export function PrivacyDe({
  operator,
  facts,
}: {
  operator: Operator;
  facts: PrivacyFacts;
}) {
  return (
    <>
      <p>Stand: 27. September 2026</p>

      <LegalSection title="1. Verantwortlicher">
        <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
        <OperatorAddress operator={operator} />
        <p>
          E-Mail: <OperatorEmail operator={operator} />
        </p>
      </LegalSection>

      <LegalSection title="2. Hosting und Server-Logs">
        <p>
          Die Website läuft in einem Docker-Container auf einem Server, den ich
          selbst mit Dokploy betreibe.
          {facts.hostingProvider && (
            <>
              {" "}
              Der Server steht bei {facts.hostingProvider}. Der Anbieter
              verarbeitet die Daten in meinem Auftrag.
            </>
          )}
        </p>
        <p>
          Beim Aufruf einer Seite verarbeitet der Server technisch nötige
          Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse,
          HTTP-Statuscode, Browser und Betriebssystem (User-Agent) und die
          zuvor besuchte Seite (Referrer). Diese Daten können in Logs des
          Servers und der Anwendung stehen, zum Beispiel bei Fehlermeldungen.
        </p>
        <p>
          Zweck ist die Auslieferung der Website, ihre Sicherheit und die
          Fehlersuche. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein
          berechtigtes Interesse ist ein sicherer und stabiler Betrieb.{" "}
          {facts.logRetentionDays !== null
            ? `Log-Einträge werden nach ${facts.logRetentionDays} Tagen gelöscht.`
            : "Log-Einträge werden gelöscht, sobald sie für diese Zwecke nicht mehr nötig sind."}
        </p>
      </LegalSection>

      <LegalSection title="3. Ticket ohne Konto (Formular)">
        <p>
          Mit dem Formular kannst du ohne GitHub-Konto eine Meldung senden.
          Pflicht ist nur ein Titel. Alle anderen Angaben sind freiwillig:
          Projekt, Beschreibung, Schritte zur Reproduktion, erwartetes und
          tatsächliches Verhalten, Umgebung, Schweregrad, weitere
          Informationen, Kontakt für Rückfragen und eine Logdatei. Dazu kommt
          die Sprache der Seite.
        </p>
        <p>
          Mein Server legt aus diesen Angaben ein Issue im öffentlichen
          GitHub-Repository{" "}
          <a
            href="https://github.com/DooDesch/Support"
            target="_blank"
            rel="noopener noreferrer"
          >
            DooDesch/Support
          </a>{" "}
          an und ordnet es meinem GitHub-Projektboard zu. Der Server selbst
          speichert die Angaben nicht.{" "}
          <strong>
            Das Issue ist für alle im Internet sichtbar, auch deine
            Kontaktangabe.
          </strong>{" "}
          Schreib nichts in das Formular, das nicht öffentlich sein soll.
        </p>
        <p>
          Gegen Missbrauch prüft der Server deine IP-Adresse gegen ein Limit
          von fünf Meldungen pro Stunde. Die IP-Adresse liegt dafür höchstens
          eine Stunde im Arbeitsspeicher und wird nicht auf die Festplatte
          geschrieben. Außerdem gibt der Server die IP-Adresse an Cloudflare
          Turnstile weiter (siehe Abschnitt 6).
        </p>
        <p>
          Zweck ist die Bearbeitung deiner Meldung und die Fehlerbehebung in
          meinen Projekten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO,
          soweit deine Meldung einen Vertrag betrifft Art. 6 Abs. 1 lit. b
          DSGVO. Das Issue bleibt als Nachweis zur Fehlerbehebung bestehen.
          Auf Anfrage lösche ich das Issue oder einzelne Angaben daraus.
        </p>
      </LegalSection>

      <LegalSection title="4. Ticket mit GitHub">
        <p>
          Der Knopf „Mit GitHub erstellen“ öffnet github.com mit deinen
          Angaben als Vorlage. Dabei gehen keine Daten an meinen Server. Wenn
          du das Issue auf GitHub absendest, erscheint es öffentlich unter
          deinem GitHub-Konto. Dafür gilt die{" "}
          <a
            href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzerklärung von GitHub
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Logdatei">
        <p>
          Eine Logdatei liest nur dein Browser. Er kürzt sie auf die wichtigen
          Teile und ersetzt Benutzernamen in Dateipfaden. Beim Ticket ohne
          Konto geht der gekürzte Text mit der Meldung an meinen Server und in
          das öffentliche Issue. Beim Ticket mit GitHub kopiert dein Browser
          den Text in die Zwischenablage, damit du ihn selbst einfügst.
        </p>
      </LegalSection>

      <LegalSection title="6. Spam-Schutz mit Cloudflare Turnstile">
        <p>
          Auf Seiten mit dem Formular lädt der Dienst Turnstile der Cloudflare,
          Inc. (USA). Turnstile unterscheidet Menschen von Bots. Dafür
          verarbeitet Cloudflare deine IP-Adresse und Informationen aus deinem
          Browser. Beim Absenden prüft mein Server das Ergebnis bei Cloudflare
          und übermittelt dabei deine IP-Adresse.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes
          Interesse ist der Schutz des Formulars vor Spam. Der Zugriff auf
          deinen Browser ist für diesen Schutz unbedingt erforderlich (§ 25
          Abs. 2 Nr. 2 TDDDG). Mehr dazu in der{" "}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzerklärung von Cloudflare
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Reichweitenmessung mit Umami">
        <p>
          Ich messe die Nutzung der Website mit Umami. Umami läuft selbst
          gehostet unter stats.doodesch.de und setzt keine Cookies. Erfasst
          werden aufgerufene Seite, zuvor besuchte Seite, Browser,
          Betriebssystem, Gerätetyp, Bildschirmgröße, Sprache und das aus der
          IP-Adresse abgeleitete Land. Dazu kommen Klicks auf die Knöpfe für
          Discord, Ticket und Absenden und das Anhängen einer Logdatei. Umami
          speichert die IP-Adresse nicht.
        </p>
        <p>
          Zweck ist zu sehen, welche Seiten und Wege genutzt werden.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Die Daten gehen an
          niemanden weiter.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies und lokaler Speicher">
        <p>Die Website setzt keine Tracking-Cookies. Sie speichert nur:</p>
        <ul>
          <li>
            das Cookie <code>NEXT_LOCALE</code> mit deiner Sprache (de oder
            en), wenn du die Sprache wechselst oder sie von der Sprache deines
            Browsers abweicht. Es wird beim Schließen des Browsers gelöscht.
          </li>
          <li>
            den Eintrag <code>theme</code> im lokalen Speicher deines Browsers,
            wenn du zwischen hellem und dunklem Design wechselst.
          </li>
        </ul>
        <p>
          Beides ist für die gewünschte Funktion unbedingt erforderlich (§ 25
          Abs. 2 Nr. 2 TDDDG). Du kannst beides jederzeit in deinem Browser
          löschen.
        </p>
      </LegalSection>

      <LegalSection title="9. Schriftarten">
        <p>
          Die Schriftarten kommen von meinem Server. Es gibt keine Verbindung
          zu Google oder anderen Schriftanbietern.
        </p>
      </LegalSection>

      <LegalSection title="10. Kontakt per E-Mail">
        <p>
          Wenn du mir eine E-Mail schreibst, verarbeite ich deine Adresse und
          den Inhalt, um dir zu antworten. Rechtsgrundlage ist Art. 6 Abs. 1
          lit. f DSGVO, soweit deine Anfrage einen Vertrag betrifft Art. 6
          Abs. 1 lit. b DSGVO. Ich lösche die E-Mail, wenn die Anfrage erledigt
          ist und keine gesetzliche Pflicht zur Aufbewahrung besteht.
        </p>
      </LegalSection>

      <LegalSection title="11. Links zu anderen Seiten">
        <p>
          Die Website verlinkt auf Discord, GitHub und Ko-fi. Daten gehen erst
          an diese Anbieter, wenn du einen Link anklickst. Ab dann gilt die
          Datenschutzerklärung des jeweiligen Anbieters.
        </p>
      </LegalSection>

      <LegalSection title="12. Empfänger und Übermittlung in die USA">
        <p>Empfänger deiner Daten sind:</p>
        <ul>
          <li>GitHub, Inc. (USA) für Tickets (Abschnitte 3 und 4)</li>
          <li>Cloudflare, Inc. (USA) für den Spam-Schutz (Abschnitt 6)</li>
          {facts.hostingProvider && (
            <li>{facts.hostingProvider} für das Hosting (Abschnitt 2)</li>
          )}
        </ul>
        <p>
          Die Übermittlung in die USA stützt sich auf den
          Angemessenheitsbeschluss der EU-Kommission zum EU-US Data Privacy
          Framework (Art. 45 DSGVO). GitHub und Cloudflare sind danach
          zertifiziert.
        </p>
      </LegalSection>

      <LegalSection title="13. Deine Rechte">
        <p>Du hast gegenüber mir das Recht auf:</p>
        <ul>
          <li>Auskunft über deine Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>
            Widerspruch gegen Verarbeitungen nach Art. 6 Abs. 1 lit. f DSGVO
            (Art. 21 DSGVO)
          </li>
        </ul>
        <p>
          Schreib dafür eine E-Mail an <OperatorEmail operator={operator} />.
        </p>
      </LegalSection>

      <LegalSection title="14. Beschwerderecht">
        <p>
          Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren,
          besonders in dem EU-Mitgliedstaat deines Wohnorts, deines
          Arbeitsplatzes oder des mutmaßlichen Verstoßes (Art. 77 DSGVO).
        </p>
      </LegalSection>
    </>
  );
}
