import { test, expect } from '@playwright/test';
import { mockLogin, mockLogout } from './auth';

test('mock auth can access a protected page', async ({ page }) => {
  test.skip(process.env.TEST_BYPASS_AUTH !== '1', 'Requires TEST_BYPASS_AUTH=1');
  await mockLogin(page, { roles: 'OWNER', orgId: process.env.TEST_ORG_ID || 'e2e-org' });

  await page.goto('/');
  await expect(page).toHaveURL(/http:\/\/.*:\d+\//);

  await mockLogout(page);
});
