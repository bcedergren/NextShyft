# NextShyft MVP Launch Checklist

**Quick Reference:** Essential tasks to launch production-ready MVP

---

## 🚨 CRITICAL PATH (Must Complete Before Launch)

### Week 1-2: Core Functionality

**AI Schedule Generator**
- [ ] Enhance ILP solver with real constraints (`lib/scheduler/ilp.ts`)
- [ ] Wire generation endpoint to real solver (`/api/schedules/[id]/generate`)
- [ ] Add generation preview UI (manager schedule page)
- [ ] Create generation settings page
- [ ] Test: Generate 100 schedules, verify >90% fill rate

**Production Deployment**
- [ ] Set up Vercel production project
- [ ] Configure production domain + SSL
- [ ] Set up staging environment
- [ ] Add all env vars (MongoDB, Resend, Stripe, VAPID, NextAuth)
- [ ] Configure Stripe webhooks (prod + staging)
- [ ] Test: Full user flow from signup to schedule generation

**Email Templates**
- [ ] Design professional email templates (invite, schedule, swap, reset)
- [ ] Test on Gmail, Outlook, Apple Mail
- [ ] Add unsubscribe links + preference management
- [ ] Test: Email deliverability >95%

---

### Week 3-4: Security & Onboarding

**Onboarding Wizard**
- [ ] Complete wizard UI (positions → invite → templates → policy → generate)
- [ ] Add progress tracking to Org model
- [ ] Create sample data option
- [ ] Test: New user completes wizard in <5 min

**Security Hardening**
- [ ] Run security audit (Snyk/OWASP ZAP or hire pen tester)
- [ ] Fix all high/critical vulnerabilities
- [ ] Add rate limiting to public endpoints
- [ ] Add Zod input validation to all API routes
- [ ] Configure security headers (CSP, HSTS, etc.)
- [ ] Test: securityheaders.com score A+

**Legal & Compliance**
- [ ] Create Terms of Service
- [ ] Create Privacy Policy (GDPR/CCPA compliant)
- [ ] Add cookie consent banner (if using GA)
- [ ] Implement data export endpoint (`/api/me/export`)
- [ ] Implement account deletion endpoint (`/api/me/delete`)
- [ ] Test: Data export completes in <24 hours

---

### Week 5-6: Polish & Optimization

**Mobile UX Polish**
- [ ] Test all employee pages on 4+ devices (iPhone, Pixel, etc.)
- [ ] Fix layout issues and tap target sizes
- [ ] Optimize calendar/schedule views for mobile
- [ ] Add offline support for schedule viewing
- [ ] Test: Lighthouse mobile score >90

**Landing Page Optimization**
- [ ] Enhance copy with testimonials and trust badges
- [ ] Add feature comparison table
- [ ] Add interactive demo preview or video
- [ ] Optimize SEO (meta tags, structured data, sitemap)
- [ ] Test: Page loads in <2s, Lighthouse >90

**Notifications**
- [ ] Test SMS end-to-end (Twilio in production)
- [ ] Add notification batching (don't spam users)
- [ ] Create notification preferences UI
- [ ] Test: No duplicate notifications sent

---

### Week 7-8: Testing & Pre-Launch

**Performance Testing**
- [ ] Set up performance monitoring (Vercel Analytics or Sentry)
- [ ] Load test: 100 concurrent schedule generations
- [ ] Add database indexes (`scripts/create-indexes.ts`)
- [ ] Implement caching (org settings, positions in Redis)
- [ ] Test: API p95 <500ms, page load <1.5s on 3G

**Analytics**
- [ ] Integrate analytics (PostHog/Plausible/GA4)
- [ ] Track signups, onboarding completion, schedule creation
- [ ] Set up conversion funnels
- [ ] Wire admin metrics dashboard to real data
- [ ] Test: Events flowing to analytics platform

**Final QA**
- [ ] Run full E2E test suite (Playwright)
- [ ] Test all user flows manually (owner, manager, employee)
- [ ] Test billing flow (checkout → webhook → upgrade)
- [ ] Test invite flow (send → accept → login)
- [ ] Fix all critical and high-priority bugs

---

## 📊 LAUNCH READINESS CRITERIA

### Must-Have (Hard Blockers)

- [ ] ✅ AI scheduler produces usable schedules
- [ ] ✅ Production deployed at custom domain with SSL
- [ ] ✅ Payment processing works (Stripe test + live)
- [ ] ✅ Email notifications deliver reliably (>95%)
- [ ] ✅ Mobile UX tested on iOS and Android
- [ ] ✅ Security audit passed (no critical issues)
- [ ] ✅ Legal pages live (Terms, Privacy)
- [ ] ✅ GDPR compliance (data export + deletion)
- [ ] ✅ All E2E tests passing
- [ ] ✅ Zero critical bugs in production

### Nice-to-Have (Polish)

- [ ] 📈 Onboarding wizard live
- [ ] 📈 Landing page optimized
- [ ] 📈 Blog with 5+ articles
- [ ] 📈 Referral program
- [ ] 📈 Analytics tracking
- [ ] 📈 SMS notifications working

---

## 🎯 SUCCESS METRICS (First 90 Days)

**Acquisition:**
- Target: 100 signups
- Target: 20 paying customers
- Target: 5% landing page conversion

**Activation:**
- Target: 70% complete onboarding
- Target: 50% generate first schedule in 7 days
- Target: 30% invite ≥3 team members

**Retention:**
- Target: 60% WAU in month 1
- Target: 40% retention at day 30
- Target: <5% churn per month

**Revenue:**
- Target: $2,000 MRR by month 3

---

## 🔧 INFRASTRUCTURE SETUP

### Vercel Configuration

- [ ] Production project created
- [ ] Staging preview configured
- [ ] Custom domain added
- [ ] SSL certificate active
- [ ] Environment variables set (see ENV_CHECKLIST.md)
- [ ] Cron job for daily billing recheck

### MongoDB Atlas

- [ ] Production cluster created (M10 or higher)
- [ ] Database user created
- [ ] IP whitelist configured
- [ ] Daily backups enabled
- [ ] Indexes created (see `scripts/create-indexes.ts`)

### Stripe

- [ ] Live API keys obtained
- [ ] Price IDs created (Pro, Business)
- [ ] Webhook endpoint configured
- [ ] Test mode transactions verified
- [ ] Live mode transactions verified

### Resend

- [ ] Production domain verified
- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] API key created
- [ ] Email templates tested
- [ ] Deliverability >95% confirmed

### Third-Party Accounts

- [ ] Twilio (optional SMS)
- [ ] Upstash Redis (rate limiting)
- [ ] Analytics platform (PostHog/Plausible/GA)
- [ ] Error tracking (Sentry - optional)

---

## 🐛 PRE-LAUNCH TESTING MATRIX

### User Flow Testing

**Signup & Onboarding:**
- [ ] Signup with email/password
- [ ] Email verification
- [ ] Complete onboarding wizard
- [ ] Create first org

**Manager Workflows:**
- [ ] Create positions
- [ ] Invite employees
- [ ] Create shift templates
- [ ] Set coverage requirements
- [ ] Generate schedule with AI
- [ ] Manually assign shifts
- [ ] Publish schedule
- [ ] Approve swap request

**Employee Workflows:**
- [ ] Accept invite
- [ ] Set availability
- [ ] View schedule
- [ ] Request shift swap
- [ ] Receive notifications
- [ ] Export iCal

**Billing:**
- [ ] Upgrade to Pro plan
- [ ] Stripe checkout completes
- [ ] Webhook processes successfully
- [ ] Org plan updates
- [ ] Downgrade/cancel subscription

### Browser/Device Testing

- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Firefox (desktop)
- [ ] Edge (desktop)
- [ ] Safari iOS (mobile)
- [ ] Chrome Android (mobile)

### Performance Testing

- [ ] Landing page: <2s load, Lighthouse >90
- [ ] Dashboard: <1s initial load
- [ ] Schedule generation: <10s for 50 shifts
- [ ] API endpoints: p95 <500ms
- [ ] Mobile pages: Lighthouse >90

---

## 📚 DOCUMENTATION CHECKLIST

### User-Facing Docs (Create if Missing)

- [ ] Help center / FAQ
- [ ] Getting started guide
- [ ] Manager documentation
- [ ] Employee quick start
- [ ] Billing and plans page
- [ ] API documentation (future)

### Internal Docs (Verify/Update)

- [x] README.md
- [x] DEPLOY.md
- [x] ENV_CHECKLIST.md
- [x] TEST_ACCOUNTS.md
- [x] CONTRIBUTING.md
- [x] PLAYBOOK.md
- [ ] BACKUP_RESTORE.md (create)
- [ ] METRICS.md (create)
- [ ] RUNBOOK.md (create for incidents)

---

## 🚀 LAUNCH PLAN

### Pre-Launch (Week 7-8)

**Day -14:**
- [ ] Send beta invite to 10 waitlist users
- [ ] Set up feedback collection (Typeform/Google Forms)

**Day -7:**
- [ ] Review beta feedback
- [ ] Fix critical bugs from beta
- [ ] Final performance optimization

**Day -3:**
- [ ] Freeze code (only critical fixes)
- [ ] Final E2E test pass
- [ ] Prepare launch announcements

**Day -1:**
- [ ] Deploy final build to production
- [ ] Verify all integrations working
- [ ] Monitor error logs for 24 hours

### Launch Day

**Morning:**
- [ ] Final smoke test on production
- [ ] Enable public signup (remove beta-only flag if any)
- [ ] Post launch announcement (Twitter, LinkedIn, ProductHunt)

**During Day:**
- [ ] Monitor signup rate
- [ ] Watch error logs and Sentry
- [ ] Respond to support emails within 1 hour
- [ ] Track conversion funnel

**Evening:**
- [ ] Review first day metrics
- [ ] Fix any critical issues
- [ ] Send thank you email to beta users

### Post-Launch (Week 1)

- [ ] Daily metrics review (signups, activations, errors)
- [ ] User interviews (first 10 customers)
- [ ] Hot-fix critical bugs
- [ ] Publish first blog post
- [ ] Submit to directories (SaaSHub, AlternativeTo, etc.)

---

## 🆘 INCIDENT RESPONSE

### On-Call Checklist

**If Production is Down:**
1. Check Vercel status dashboard
2. Check MongoDB Atlas status
3. Check Stripe status
4. Review Vercel logs for errors
5. Rollback to last known good deployment
6. Post status update (if >30 min downtime)

**If Webhooks Failing:**
1. Check Stripe webhook logs
2. Verify webhook secret matches env var
3. Test webhook endpoint manually
4. Enable webhook retry in Stripe dashboard

**If Emails Not Sending:**
1. Check Resend dashboard for errors
2. Verify domain DNS records
3. Check API key validity
4. Test with `/api/email/test` endpoint

---

## 📞 EMERGENCY CONTACTS

- Vercel Support: https://vercel.com/support
- MongoDB Atlas Support: https://support.mongodb.com
- Stripe Support: https://support.stripe.com
- Resend Support: support@resend.com
- DNS Provider: [YOUR PROVIDER]

---

## ✅ FINAL SIGN-OFF

Before going live, confirm:

- [ ] All "Must-Have" launch criteria met
- [ ] At least 5 beta users tested successfully
- [ ] Legal review complete (or template approved)
- [ ] Backup/restore tested
- [ ] Incident response plan reviewed
- [ ] Support email monitored (support@YOUR_DOMAIN.com)
- [ ] Status page set up (status.nextshyft.com - optional)

**Signed off by:** ________________  
**Date:** ________________

---

## 🎉 POST-MVP BACKLOG (After Launch)

### Quick Wins (Week 2-4)
- [ ] Add keyboard shortcuts
- [ ] Improve dashboard widgets
- [ ] Add export to CSV for schedules
- [ ] Create video tutorials

### Feature Requests (Month 2-3)
- [ ] Multi-week view
- [ ] Recurring schedules
- [ ] Time clock integration
- [ ] Advanced forecasting

### Growth Features (Month 3-6)
- [ ] Referral program
- [ ] Zapier integration
- [ ] Public API
- [ ] Mobile apps (React Native)

---

**Last Updated:** April 17, 2026  
**Owner:** Development Team  
**Review Cadence:** Weekly during MVP sprint, monthly post-launch
