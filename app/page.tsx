'use client';
import Footer from '@/components/Footer';
import { PageHeader, PageLayout, PageSection } from '@/components/page';
import {
  Box,
  Typography,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CalendarDays, Users, Quote, TrendingUp } from 'lucide-react';

const DEMO_MARKETING_ICON_STROKE = 1.75;

function HomeDemoMarketingIconChip({
  Icon,
  from,
  to,
  ring,
  size = 56,
}: {
  Icon: React.ComponentType<{ strokeWidth?: number; style?: React.CSSProperties }>;
  from: string;
  to: string;
  ring: string;
  size?: number;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover .chip-glow': { opacity: 1 },
        '&:hover .chip': { transform: 'scale(1.08)' },
      }}
      aria-hidden
    >
      <Box
        className="chip-glow"
        sx={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '9999px',
          background: `linear-gradient(135deg, ${from}33, ${to}33)`,
          filter: 'blur(16px)',
          opacity: 0,
          transition: 'opacity .3s ease',
          zIndex: 0,
        }}
      />
      <Box
        className="chip"
        sx={{
          height: size,
          width: size,
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: `linear-gradient(135deg, ${from}, ${to})`,
          border: `2px solid ${ring}`,
          outline: '2px solid #fff',
          outlineOffset: '-2px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          transition: 'transform .2s ease',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Icon
          strokeWidth={DEMO_MARKETING_ICON_STROKE}
          style={{ width: size * 0.5, height: size * 0.5 }}
        />
      </Box>
    </Box>
  );
}

function HomeDemoMarketingNumberChip({
  n,
  from,
  to,
  ring,
  size = 56,
}: {
  n: number;
  from: string;
  to: string;
  ring: string;
  size?: number;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover .chip-glow-num': { opacity: 0.9 },
      }}
      aria-hidden
    >
      <Box
        className="chip-glow-num"
        sx={{
          position: 'absolute',
          inset: '-8px',
          borderRadius: '9999px',
          background: `linear-gradient(135deg, ${from}33, ${to}33)`,
          filter: 'blur(16px)',
          opacity: 0.35,
          transition: 'opacity .3s ease',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          height: size,
          width: size,
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: Math.max(12, Math.round(size * 0.38)),
          lineHeight: 1,
          background: `linear-gradient(135deg, ${from}, ${to})`,
          border: `2px solid ${ring}`,
          outline: '2px solid #fff',
          outlineOffset: '-2px',
          boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {n}
      </Box>
    </Box>
  );
}

const HOME_DEMO_STEP_STYLES = [
  { from: '#0ea5e9', to: '#6366f1', ring: '#7dd3fc' },
  { from: '#10b981', to: '#14b8a6', ring: '#6ee7b7' },
  { from: '#6366f1', to: '#8b5cf6', ring: '#a5b4fc' },
];

const homeDemoFeatures = [
  {
    title: 'Smart scheduling',
    desc: 'Drag-and-drop board, templates, and coverage goals.',
    Icon: CalendarDays,
    from: '#0ea5e9',
    to: '#6366f1',
    ring: '#7dd3fc',
  },
  {
    title: 'Employee-first',
    desc: 'Availability, swap requests, notifications, and iCal.',
    Icon: Users,
    from: '#10b981',
    to: '#14b8a6',
    ring: '#6ee7b7',
  },
  {
    title: 'Ready for growth',
    desc: 'Roles, policies, and billing to match your team size.',
    Icon: TrendingUp,
    from: '#6366f1',
    to: '#8b5cf6',
    ring: '#a5b4fc',
  },
];

const homeDemoSteps = [
  { t: 'Pick a role', d: 'Manager, Employee, or Owner—each shows a different view.' },
  { t: 'Explore real workflows', d: 'Open the calendar, coverage, and approvals.' },
  { t: 'Start free', d: 'Like it? Create your org and invite your team.' },
];

const homeDemoTestimonials = [
  {
    quote: 'We cut scheduling time by more than half. The coverage heatmap is a game changer.',
    by: 'Alex P., Operations Lead',
  },
  {
    quote:
      'Swaps and notifications just work. Our team knows exactly when schedules are published.',
    by: 'Monica R., Store Manager',
  },
  {
    quote: 'Fast to learn and easy to roll out. The team was up and running in a day.',
    by: 'Sam T., Clinic Director',
  },
  {
    quote: 'The availability tools made it simple to build fair schedules.',
    by: 'Jamie L., Front Desk Lead',
  },
];

const homeDemoFaqs = [
  {
    q: 'Do I need an account to try the demo?',
    a: 'No. On the demo page, use the role buttons with a Demo Organization ID, or start a session to get one automatically.',
  },
  {
    q: "I don't have a Demo Organization ID.",
    a: "No problem—on the demo page, click any role and we'll create a temporary demo org for you automatically. You can also sign up to import the demo data into your own org, or contact us for a hosted demo.",
  },
  {
    q: 'Can I invite my team?',
    a: 'Yes—create your own org on signup to invite teammates safely.',
  },
];

function HomeDemoMarketingSections() {
  return (
    <>
      <PageSection variant="card" title="Why NextShyft" padding={3}>
        <Box sx={{ position: 'relative' }}>
          <Box
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl"
            sx={{
              background:
                'radial-gradient(800px 200px at 10% -10%, rgba(59,130,246,0.06), transparent), radial-gradient(700px 200px at 90% 110%, rgba(16,185,129,0.06), transparent)',
            }}
          />
          <Box
            sx={{
              position: 'relative',
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
            }}
          >
            {homeDemoFeatures.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition shadow-slate-200/60"
                style={{ textAlign: 'center' }}
              >
                <div className="h-0.5 bg-gradient-to-r from-sky-500/50 via-indigo-500/50 to-emerald-500/50 rounded-full mb-3" />
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                  <HomeDemoMarketingIconChip Icon={f.Icon} from={f.from} to={f.to} ring={f.ring} />
                  <p className="font-semibold text-slate-900" style={{ fontSize: 18 }}>
                    {f.title}
                  </p>
                </div>
                <p className="text-slate-600" style={{ fontSize: 14, marginTop: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </Box>
        </Box>
      </PageSection>

      <PageSection variant="card" title="How it works" padding={3}>
        <Box sx={{ position: 'relative' }}>
          <Box
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl"
            sx={{
              background:
                'radial-gradient(900px 220px at 0% 0%, rgba(99,102,241,0.06), transparent), radial-gradient(700px 220px at 100% 100%, rgba(20,184,166,0.06), transparent)',
            }}
          />
          <Box
            component="ol"
            sx={{
              listStyle: 'none',
              paddingLeft: 0,
              position: 'relative',
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
            }}
          >
            {homeDemoSteps.map((s, idx) => (
              <li
                key={s.t}
                className="group rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition shadow-slate-200/60"
                style={{ textAlign: 'center' }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                  <HomeDemoMarketingNumberChip
                    n={idx + 1}
                    from={HOME_DEMO_STEP_STYLES[idx % HOME_DEMO_STEP_STYLES.length].from}
                    to={HOME_DEMO_STEP_STYLES[idx % HOME_DEMO_STEP_STYLES.length].to}
                    ring={HOME_DEMO_STEP_STYLES[idx % HOME_DEMO_STEP_STYLES.length].ring}
                  />
                  <p className="font-medium text-slate-900" style={{ fontSize: 18 }}>
                    {s.t}
                  </p>
                  <p className="text-slate-600" style={{ fontSize: 14, marginTop: 4 }}>
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </Box>
        </Box>
      </PageSection>

      <PageSection variant="card" title="What teams say" padding={3}>
        <Box sx={{ position: 'relative' }}>
          <Box
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl"
            sx={{
              background:
                'radial-gradient(700px 200px at 15% 0%, rgba(59,130,246,0.05), transparent), radial-gradient(700px 200px at 85% 100%, rgba(99,102,241,0.05), transparent)',
            }}
          />
          <Box
            sx={{
              position: 'relative',
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(2, 1fr)',
              },
            }}
          >
            {homeDemoTestimonials.map((t) => (
              <div
                key={t.by}
                className="relative rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition shadow-slate-200/60"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full ring-1 ring-offset-1 ring-offset-white bg-slate-100 text-slate-600 ring-slate-200"
                  aria-hidden
                >
                  <Quote className="h-4 w-4" strokeWidth={DEMO_MARKETING_ICON_STROKE} />
                </div>
                <blockquote className="mt-3 text-sm text-slate-800 italic leading-relaxed">
                  “{t.quote}”
                </blockquote>
                <div className="mt-3 h-px bg-slate-100" aria-hidden />
                <footer className="mt-2 text-xs text-slate-500">— {t.by}</footer>
              </div>
            ))}
          </Box>
        </Box>
      </PageSection>

      <PageSection variant="card" title="FAQ" padding={3}>
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {homeDemoFaqs.map((f, idx) => (
            <Accordion
              key={f.q}
              disableGutters
              elevation={0}
              sx={{
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                '&:hover': { backgroundColor: '#f8fafc' },
                '&.Mui-expanded': { borderColor: '#c7d2fe', backgroundColor: '#f8fafc' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`home-demo-faq-panel-${idx}`}
                id={`home-demo-faq-header-${idx}`}
                sx={{
                  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                    transform: 'rotate(180deg)',
                  },
                }}
              >
                <Typography variant="body1" fontWeight={600} sx={{ color: '#111827' }}>
                  {f.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#4b5563' }}>
                  {f.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </PageSection>
    </>
  );
}

export default function Page() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      {/* Minimal Header */}
      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 2, md: 4 }}>
        <PageHeader
          title="NextShyft"
          actions={
            <Stack direction="row" spacing={3}>
              <Button href="/signin" color="inherit" sx={{ fontWeight: 400 }}>
                Sign in
              </Button>
              <Button
                href="/signup"
                variant="contained"
                sx={{
                  bgcolor: '#1f2937',
                  '&:hover': { bgcolor: '#111827' },
                  fontWeight: 500,
                  px: 3,
                }}
              >
                Get Started
              </Button>
            </Stack>
          }
          variant="compact"
        />
      </PageLayout>

      {/* Hero Section */}
      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 4, md: 8 }}>
        <Typography
          variant="h1"
          fontWeight="200"
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            lineHeight: 1.1,
            mb: 2,
            color: '#1f2937',
          }}
        >
          Smarter shift scheduling
          <br />
          <span style={{ fontWeight: 400 }}>for modern teams</span>
        </Typography>

        <Typography
          variant="h5"
          color="#6b7280"
          fontWeight="300"
          sx={{
            mb: 3,
            maxWidth: '600px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Plan coverage in minutes, not hours. Keep your team informed and your floor covered with
          intelligent scheduling.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <Button
            href="/signup"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#1f2937',
              '&:hover': { bgcolor: '#111827' },
              px: 5,
              py: 1.5,
              fontWeight: 500,
              fontSize: '1.1rem',
            }}
          >
            Start Free Trial
          </Button>
          <Button
            href="/demo"
            variant="outlined"
            size="large"
            sx={{
              borderColor: '#d1d5db',
              color: '#374151',
              px: 5,
              py: 1.5,
              fontWeight: 500,
              fontSize: '1.1rem',
              '&:hover': {
                borderColor: '#9ca3af',
                bgcolor: '#f9fafb',
              },
            }}
          >
            View Demo
          </Button>
        </Stack>

        {/* Simple Trust Indicators */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ color: '#9ca3af' }}>
          <Typography variant="body2" fontWeight="400">
            ✓ No credit card required
          </Typography>
          <Typography variant="body2" fontWeight="400">
            ✓ Free forever plan
          </Typography>
          <Typography variant="body2" fontWeight="400">
            ✓ Setup in 5 minutes
          </Typography>
        </Stack>
      </PageLayout>

      {/* Simple Divider */}
      <Box sx={{ borderTop: '1px solid #f3f4f6' }} />

      {/* Features Section */}
      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 4, md: 8 }}>
        <PageHeader title="Everything you need to schedule with confidence" variant="compact" />

        <Stack spacing={3}>
          {/* Feature 1 */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" fontWeight="400" sx={{ mb: 3, color: '#1f2937' }}>
                AI-powered scheduling
              </Typography>
              <Typography variant="h6" color="#6b7280" fontWeight="300" sx={{ lineHeight: 1.7 }}>
                Our AI learns from your preferences and automatically fills schedules, balancing
                skills, seniority, and availability. Review and adjust before publishing.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <Typography variant="h2" color="#9ca3af" fontWeight="200">
                  AI
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Feature 2 */}
          <Stack direction={{ xs: 'column', md: 'row-reverse' }} spacing={3} alignItems="center">
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" fontWeight="400" sx={{ mb: 3, color: '#1f2937' }}>
                Team availability portal
              </Typography>
              <Typography variant="h6" color="#6b7280" fontWeight="300" sx={{ lineHeight: 1.7 }}>
                Staff enter their availability and PTO through a simple mobile-friendly interface.
                No more back-and-forth emails or missed requests.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <Typography variant="h2" color="#9ca3af" fontWeight="200">
                  📱
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Feature 3 */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" fontWeight="400" sx={{ mb: 3, color: '#1f2937' }}>
                Instant notifications
              </Typography>
              <Typography variant="h6" color="#6b7280" fontWeight="300" sx={{ lineHeight: 1.7 }}>
                Keep everyone in sync with SMS, email, and push notifications. Shift changes,
                approvals, and updates are delivered instantly.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <Typography variant="h2" color="#9ca3af" fontWeight="200">
                  🔔
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Stack>
      </PageLayout>

      <Box sx={{ borderTop: '1px solid #f3f4f6' }} />

      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 4, md: 8 }}>
        <HomeDemoMarketingSections />
      </PageLayout>

      {/* Simple Divider */}
      <Box sx={{ borderTop: '1px solid #f3f4f6' }} />

      {/* Social Proof */}
      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 4, md: 8 }}>
        <PageHeader
          title="Trusted by teams in retail, restaurants, healthcare & logistics"
          variant="compact"
        />
        <Typography
          variant="h6"
          color="#6b7280"
          fontWeight="300"
          sx={{ textAlign: 'center', maxWidth: 960, mx: 'auto', lineHeight: 1.7 }}
        >
          Keep everyone in sync with SMS, email, and push notifications. Shift changes, approvals,
          and updates are delivered instantly.
        </Typography>
      </PageLayout>

      {/* Final CTA */}
      <PageLayout maxWidth="md" spacing={3} padding={{ xs: 4, md: 8 }} fullWidth>
        <Box
          sx={{
            bgcolor: '#f9fafb',
            textAlign: 'center',
            py: { xs: 6, md: 8 },
            px: { xs: 3, md: 4 },
          }}
        >
          <PageHeader
            title="Ready to simplify your scheduling?"
            subtitle="Join thousands of teams who've streamlined their workforce management"
            variant="compact"
          />

          <Button
            href="/signup"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#1f2937',
              '&:hover': { bgcolor: '#111827' },
              px: 6,
              py: 2,
              fontWeight: 500,
              fontSize: '1.2rem',
            }}
          >
            Create free account
          </Button>
        </Box>
      </PageLayout>
    </Box>
  );
}
