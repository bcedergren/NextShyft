import { test, expect } from '@playwright/test';

const enabled =
  process.env.TEST_CREDENTIALS_AUTH === '1' &&
  !!process.env.TEST_EMAIL &&
  !!process.env.TEST_PASSWORD;

(enabled ? test : test.skip)('real credentials sign-in flow (optional)', async ({ page }) => {
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  await page.goto(baseURL + '/signin');
  await page.getByLabel('Email').fill(process.env.TEST_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard|\/org\//);
});
