'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, LayoutDashboard, Bell, Check } from 'lucide-react';
import { Button, TextField, Typography, Box } from '@mui/material';
// removed MUI numeric icons in favor of lucide icons for consistency
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import PageHeader from '@/components/PageHeader';
import PageSection from '@/components/PageSection';

type RolePreset = 'OWNER' | 'MANAGER' | 'EMPLOYEE';

export default function DemoHub() {
  const router = useRouter();
  // Visual polish for lucide icons
  const ICON_STROKE = 1.75;

  // End demo button (always purges data & ends session)
  // Reusable gradient icon chip (no Tailwind required)
  const IconChip = ({
    Icon,
    from,
    to,
    ring,
    size = 56,
  }: {
    Icon: any;
    from: string;
    to: string;
    ring: string;
    size?: number;
  }) => (
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
        <Icon strokeWidth={ICON_STROKE} style={{ width: size * 0.5, height: size * 0.5 }} />
      </Box>
    </Box>
  );

  const defaultOrgId = (process.env.NEXT_PUBLIC_DEMO_ORG_ID as string | undefined) || '';
  // Hide Demo Org ID until a session is started
  const [orgId, setOrgId] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const trimmedOrgId = orgId.trim();
  const invalidOrgId = trimmedOrgId && !/^[a-f0-9]{24}$/i.test(trimmedOrgId);

  const go = useCallback(
    async (preset: RolePreset, orgOverride?: string) => {
      setError(null);
      const targetOrgId = orgOverride || trimmedOrgId;
      if (!orgOverride && invalidOrgId) {
        setError('Enter a valid Demo Organization ID to continue.');
        return;
      }
      if (!targetOrgId) {
        setError('Enter a Demo Org ID to continue.');
        return;
      }
      setBusy(true);
      try {
        const roles =
          preset === 'OWNER' ? 'OWNER' : preset === 'MANAGER' ? 'MANAGER,EMPLOYEE' : 'EMPLOYEE';
        const email =
          preset === 'OWNER'
            ? 'owner@test.com'
            : preset === 'MANAGER'
              ? 'manager@test.com'
              : 'employee@test.com';
        const res = await fetch(
          `/api/test/login?email=${encodeURIComponent(email)}&roles=${encodeURIComponent(
            roles,
          )}&orgId=${encodeURIComponent(targetOrgId)}`,
          { cache: 'no-store' },
        );
        if (!res.ok) throw new Error('Login failed');
        // Confirm session readiness: wait briefly for roles to be available
        const waitForRoles = async () => {
          for (let i = 0; i < 6; i++) {
            try {
              const rr = await fetch('/api/me/roles', { cache: 'no-store' });
              if (rr.ok) {
                const body = await rr.json();
                if (Array.isArray(body?.roles) && body.roles.length > 0) return true;
              }
            } catch {}
            await new Promise((r) => setTimeout(r, 120));
          }
          return false;
        };
        await waitForRoles();
        router.replace(
          preset === 'EMPLOYEE'
            ? `/org/${targetOrgId}/myschedule`
            : `/org/${targetOrgId}/dashboard`,
        );
      } catch (e: any) {
        setError(e?.message || 'Something went wrong.');
      } finally {
        setBusy(false);
      }
    },
    [invalidOrgId, router, trimmedOrgId],
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/test/logout', { method: 'POST', cache: 'no-store' });
    } catch {}
  }, []);

  const startDemo = useCallback(async (): Promise<string | null> => {
    try {
      if (invalidOrgId) {
        setError('Enter a valid Demo Organization ID to continue.');
        return null;
      }
      setError(null);
      setBusy(true);
      const res = await fetch('/api/demo/session/start', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: trimmedOrgId || undefined }),
      });
      const ct = res.headers.get('content-type') || '';
      let data: any = null;
      if (ct.includes('application/json')) {
        data = await res.json();
      } else {
        // Fallback to text to avoid leaking parser errors to users
        await res.text();
      }
      if (!res.ok || !data?.orgId) throw new Error(data?.error || 'Demo is unavailable right now');
      setOrgId(String(data.orgId));
      if (data?.claimToken) setClaimToken(String(data.claimToken));
      return String(data.orgId);
    } catch (e: any) {
      setError('The demo is unavailable at the moment. Please try again shortly.');
      return null;
    } finally {
      setBusy(false);
    }
  }, [invalidOrgId, trimmedOrgId]);

  const finishDemo = useCallback(async () => {
    try {
      setError(null);
      setBusy(true);
      // Ask backend to purge demo data (stubbed now)
      await fetch('/api/demo/purge', {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: trimmedOrgId }),
      });
      await fetch('/api/demo/session/end', { method: 'POST', cache: 'no-store' });
      await logout();
      setOrgId('');
      setClaimToken(null);
    } catch {
    } finally {
      setBusy(false);
    }
  }, [logout, trimmedOrgId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/demo/info', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !data?.ok) return;
        setOrgId(String(data.orgId || ''));
        setClaimToken(data?.claimToken ? String(data.claimToken) : null);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      try {
        const purge = '/api/demo/purge';
        const end = '/api/demo/session/end';
        if ('sendBeacon' in navigator) {
          navigator.sendBeacon(purge);
          navigator.sendBeacon(end);
        }
      } catch {}
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const ensureOrgAndGo = useCallback(
    async (preset: RolePreset) => {
      const newOrg = await startDemo();
      if (!newOrg) return;
      // Use the freshly created orgId to avoid any state/closure race conditions
      await go(preset, newOrg);
    },
    [startDemo, go],
  );

  return (
    <PageLayout>
      <PageHeader
        title="Try the demo"
        subtitle="Pick a role to explore with sample data. No account required."
        titleStart={
          <Link href="/" aria-label="Go to home">
            <div className="flex flex-col items-start">
              <Typography variant="h5" component="h5">
                NextShyft
              </Typography>
            </div>
          </Link>
        }
        titleBelow
        variant="compact"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button component="a" href="/signin" variant="outlined" color="inherit" size="small">
              Sign in
            </Button>
            <Button component="a" href="/signup" variant="outlined" color="inherit" size="small">
              Start free
            </Button>
          </div>
        }
      />

      <div id="demo-roles">
        <PageSection variant="card" title="Try the demo" padding={3}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: '1fr',
            }}
          >
            <div className="flex items-center gap-3">
              <Button
                onClick={startDemo}
                disabled={busy}
                variant="contained"
                color="info"
                size="small"
              >
                {busy ? 'Starting…' : 'Start demo session'}
              </Button>
              <Button component="a" href="/signup" variant="text" color="info" size="small">
                Create a free account
              </Button>
            </div>
            {/* Role cards: 1/2/3 responsive columns */}
            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                opacity: busy || !!invalidOrgId ? 0.6 : 1,
                pointerEvents: busy ? 'none' : 'auto',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
              }}
            >
              <div
                className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition shadow-slate-200/60"
                style={{ textAlign: 'center' }}
              >
                <div className="h-0.5 bg-gradient-to-r from-sky-500/50 via-indigo-500/50 to-emerald-500/50 rounded-full mb-3" />
                <div aria-hidden style={{ display: 'flex', justifyContent: 'center' }}>
                  <IconChip
                    Icon={LayoutDashboard}
                    from="#0ea5e9"
                    to="#6366f1"
                    ring="#7dd3fc"
                    size={56}
                  />
                </div>
                <p
                  className="text-xs font-medium text-emerald-700 bg-emerald-50 inline-flex px-2 py-1 rounded-full"
                  style={{ marginTop: 8 }}
                >
                  Manager
                </p>
                <h3 className="mt-2.5 font-semibold text-slate-900" style={{ fontSize: 20 }}>
                  Build and publish schedules
                </h3>
                <ul
                  className="mt-1.5 space-y-1 list-none pl-0"
                  style={{ listStyleType: 'none', paddingLeft: 0 }}
                >
                  {[
                    'Drag-and-drop assignments',
                    'Coverage editor & demand heatmap',
                    'Approve swaps and manage positions',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 shadow-sm">
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={ICON_STROKE}
                          aria-hidden
                          style={{ color: '#059669' }}
                        />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => ensureOrgAndGo('MANAGER')}
                  disabled={busy || !!invalidOrgId}
                  variant="contained"
                  color="info"
                  size="medium"
                  className="mt-4 group"
                  aria-busy={busy}
                  aria-disabled={busy || !!invalidOrgId}
                  aria-label={`View Manager demo${orgId ? ` for org ${orgId}` : ''}`}
                  endIcon={
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={ICON_STROKE}
                      aria-hidden
                    />
                  }
                >
                  {busy ? 'Loading…' : 'View Manager demo'}
                </Button>
              </div>

              <div
                className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition shadow-slate-200/60"
                style={{ textAlign: 'center' }}
              >
                <div className="h-0.5 bg-gradient-to-r from-sky-500/50 via-indigo-500/50 to-emerald-500/50 rounded-full mb-3" />
                <div aria-hidden style={{ display: 'flex', justifyContent: 'center' }}>
                  <IconChip Icon={Bell} from="#10b981" to="#14b8a6" ring="#6ee7b7" size={56} />
                </div>
                <p
                  className="text-xs font-medium text-sky-700 bg-sky-50 inline-flex px-2 py-1 rounded-full"
                  style={{ marginTop: 8 }}
                >
                  Employee
                </p>
                <h3 className="mt-2.5 font-semibold text-slate-900" style={{ fontSize: 20 }}>
                  See your schedule & request swaps
                </h3>
                <ul
                  className="mt-1.5 space-y-1 list-none pl-0"
                  style={{ listStyleType: 'none', paddingLeft: 0 }}
                >
                  {[
                    'Monthly calendar & upcoming shifts',
                    'Set availability preferences',
                    'Get notified when schedules publish',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 shadow-sm">
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={ICON_STROKE}
                          aria-hidden
                          style={{ color: '#059669' }}
                        />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => ensureOrgAndGo('EMPLOYEE')}
                  disabled={busy || !!invalidOrgId}
                  variant="contained"
                  color="success"
                  size="medium"
                  className="mt-4 group"
                  aria-busy={busy}
                  aria-disabled={busy || !!invalidOrgId}
                  aria-label={`View Employee demo${orgId ? ` for org ${orgId}` : ''}`}
                  endIcon={
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={ICON_STROKE}
                      aria-hidden
                    />
                  }
                >
                  {busy ? 'Loading…' : 'View Employee demo'}
                </Button>
              </div>

              <Box
                className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md hover:-translate-y-0.5 transition shadow-slate-200/60"
                style={{ textAlign: 'center' }}
              >
                <div className="h-0.5 bg-gradient-to-r from-sky-500/50 via-indigo-500/50 to-emerald-500/50 rounded-full mb-3" />
                <div aria-hidden style={{ display: 'flex', justifyContent: 'center' }}>
                  <IconChip
                    Icon={ShieldCheck}
                    from="#6366f1"
                    to="#8b5cf6"
                    ring="#a5b4fc"
                    size={56}
                  />
                </div>
                <p
                  className="text-xs font-medium text-slate-700 bg-slate-100 inline-flex px-2 py-1 rounded-full"
                  style={{ marginTop: 8 }}
                >
                  Owner
                </p>
                <h3 className="mt-2.5 font-semibold text-slate-900" style={{ fontSize: 20 }}>
                  Set policies & manage your team
                </h3>
                <ul
                  className="mt-1.5 space-y-1 list-none pl-0"
                  style={{ listStyleType: 'none', paddingLeft: 0 }}
                >
                  {[
                    'Org settings, roles, and approvals',
                    'Plan limits & billing overview',
                    'Announcements & notifications',
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300 shadow-sm">
                        <Check
                          className="h-3.5 w-3.5"
                          strokeWidth={ICON_STROKE}
                          aria-hidden
                          style={{ color: '#059669' }}
                        />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => ensureOrgAndGo('OWNER')}
                  disabled={busy || !!invalidOrgId}
                  variant="contained"
                  color="inherit"
                  size="medium"
                  className="mt-4 group"
                  aria-busy={busy}
                  aria-disabled={busy || !!invalidOrgId}
                  aria-label={`View Owner demo${orgId ? ` for org ${orgId}` : ''}`}
                  endIcon={
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={ICON_STROKE}
                      aria-hidden
                    />
                  }
                >
                  {busy ? 'Loading…' : 'View Owner demo'}
                </Button>
              </Box>
            </Box>
            {/* Get started panel underneath in 1 column */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 h-fit">
              <h4 className="text-sm font-semibold text-slate-900">Get started</h4>
              <p className="text-sm text-slate-600 mt-1">
                Use your demo organization to jump right in. No signup needed.
              </p>

              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-800">Demo data included</p>
                <ul className="mt-1 text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                  <li>Sample positions, templates, and coverage goals</li>
                  <li>Pre-filled announcements and notifications</li>
                  <li>Manager, Employee, and Owner perspectives</li>
                </ul>
              </div>

              {orgId ? (
                <>
                  <label
                    htmlFor="demo-org-id"
                    className="text-xs font-medium text-slate-700 mt-4 block"
                  >
                    Demo Organization ID
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <TextField
                      id="demo-org-id"
                      aria-label="Demo Organization ID"
                      placeholder="Paste your Demo Org ID"
                      value={orgId}
                      onChange={(e) => setOrgId(e.target.value)}
                      size="small"
                      fullWidth
                      error={!!invalidOrgId}
                      helperText={invalidOrgId ? 'This doesn’t look like a typical ID.' : undefined}
                    />
                  </div>
                </>
              ) : null}
              {defaultOrgId ? null : (
                <>
                  <p className="text-xs text-slate-500 mt-2">
                    Don’t have one? Create your free account or contact us for a hosted demo.
                  </p>
                  {process.env.NODE_ENV !== 'production' && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Dev tip: seed demo data locally with the repo scripts and TEST_ACCOUNTS.md.
                    </p>
                  )}
                </>
              )}

              {error && (
                <p className="mt-3 text-sm text-rose-600" role="alert" aria-live="polite">
                  {error}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-500">
                The demo is for evaluation only and may reset periodically.
              </p>

              <Box
                sx={{
                  mt: 3,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                  gap: 3,
                }}
              >
                <Button onClick={finishDemo} variant="outlined" color="error" size="small">
                  End demo
                </Button>
                <Button
                  component="a"
                  href={`/signup?importDemo=1${orgId ? `&orgId=${encodeURIComponent(orgId)}` : ''}${claimToken ? `&claimToken=${encodeURIComponent(claimToken)}` : ''}`}
                  variant="contained"
                  color="info"
                  size="small"
                >
                  Import demo data & sign up
                </Button>
                {/* Clear button merged into End demo menu */}
                <Button component="a" href="/signin" variant="outlined" color="info" size="small">
                  Go to Sign in
                </Button>
              </Box>
            </div>
          </Box>
        </PageSection>
      </div>
    </PageLayout>
  );
}
