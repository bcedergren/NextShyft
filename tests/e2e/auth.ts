import { Page, expect } from '@playwright/test';

export async function mockLogin(
  page: Page,
  opts?: { email?: string; roles?: string[] | string; orgId?: string },
) {
  const email = opts?.email || process.env.TEST_EMAIL || 'e2e-owner@example.com';
  const roles = Array.isArray(opts?.roles)
    ? opts?.roles.join(',')
    : opts?.roles || process.env.TEST_ROLES || 'OWNER';
  const orgId = opts?.orgId || process.env.TEST_ORG_ID || 'e2e-org';
  const res = await page.request.get(
    `/api/test/login?email=${encodeURIComponent(email)}&roles=${encodeURIComponent(roles)}&orgId=${encodeURIComponent(orgId)}`,
  );
  expect(res.ok()).toBeTruthy();
}

export async function mockLogout(page: Page) {
  const res = await page.request.get('/api/test/logout');
  expect(res.ok()).toBeTruthy();
}
