# NextShyft MVP - Quick Start Implementation Guide

**For:** Solo founders or small teams ready to ship MVP  
**Time to MVP:** 6-8 weeks following critical path  
**Current Status:** 85% complete, need 15% to launch

---

## 🎯 The Critical Path (Non-Negotiable for MVP)

Focus on these 8 tasks first. Everything else can wait until post-launch.

### 1️⃣ Make the AI Scheduler Work (Week 1)

**Current State:** Greedy algorithm placeholder exists  
**What's Missing:** Production-quality constraint solver  
**Time Estimate:** 3-5 days

**Quick Implementation:**

```typescript
// lib/scheduler/ilp.ts - Enhanced version

export function generateSchedule(
  shifts: Shift[],
  employees: Employee[],
  policy: {
    maxHours: number;
    overtimeThreshold: number;
    fairnessWeight: number; // 0-1, higher = more equal distribution
  }
): { assignments: Assignment; unfilled: string[]; warnings: Warning[] } {
  
  const assignments: Assignment = {};
  const hours: Record<string, number> = {};
  const unfilled: string[] = [];
  const warnings: Warning[] = [];

  // Sort shifts by priority: required count DESC, duration DESC
  const sorted = [...shifts].sort((a, b) =>
    (b.required - a.required) || (hoursBetween(b.start, b.end) - hoursBetween(a.start, a.end))
  );

  for (const shift of sorted) {
    assignments[shift.id] = [];
    const duration = hoursBetween(shift.start, shift.end);

    // Filter eligible employees
    const eligible = employees.filter(e =>
      e.positions.includes(shift.positionId) &&
      hasAvailability(e, shift)
    );

    if (eligible.length === 0) {
      unfilled.push(shift.id);
      warnings.push({
        type: 'error',
        shiftId: shift.id,
        message: 'No qualified employees available'
      });
      continue;
    }

    // Sort by fairness: least hours worked first
    eligible.sort((a, b) => (hours[a.id] || 0) - (hours[b.id] || 0));

    let filled = 0;
    for (const emp of eligible) {
      if (filled >= shift.required) break;

      const currentHours = hours[emp.id] || 0;
      const newTotal = currentHours + duration;

      // Check max hours constraint
      if (emp.maxHours && newTotal > emp.maxHours) {
        warnings.push({
          type: 'warning',
          shiftId: shift.id,
          employeeId: emp.id,
          message: `${emp.name} would exceed max hours (${newTotal}/${emp.maxHours})`
        });
        continue;
      }

      // Check overtime threshold
      if (newTotal > policy.overtimeThreshold) {
        warnings.push({
          type: 'info',
          shiftId: shift.id,
          employeeId: emp.id,
          message: `${emp.name} would work ${newTotal} hours (overtime threshold: ${policy.overtimeThreshold})`
        });
      }

      // Assign
      assignments[shift.id].push(emp.id);
      hours[emp.id] = newTotal;
      filled++;
    }

    // Check if shift fully filled
    if (filled < shift.required) {
      unfilled.push(shift.id);
      warnings.push({
        type: 'warning',
        shiftId: shift.id,
        message: `Only ${filled}/${shift.required} positions filled`
      });
    }
  }

  return { assignments, unfilled, warnings };
}

function hasAvailability(emp: Employee, shift: Shift): boolean {
  const avail = emp.weekly[shift.day] || [];
  return avail.some(slot =>
    slot.start <= shift.start && slot.end >= shift.end
  );
}
```

**Next: Wire to API**

```typescript
// app/api/schedules/[id]/generate/route.ts

import { generateSchedule } from '@/lib/scheduler/ilp';
import { getSession } from '@/lib/auth';
import Org from '@/models/Org';
import User from '@/models/User';
import ShiftTemplate from '@/models/ShiftTemplate';
import Availability from '@/models/Availability';
import OrgPolicy from '@/models/OrgPolicy';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user?.orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { dateRange } = await req.json(); // { start: '2026-04-21', end: '2026-04-27' }

  // Fetch org policy
  const policy = await OrgPolicy.findOne({ orgId: session.user.orgId });
  
  // Fetch employees with availability
  const users = await User.find({ orgId: session.user.orgId, roles: 'EMPLOYEE' });
  const availabilities = await Availability.find({
    userId: { $in: users.map(u => u._id) }
  });

  const employees = users.map(u => {
    const avail = availabilities.find(a => a.userId.toString() === u._id.toString());
    return {
      id: u._id.toString(),
      name: u.name,
      positions: u.positions.map(p => p.toString()),
      weekly: avail?.weekly || {},
      maxHours: policy?.maxHoursPerWeek || 40
    };
  });

  // Fetch shift templates and expand to date range
  const templates = await ShiftTemplate.find({ orgId: session.user.orgId });
  const shifts = expandTemplates(templates, dateRange);

  // Generate schedule
  const result = generateSchedule(shifts, employees, {
    maxHours: policy?.maxHoursPerWeek || 40,
    overtimeThreshold: policy?.overtimeThreshold || 40,
    fairnessWeight: 0.7
  });

  return NextResponse.json({
    scheduleId: params.id,
    assignments: result.assignments,
    unfilled: result.unfilled,
    warnings: result.warnings,
    stats: {
      totalShifts: shifts.length,
      filledShifts: shifts.length - result.unfilled.length,
      fillRate: ((shifts.length - result.unfilled.length) / shifts.length * 100).toFixed(1)
    }
  });
}
```

---

### 2️⃣ Deploy to Production (Week 1)

**Quick Vercel Setup (15 minutes):**

1. **Import to Vercel:**
   - Go to vercel.com/new
   - Import `bcedergren/NextShyft` from GitHub
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`

2. **Add Environment Variables:**
   - Copy all from `.env.local` to Vercel dashboard
   - Set `NEXTAUTH_URL` to production domain

3. **Add Custom Domain:**
   - Settings → Domains → Add `app.nextshyft.com`
   - Point DNS A record to Vercel IP (shown in dashboard)
   - Wait for SSL to provision (~5 min)

4. **Deploy:**
   - Push to `main` branch
   - Vercel auto-deploys
   - Check `/api/health` endpoint

**MongoDB Production Cluster:**
```bash
# In MongoDB Atlas:
1. Create M10 cluster (cheapest production tier)
2. Database Access → Add user with read/write role
3. Network Access → Add 0.0.0.0/0 (or Vercel IPs)
4. Copy connection string to Vercel env vars
```

**Stripe Webhook:**
```bash
# In Stripe Dashboard:
1. Developers → Webhooks → Add endpoint
2. URL: https://YOUR_DOMAIN.com/api/billing/webhook
3. Events: checkout.session.completed, customer.subscription.*
4. Copy webhook secret to Vercel
```

**Resend Domain:**
```bash
# In Resend Dashboard:
1. Add domain: mail.nextshyft.com
2. Add DNS records (TXT for DKIM, MX for receiving)
3. Verify domain
4. Test: Send email via API
```

---

### 3️⃣ Polish Email Templates (Week 2)

**Option A: Quick Win with React Email (Recommended)**

```bash
npm install @react-email/components
```

```tsx
// emails/InviteEmail.tsx
import {
  Body, Button, Container, Head, Html, Preview, Section, Text
} from '@react-email/components';

export default function InviteEmail({
  inviterName,
  orgName,
  acceptUrl
}: {
  inviterName: string;
  orgName: string;
  acceptUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {orgName} on NextShyft</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Welcome to {orgName}! 👋</Text>
          <Text style={paragraph}>
            {inviterName} has invited you to join their team on NextShyft.
            You'll be able to view your schedule, request time off, and swap shifts
            all in one place.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={acceptUrl}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={footer}>
            If you didn't expect this invitation, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto' };
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '560px' };
const heading = { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' };
const paragraph = { fontSize: '16px', lineHeight: '26px' };
const btnContainer = { textAlign: 'center' as const, margin: '32px 0' };
const button = { backgroundColor: '#1f2937', borderRadius: '6px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'block', padding: '12px 20px' };
const footer = { color: '#8898aa', fontSize: '12px', marginTop: '32px' };
```

**Send with Resend:**
```typescript
// lib/emailTemplates.ts
import { render } from '@react-email/render';
import InviteEmail from '@/emails/InviteEmail';

export async function sendInviteEmail(to: string, data: any) {
  const html = render(<InviteEmail {...data} />);
  
  await resend.emails.send({
    from: 'NextShyft <no-reply@mail.YOUR_DOMAIN.com>',
    to,
    subject: `You've been invited to ${data.orgName}`,
    html
  });
}
```

**Create 5 Templates:**
1. InviteEmail.tsx ✅ (above)
2. SchedulePublishedEmail.tsx
3. SwapDecisionEmail.tsx
4. PasswordResetEmail.tsx
5. WelcomeEmail.tsx

**Test Deliverability:**
```bash
# Send test email
curl https://YOUR_DOMAIN.com/api/email/test

# Check mail-tester.com
# Paste email source → Should score 8/10 or higher
```

---

### 4️⃣ Complete Onboarding Wizard (Week 2-3)

**Quick Win: Use Material-UI Stepper**

```tsx
// app/org/[org]/(manager)/wizard/page.tsx
'use client';
import { useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box } from '@mui/material';

const steps = ['Welcome', 'Positions', 'Invite Team', 'Templates', 'Policy', 'Generate'];

export default function WizardPage() {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = async () => {
    // Save current step data
    await saveStepData(activeStep);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', py: 4 }}>
      <Stepper activeStep={activeStep}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {activeStep === 0 && <WelcomeStep />}
        {activeStep === 1 && <PositionsStep />}
        {activeStep === 2 && <InviteStep />}
        {activeStep === 3 && <TemplatesStep />}
        {activeStep === 4 && <PolicyStep />}
        {activeStep === 5 && <GenerateStep />}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
    </Box>
  );
}
```

**Each Step Component:**
```tsx
function PositionsStep() {
  const [positions, setPositions] = useState([
    { name: 'Server', color: '#3b82f6' },
    { name: 'Bartender', color: '#8b5cf6' },
  ]);

  return (
    <Box>
      <Typography variant="h5">Create Your First Positions</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        What roles does your team work in?
      </Typography>
      {positions.map((pos, i) => (
        <TextField
          key={i}
          label="Position name"
          value={pos.name}
          onChange={(e) => updatePosition(i, 'name', e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
      ))}
      <Button onClick={() => setPositions([...positions, { name: '', color: '#000' }])}>
        + Add Position
      </Button>
    </Box>
  );
}
```

**Track Progress:**
```typescript
// models/Org.ts
const OrgSchema = new Schema({
  // ... existing fields
  onboarding: {
    completed: { type: Boolean, default: false },
    currentStep: { type: Number, default: 0 },
    completedSteps: [Number]
  }
});

// Save after each step
await Org.updateOne(
  { _id: orgId },
  { $set: { 'onboarding.currentStep': step, 'onboarding.completedSteps': steps } }
);
```

---

### 5️⃣ Security Hardening (Week 3)

**Quick Security Wins (1 day):**

**A. Add Security Headers**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }];
  }
};
```

**B. Rate Limiting**
```typescript
// middleware.ts (add to existing middleware)
import { rateLimit } from '@/lib/rateLimit';

export async function middleware(req: NextRequest) {
  // Rate limit auth endpoints
  if (req.nextUrl.pathname.startsWith('/api/auth')) {
    const ip = req.ip ?? '127.0.0.1';
    const { success } = await rateLimit.limit(ip);
    
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 });
    }
  }
  
  // ... rest of middleware
}
```

**C. Input Validation**
```typescript
// app/api/positions/route.ts
import { z } from 'zod';

const createPositionSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = createPositionSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  
  // ... rest of handler
}
```

**D. Run Security Scan**
```bash
# Install dependencies
npm audit fix

# Snyk scan (free for open source)
npx snyk test

# OWASP ZAP (point at staging)
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.YOUR_DOMAIN.com
```

---

### 6️⃣ Legal Pages (Week 3)

**Quick Win: Use Templates**

**Option 1: Free Templates (termsfeed.com)**
1. Go to termsfeed.com/privacy-policy-generator
2. Fill in: Company name, website, data collected
3. Generate Privacy Policy
4. Repeat for Terms of Service

**Option 2: Paid ($29): Termly.io**
- Auto-updates for compliance changes
- Includes GDPR, CCPA, cookie banner

**Add to App:**
```tsx
// app/(legal)/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h3" gutterBottom>Privacy Policy</Typography>
      <Typography variant="caption" color="text.secondary">
        Last updated: April 17, 2026
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>1. Information We Collect</Typography>
        <Typography paragraph>
          We collect information you provide directly to us, such as when you create
          an account, update your profile, or communicate with us...
        </Typography>
        
        {/* Copy generated content here */}
      </Box>
    </Container>
  );
}
```

**Link in Footer:**
```tsx
// components/Footer.tsx
<Link href="/privacy">Privacy Policy</Link>
<Link href="/terms">Terms of Service</Link>
```

---

### 7️⃣ GDPR Compliance (Week 4)

**Quick Implementations:**

**A. Data Export**
```typescript
// app/api/me/export/route.ts
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const user = await User.findById(session.user.id);
  const shifts = await Shift.find({ assignedTo: session.user.id });
  const availability = await Availability.findOne({ userId: session.user.id });
  const notifications = await Notification.find({ userId: session.user.id });

  const data = {
    user: user.toObject(),
    shifts: shifts.map(s => s.toObject()),
    availability: availability?.toObject(),
    notifications: notifications.map(n => n.toObject())
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="nextshyft-export-${Date.now()}.json"`
    }
  });
}
```

**B. Account Deletion**
```typescript
// app/api/me/delete/route.ts
export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  // Soft delete: anonymize instead of hard delete
  await User.updateOne(
    { _id: session.user.id },
    {
      $set: {
        email: `deleted-${session.user.id}@deleted.com`,
        name: 'Deleted User',
        deletedAt: new Date(),
        passwordHash: ''
      }
    }
  );

  // Remove from all shifts
  await Shift.updateMany(
    { assignedTo: session.user.id },
    { $pull: { assignedTo: session.user.id } }
  );

  return NextResponse.json({ message: 'Account deleted' });
}
```

---

### 8️⃣ Mobile UX Polish (Week 4)

**Quick Audit Checklist:**

```bash
# Use Chrome DevTools
1. Open app in Chrome
2. F12 → Toggle device toolbar
3. Test on:
   - iPhone SE (375x667)
   - iPhone 14 Pro (393x852)
   - Pixel 7 (412x915)

# Common Issues to Fix:
□ Horizontal scroll (body width > viewport)
□ Tap targets < 44px
□ Text < 16px (causes iOS zoom)
□ Fixed elements overlap content
□ Forms don't autofocus on mobile
```

**Quick Fixes:**

```tsx
// Fix: Horizontal scroll
<Box sx={{ 
  width: '100%',
  maxWidth: '100vw',
  overflowX: 'hidden'
}}>

// Fix: Tap targets too small
<Button sx={{ 
  minHeight: 44,
  minWidth: 44,
  px: 3
}}>

// Fix: Text too small
<Typography variant="body1" sx={{ 
  fontSize: { xs: 16, md: 14 }  // Never below 16px on mobile
}}>
```

**Run Lighthouse:**
```bash
# In Chrome DevTools
1. F12 → Lighthouse tab
2. Device: Mobile
3. Run audit
4. Fix issues scoring <90

# Target scores:
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >90
```

---

## ⏱️ Time-Saving Shortcuts

### Skip These for MVP (Do Post-Launch):

1. ❌ SMS notifications - Email + push is enough
2. ❌ Referral program - Focus on organic growth first
3. ❌ Blog - 1-2 articles is fine, don't overthink
4. ❌ Multi-week view - Single week is MVP
5. ❌ Time clock - Scheduling first, time tracking later
6. ❌ Advanced reporting - Basic coverage heatmap is enough
7. ❌ Zapier - Build API later when users request it
8. ❌ 2FA - Add after launch when you have customers

### Use Pre-Built Solutions:

1. ✅ Email templates → React Email (not custom HTML)
2. ✅ Legal pages → Termly.io ($29) or TermsFeed (free)
3. ✅ Analytics → Plausible ($9/mo) or Vercel Analytics (free)
4. ✅ Error tracking → Skip Sentry, use Vercel logs
5. ✅ Payments → Stripe only (no PayPal/crypto)
6. ✅ Hosting → Vercel only (no AWS/GCP complexity)

---

## 🚨 Common Pitfalls to Avoid

### 1. Over-Engineering the Scheduler
**Problem:** Trying to build perfect ILP solver  
**Solution:** Enhanced greedy algorithm is good enough for MVP. Iterate based on real user feedback.

### 2. Premature Optimization
**Problem:** Spending days optimizing before launch  
**Solution:** Ship first, optimize when you have real usage data. Focus on correctness over speed.

### 3. Perfect Email Templates
**Problem:** Spending weeks on pixel-perfect emails  
**Solution:** React Email + clean design is enough. Users care more about functionality.

### 4. Feature Creep
**Problem:** Adding "nice-to-have" features before launch  
**Solution:** Ruthlessly cut scope. MVP = Minimum. Ship 20% of features to 80% of value.

### 5. Analysis Paralysis on Analytics
**Problem:** Comparing 10 analytics tools  
**Solution:** Pick Plausible or Vercel Analytics in 5 minutes. You can switch later.

---

## ✅ Launch Day Checklist (Copy This)

**24 Hours Before:**
- [ ] Deploy final code to production
- [ ] Run full E2E test suite
- [ ] Check all env vars set correctly
- [ ] Test Stripe checkout (live mode)
- [ ] Test email delivery (send to 3 different providers)
- [ ] Verify DNS and SSL working
- [ ] Check security headers (securityheaders.com)
- [ ] Review error logs (should be empty)

**Launch Morning:**
- [ ] Smoke test signup flow
- [ ] Smoke test schedule generation
- [ ] Smoke test billing
- [ ] Enable public signup (remove beta flag if any)
- [ ] Post on Twitter/LinkedIn
- [ ] Submit to Product Hunt (optional)
- [ ] Send email to waitlist (if you have one)

**During Launch Day:**
- [ ] Monitor Vercel logs every 2 hours
- [ ] Reply to support emails within 1 hour
- [ ] Track signups in analytics
- [ ] Note any bugs in GitHub issues

**End of Day:**
- [ ] Review metrics (signups, errors, p95 latency)
- [ ] Write down top 3 issues reported
- [ ] Plan hot-fixes for tomorrow

---

## 📞 When You Get Stuck

### Technical Issues:

1. **Scheduler not working:** Check sample data in `npm run seed:comprehensive`. Verify availability data exists.

2. **Vercel deploy fails:** Check build logs. Most common: missing env vars or TypeScript errors.

3. **Emails not sending:** Verify Resend domain. Check DNS records with `dig mail.nextshyft.com TXT`.

4. **Stripe webhook fails:** Check signature verification. Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard.

5. **Database connection errors:** Check MongoDB Atlas IP whitelist includes `0.0.0.0/0` or Vercel IPs.

### Process Questions:

1. **Should I add feature X?** If it's not on critical path → No. Post-MVP backlog.

2. **Should I refactor code Y?** If it works and tests pass → No. Ship first, refactor later.

3. **Should I use tool Z?** If it adds >1 day to schedule → No. Use existing stack.

---

## 🎉 You're Ready to Ship!

**Remember:**
- MVP = Minimum Viable Product, not perfect product
- Ship fast, iterate faster
- Real user feedback > your assumptions
- Done is better than perfect

**After Launch:**
- Collect feedback from first 10 users
- Fix critical bugs within 24 hours
- Add most-requested feature within 2 weeks
- Celebrate! You built and shipped a SaaS app 🚀

---

**Questions?** Open a GitHub Discussion or email support@YOUR_DOMAIN.com

**Last Updated:** April 17, 2026
