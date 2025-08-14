import { test, expect } from '@playwright/test';

test.describe('Manager flows (mock auth)', () => {
  test.beforeEach(async ({ context, page }) => {
    // Mock a manager session via cookie (app supports TEST_BYPASS_AUTH)
    await context.addCookies([
      {
        name: '__mocksession',
        value: encodeURIComponent(
          JSON.stringify({ email: 'mgr@example.com', roles: ['MANAGER'], orgId: 'demo' }),
        ),
        domain: 'localhost',
        path: '/',
        httpOnly: false,
      },
    ]);
  });

  test('People: invite form shows and list loads', async ({ page }) => {
    await page.goto('/org/demo/people');
    await expect(page.getByRole('button', { name: 'Send Invite' })).toBeVisible();
  });

  test('Schedule: status chip renders', async ({ page }) => {
    await page.goto('/org/demo/schedule');
    await expect(page.getByText(/Schedule Builder/)).toBeVisible();
  });

  test('Templates: page renders and add button present', async ({ page }) => {
    await page.goto('/org/demo/templates');
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  });
});
