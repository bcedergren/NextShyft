import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

// Helper: start a demo session to get an orgId
async function startDemo(page: import('@playwright/test').Page) {
  await page.goto(base + '/demo');
  await page.getByRole('button', { name: /start demo session/i }).click();
  await expect(
    page.getByRole('button', { name: /view (manager|employee) demo/i }).first(),
  ).toBeVisible({ timeout: 10000 });
}

test.describe('Demo role routing', () => {
  test('Manager demo goes to org dashboard', async ({ page }) => {
    await startDemo(page);
    await page.getByRole('button', { name: /view manager demo/i }).click();
    await page.waitForURL(/\/org\/.+\/dashboard$/);
    await expect(page).toHaveURL(/\/org\/.+\/dashboard$/);
    await expect(page.getByText('Dashboard', { exact: false })).toBeVisible();
  });

  test('Employee demo goes to My Schedule', async ({ page }) => {
    await startDemo(page);
    await page.getByRole('button', { name: /view employee demo/i }).click();
    await page.waitForURL(/\/org\/.+\/myschedule$/);
    await expect(page).toHaveURL(/\/org\/.+\/myschedule$/);
  });
});
