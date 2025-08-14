
import { test, expect } from '@playwright/test';

test('health endpoint responds', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json).toHaveProperty('ok', true);
});

test('homepage renders', async ({ page }) => {
  await page.goto('/');
  // AppShell likely present; be flexible:
  await expect(page).toHaveTitle(/NextShyft|Next\.js/i);
});
