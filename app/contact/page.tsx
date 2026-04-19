'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './page.module.css';

const CONTACT_EMAIL = 'support@nextshyft.com';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const canSubmit = message.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const subject = encodeURIComponent(`Contact from ${name || 'NextShyft visitor'}`);
    const body = encodeURIComponent(
      `${message}\n\n---\nFrom: ${name || '(not provided)'}\nEmail: ${email || '(not provided)'}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.logo} href="/">
            Next<span>Shyft</span>
          </Link>
          <nav className={styles.nav}>
            <Link className={styles.link} href="/signin">
              Sign In
            </Link>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/signup">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="contact-heading">
          <h1 id="contact-heading" className={styles.heroHeadline}>
            Contact us
          </h1>
          <p className={styles.heroSubhead}>
            Have a question about Pro plans or want to get in touch? Send us a message or email us
            directly.
          </p>

          <p className={styles.emailUs}>
            Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className={styles.emailLink}>
              {CONTACT_EMAIL}
            </a>
          </p>

          <div className={styles.formWrap}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="contact-name" className={styles.label}>
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="contact-email" className={styles.label}>
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="contact-message" className={styles.label}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  className={styles.textarea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                  required
                />
              </div>
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                style={{ width: '100%', marginTop: 8 }}
                disabled={!canSubmit}
              >
                Send message
              </button>
            </form>
          </div>

          <Link className={`${styles.btn} ${styles.btnSecondary}`} href="/pricing">
            Back to pricing
          </Link>
        </section>
      </main>
    </div>
  );
}
