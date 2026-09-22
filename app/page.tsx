"use client";

import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Nikboni home">
          <span className="brand-mark">N</span>
          <span>Nikboni</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </nav>
      </header>

      <main id="top" className="main-content">
        <section className="intro" id="about">
          <p className="eyebrow">Independent digital studio</p>
          <h1>
            Ideas with a quieter kind of <em>clarity.</em>
          </h1>
          <p className="intro-copy">
            Nikboni is a space for thoughtful work, useful tools, and simple
            digital experiences made to last.
          </p>
          <a className="primary-link" href="#contact">
            Start a conversation <span aria-hidden="true">↗</span>
          </a>
        </section>

        <section className="signal-grid" aria-label="Nikboni principles">
          <article>
            <span className="number">01</span>
            <h2>Less noise</h2>
            <p>
              Clear interfaces and considered details that give your attention
              somewhere good to land.
            </p>
          </article>
          <article>
            <span className="number">02</span>
            <h2>More meaning</h2>
            <p>
              Every element has a reason to be here, from the first glance to
              the final interaction.
            </p>
          </article>
          <article>
            <span className="number">03</span>
            <h2>Made with care</h2>
            <p>
              Small, durable digital work for people who notice the difference.
            </p>
          </article>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div>
          <p className="footer-title">Have something in mind?</p>
          <a className="footer-email" href="mailto:hello@nikboni.com">
            hello@nikboni.com
          </a>
        </div>
        <div className="footer-meta">
          <span>© {new Date().getFullYear()} Nikboni</span>
          <span>Built with intention.</span>
        </div>
      </footer>
      <ThemeToggle />
    </div>
  );
}
