export function PrivacyView() {
  return (
    <div className="privacy">
      <a className="privacy-back" href="/">
        ← back to oculé
      </a>

      <article className="privacy-doc">
        <header className="privacy-header">
          <h1>Privacy</h1>
          <p className="privacy-lede">Oculé doesn't collect anything.</p>
        </header>

        <p>
          This app runs entirely in your browser. There is no backend, no
          server, no account, no analytics, no cookies. Everything you paste,
          every word you read, every setting you tweak — none of it leaves
          your computer.
        </p>

        <section className="privacy-section">
          <h2>What's stored locally</h2>
          <ul>
            <li>
              Your last reading session — the text, your position, and your
              speed — so you can resume where you left off.
            </li>
            <li>
              Your settings — theme, font, font size, mode, the various
              sliders.
            </li>
          </ul>
          <p>
            Both live in your browser's <code>localStorage</code>. Clearing
            your browser data clears them. We can't see them and have no way
            to.
          </p>
        </section>

        <section className="privacy-section">
          <h2>What we don't do</h2>
          <ul>
            <li>Track you across sessions or sites.</li>
            <li>Run analytics or telemetry.</li>
            <li>Set cookies.</li>
            <li>Send your text to a language model or any third party.</li>
            <li>Serve targeted ads (or any ads).</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2>What's external</h2>
          <p>
            Fonts (Monaspace Xenon, OpenDyslexic) load from the jsDelivr CDN.
            The CDN may keep its own request logs; we don't see them and have
            no relationship with them beyond fetching the font files.
          </p>
          <p>
            If you choose to support the project through a tip page, that
            page is hosted by a third-party payment provider with its own
            privacy policy. We don't receive your card details.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Companion Chrome extension</h2>
          <p>
            When you click the Oculé extension on an article page, it
            extracts the article text using Mozilla Readability — which runs
            locally in your browser — and hands the result to{' '}
            <code>ocule.app</code> through one of several browser-internal
            transports (URL parameter, browser storage, or in-browser
            messaging). The text travels from one tab to another in your
            browser; it doesn't go through any server.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Changes to this policy</h2>
          <p>
            If anything material changes — for instance, if Oculé ever adds a
            backend feature — this page will be updated and the date below
            will reflect the change.
          </p>
        </section>

        <footer className="privacy-footer">
          <p>Last updated: 27 April 2026.</p>
          <p>
            Questions? Open an issue on{' '}
            <a
              href="https://github.com/morganthen/ocule"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </footer>
      </article>
    </div>
  );
}
