import Link from 'next/link';
import styles from './page.module.css';

export default function PricingPage() {
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
        {/* 1. Pricing Hero */}
        <section className={styles.hero} aria-labelledby="pricing-hero-heading">
          <h1 id="pricing-hero-heading" className={styles.heroHeadline}>
            Simple pricing. No surprises.
          </h1>
          <p className={styles.heroSubhead}>
            Built for bars and restaurants that need schedules to just work.
          </p>
          <p className={styles.heroReassurance}>
            No credit card required · Cancel anytime
          </p>
        </section>

        {/* 2. Pricing Cards */}
        <section className={styles.cardsSection} aria-labelledby="pricing-cards-heading">
          <h2 id="pricing-cards-heading" className={styles.srOnly}>
            Choose a plan
          </h2>
          <div className={styles.cardsGrid}>
            {/* Free */}
            <div className={styles.card}>
              <h3 className={styles.cardName}>Free</h3>
              <p className={styles.cardTagline}>Best for getting started</p>
              <p className={styles.cardPrice}>
                <span className={styles.priceAmount}>$0</span>
              </p>
              <p className={styles.cardPriceNote}>What it includes:</p>
              <ul className={styles.cardFeatures}>
                <li>Up to 10 employees</li>
                <li>Weekly schedule builder</li>
                <li>Employee availability</li>
                <li>Mobile access for staff</li>
                <li>Schedule publishing</li>
              </ul>
              <Link className={`${styles.btn} ${styles.btnSecondary} ${styles.cardCta}`} href="/signup">
                Start free
              </Link>
              <p className={styles.cardNote}>No credit card required.</p>
            </div>

            {/* Core - Most Popular */}
            <div className={`${styles.card} ${styles.cardFeatured}`}>
              <span className={styles.badge}>Most popular</span>
              <h3 className={styles.cardName}>Core</h3>
              <p className={styles.cardTagline}>For growing teams that need control</p>
              <p className={styles.cardPrice}>
                <span className={styles.priceAmount}>$29</span>
                <span className={styles.pricePeriod}> / location / month</span>
              </p>
              <p className={styles.cardPriceNote}>Includes everything in Free, plus:</p>
              <ul className={styles.cardFeatures}>
                <li>Open shifts and call-out coverage</li>
                <li>Swap and time-off requests</li>
                <li>Overtime and break warnings</li>
                <li>Labor overview</li>
                <li>Templates</li>
              </ul>
              <Link className={`${styles.btn} ${styles.btnPrimary} ${styles.cardCta}`} href="/signup">
                Start free trial
              </Link>
            </div>

            {/* Pro */}
            <div className={styles.card}>
              <h3 className={styles.cardName}>Pro</h3>
              <p className={styles.cardTagline}>For operators managing multiple locations</p>
              <p className={styles.cardPrice}>
                <span className={styles.priceAmount}>$79</span>
                <span className={styles.pricePeriod}> / location / month</span>
              </p>
              <p className={styles.cardPriceNote}>Includes everything in Core, plus:</p>
              <ul className={styles.cardFeatures}>
                <li>Multiple locations</li>
                <li>Advanced labor insights</li>
                <li>Priority support</li>
                <li>Early access to new features</li>
              </ul>
              <Link className={`${styles.btn} ${styles.btnSecondary} ${styles.cardCta}`} href="/contact">
                Contact us
              </Link>
            </div>
          </div>
        </section>

        {/* 3. What's Included */}
        <section className={styles.includedSection} aria-labelledby="included-heading">
          <h2 id="included-heading" className={styles.includedHeadline}>
            Everything you need to run schedules without chaos
          </h2>
          <ul className={styles.includedList}>
            <li>
              <span className={styles.includedIcon} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
              Schedule builder with roles and dayparts
            </li>
            <li>
              <span className={styles.includedIcon} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              Real-time coverage visibility
            </li>
            <li>
              <span className={styles.includedIcon} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13 2v2a1 1 0 0 1-2 0V2a1 1 0 0 1 2 0z" />
                </svg>
              </span>
              Open shifts and fast call-out coverage
            </li>
            <li>
              <span className={styles.includedIcon} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              </span>
              Availability and swap requests
            </li>
            <li>
              <span className={styles.includedIcon} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              Labor and overtime awareness
            </li>
            <li>
              <span className={styles.includedIcon} aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </span>
              Mobile access for your team
            </li>
          </ul>
        </section>

        {/* 4. Comparison Table */}
        <section className={styles.compareSection} aria-labelledby="compare-heading">
          <h2 id="compare-heading" className={styles.compareHeadline}>
            Compare plans
          </h2>
          <div className={styles.tableWrap}>
            <table className={styles.compareTable}>
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Free</th>
                  <th scope="col">Core</th>
                  <th scope="col">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Employees</th>
                  <td>Up to 10</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <th scope="row">Locations</th>
                  <td>1</td>
                  <td>1</td>
                  <td>Multiple</td>
                </tr>
                <tr>
                  <th scope="row">Open shifts</th>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <th scope="row">Requests</th>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <th scope="row">Labor warnings</th>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <th scope="row">Templates</th>
                  <td>—</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <th scope="row">Support</th>
                  <td>Email</td>
                  <td>Email</td>
                  <td>Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 5. FAQs */}
        <section className={styles.faqSection} aria-labelledby="faq-heading">
          <h2 id="faq-heading" className={styles.faqHeadline}>
            FAQs
          </h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt className={styles.faqQuestion}>Is there really a free plan?</dt>
              <dd className={styles.faqAnswer}>Yes. Free includes up to 10 employees and core scheduling. No credit card required.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqQuestion}>Do my employees need accounts?</dt>
              <dd className={styles.faqAnswer}>Staff can view schedules and submit requests via the app or web. You control who gets access.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqQuestion}>Can I change plans later?</dt>
              <dd className={styles.faqAnswer}>Yes. You can upgrade or downgrade anytime. Changes apply at the start of your next billing period.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqQuestion}>Is this per location or per employee?</dt>
              <dd className={styles.faqAnswer}>Paid plans are per location per month. You pay for each location you manage.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt className={styles.faqQuestion}>Can I cancel anytime?</dt>
              <dd className={styles.faqAnswer}>Yes. Cancel whenever you like. No long-term commitment.</dd>
            </div>
          </dl>
        </section>

        {/* 6. Final CTA */}
        <section className={styles.finalCta} aria-labelledby="final-cta-heading">
          <h2 id="final-cta-heading" className={styles.finalCtaHeadline}>
            Start scheduling without the headache
          </h2>
          <div className={styles.finalCtaRow}>
            <Link className={`${styles.btn} ${styles.btnPrimary}`} href="/signup">
              Start free
            </Link>
            <Link className={`${styles.btn} ${styles.btnSecondary}`} href="/demo">
              View demo
            </Link>
          </div>
          <p className={styles.finalCtaReassurance}>
            No credit card required to get started.
          </p>
        </section>
      </main>
    </div>
  );
}
