import type { Operator, PrivacyFacts } from "@/lib/legal";
import {
  LegalSection,
  OperatorAddress,
  OperatorEmail,
} from "@/components/legal/legal-page";

// English translation of the privacy notice. Keep it in step with
// privacy-de.tsx.
export function PrivacyEn({
  operator,
  facts,
}: {
  operator: Operator;
  facts: PrivacyFacts;
}) {
  return (
    <>
      <p>Last updated: 27 September 2026</p>

      <LegalSection title="1. Controller">
        <p>The controller for data processing on this website is:</p>
        <OperatorAddress operator={operator} />
        <p>
          Email: <OperatorEmail operator={operator} />
        </p>
      </LegalSection>

      <LegalSection title="2. Hosting and server logs">
        <p>
          The website runs in a Docker container on a server that I operate
          myself with Dokploy.
          {facts.hostingProvider && (
            <>
              {" "}
              The server is hosted by {facts.hostingProvider}. The provider
              processes the data on my behalf.
            </>
          )}
        </p>
        <p>
          When you open a page, the server processes technically necessary
          data: IP address, date and time, requested address, HTTP status
          code, browser and operating system (user agent) and the previous
          page (referrer). This data can appear in logs of the server and of
          the application, for example in error messages.
        </p>
        <p>
          The purpose is to deliver the website, keep it secure and find
          errors. The legal basis is Art. 6(1)(f) GDPR. My legitimate interest
          is secure and stable operation.{" "}
          {facts.logRetentionDays !== null
            ? `Log entries are deleted after ${facts.logRetentionDays} days.`
            : "Log entries are deleted when they are no longer necessary for these purposes."}
        </p>
      </LegalSection>

      <LegalSection title="3. Ticket without an account (form)">
        <p>
          With the form you can send a report without a GitHub account. Only a
          title is required. All other data is optional: project,
          description, steps to reproduce, expected and actual behavior,
          environment, severity, additional information, contact for
          follow-up and a log file. The language of the page is sent too.
        </p>
        <p>
          My server creates an issue from this data in the public GitHub
          repository{" "}
          <a
            href="https://github.com/DooDesch/Support"
            target="_blank"
            rel="noopener noreferrer"
          >
            DooDesch/Support
          </a>{" "}
          and adds it to my GitHub project board. The server itself does not
          store the data.{" "}
          <strong>
            Everyone on the internet can see the issue, including your contact
            details.
          </strong>{" "}
          Do not write anything in the form that must not be public.
        </p>
        <p>
          To prevent abuse, the server checks your IP address against a limit
          of five reports per hour. For this, the IP address stays in memory
          for no more than one hour and is not written to disk. The server
          also sends the IP address to Cloudflare Turnstile (see section 6).
        </p>
        <p>
          The purpose is to handle your report and fix errors in my projects.
          The legal basis is Art. 6(1)(f) GDPR, and Art. 6(1)(b) GDPR where
          your report concerns a contract. The issue stays as a record of the
          fix. On request, I delete the issue or parts of it.
        </p>
      </LegalSection>

      <LegalSection title="4. Ticket with GitHub">
        <p>
          The &quot;Create with GitHub&quot; button opens github.com with your
          data as a draft. No data goes to my server. When you submit the
          issue on GitHub, it appears publicly under your GitHub account. The{" "}
          <a
            href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub privacy statement
          </a>{" "}
          applies.
        </p>
      </LegalSection>

      <LegalSection title="5. Log file">
        <p>
          Only your browser reads a log file. It shortens the file to the
          relevant parts and replaces usernames in file paths. For a ticket
          without an account, the shortened text goes to my server with the
          report and into the public issue. For a ticket with GitHub, your
          browser copies the text to the clipboard so that you paste it
          yourself.
        </p>
      </LegalSection>

      <LegalSection title="6. Spam protection with Cloudflare Turnstile">
        <p>
          Pages with the form load the Turnstile service of Cloudflare, Inc.
          (USA). Turnstile tells humans from bots. For this, Cloudflare
          processes your IP address and information from your browser. When
          you submit, my server checks the result with Cloudflare and sends
          your IP address.
        </p>
        <p>
          The legal basis is Art. 6(1)(f) GDPR. My legitimate interest is to
          protect the form from spam. The access to your browser is strictly
          necessary for this protection (§ 25(2) no. 2 TDDDG). More in the{" "}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare privacy policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="7. Analytics with Umami">
        <p>
          I measure the use of the website with Umami. Umami is self-hosted at
          stats.doodesch.de and sets no cookies. It records the page, the
          previous page, browser, operating system, device type, screen size,
          language and the country derived from the IP address. It also
          records clicks on the Discord, ticket and submit buttons and the
          attachment of a log file. Umami does not store the IP address. Umami
          runs on the same server as this website. The statistics stay stored
          until I delete them.
        </p>
        <p>
          The purpose is to see which pages and paths people use. The legal
          basis is Art. 6(1)(f) GDPR. The data goes to no one else.
        </p>
      </LegalSection>

      <LegalSection title="8. Cookies and local storage">
        <p>The website sets no tracking cookies. It only stores:</p>
        <ul>
          <li>
            the cookie <code>NEXT_LOCALE</code> with your language (de or en)
            when you switch the language or it differs from your browser
            language. It is deleted when you close the browser.
          </li>
          <li>
            the entry <code>theme</code> in the local storage of your browser
            when you switch between the light and dark theme.
          </li>
        </ul>
        <p>
          Both are strictly necessary for the function you ask for (§ 25(2)
          no. 2 TDDDG). You can delete both in your browser at any time.
        </p>
      </LegalSection>

      <LegalSection title="9. Fonts">
        <p>
          The fonts come from my server. There is no connection to Google or
          other font providers.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact by email">
        <p>
          When you send me an email, I process your address and the content to
          reply. The legal basis is Art. 6(1)(f) GDPR, and Art. 6(1)(b) GDPR
          where your request concerns a contract. I delete the email when the
          request is done and no legal duty to keep it applies.
        </p>
      </LegalSection>

      <LegalSection title="11. Links to other sites">
        <p>
          The website links to Discord, GitHub and Ko-fi. Data only goes to
          these providers when you click a link. From then on, the privacy
          policy of that provider applies.
        </p>
      </LegalSection>

      <LegalSection title="12. Recipients and transfer to the USA">
        <p>The recipients of your data are:</p>
        <ul>
          <li>GitHub, Inc. (USA) for tickets (sections 3 and 4)</li>
          <li>Cloudflare, Inc. (USA) for spam protection (section 6)</li>
          {facts.hostingProvider && (
            <li>{facts.hostingProvider} for hosting (section 2)</li>
          )}
        </ul>
        <p>
          The transfer to the USA is based on the adequacy decision of the
          European Commission for the EU-US Data Privacy Framework (Art. 45
          GDPR). GitHub and Cloudflare are certified under it.
        </p>
      </LegalSection>

      <LegalSection title="13. Your rights">
        <p>You have the right to:</p>
        <ul>
          <li>access your data (Art. 15 GDPR)</li>
          <li>rectification (Art. 16 GDPR)</li>
          <li>erasure (Art. 17 GDPR)</li>
          <li>restriction of processing (Art. 18 GDPR)</li>
          <li>data portability (Art. 20 GDPR)</li>
          <li>
            object to processing based on Art. 6(1)(f) GDPR (Art. 21 GDPR)
          </li>
        </ul>
        <p>
          To use these rights, send an email to{" "}
          <OperatorEmail operator={operator} />.
        </p>
      </LegalSection>

      <LegalSection title="14. Right to complain">
        <p>
          You can complain to a data protection supervisory authority,
          especially in the EU member state where you live, where you work or
          where the suspected violation took place (Art. 77 GDPR).
        </p>
      </LegalSection>
    </>
  );
}
