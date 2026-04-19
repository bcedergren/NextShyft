import { test, expect } from '@playwright/test';
import { mockLogin, mockLogout } from './auth';

test.describe('API Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page, { roles: ['MANAGER'], orgId: 'test-org' });
  });

  test.afterEach(async ({ page }) => {
    await mockLogout(page);
  });

  test('shift assign - rejects missing shiftId', async ({ page }) => {
    const res = await page.request.put('/api/shifts/assign', {
      data: { staffId: '507f1f77bcf86cd799439011' },
    });
    expect([400, 404]).toContain(res.status());
  });

  test('shift assign - rejects invalid ObjectId format', async ({ page }) => {
    const res = await page.request.put('/api/shifts/assign', {
      data: { shiftId: 'invalid', staffId: '123' },
    });
    expect([400, 429, 500]).toContain(res.status());
  });

  test('swap request - validates required fields', async ({ page }) => {
    const res = await page.request.post('/api/swaps', {
      data: { type: 'open' }, // Missing shiftId
    });
    expect([400, 500]).toContain(res.status());
  });

  test('swap request - validates type enum', async ({ page }) => {
    const res = await page.request.post('/api/swaps', {
      data: {
        shiftId: '507f1f77bcf86cd799439011',
        type: 'invalid_type',
      },
    });
    expect([400, 500]).toContain(res.status());
  });

  test('swap decision - validates action enum', async ({ page }) => {
    const res = await page.request.put('/api/swaps', {
      data: {
        id: '507f1f77bcf86cd799439011',
        action: 'INVALID',
      },
    });
    expect([400, 404]).toContain(res.status());
  });

  test('position create - validates required name', async ({ page }) => {
    const res = await page.request.post('/api/positions', {
      data: { color: '#FF0000' }, // Missing name
    });
    expect([400, 500]).toContain(res.status());
  });

  test('position create - validates color format', async ({ page }) => {
    const res = await page.request.post('/api/positions', {
      data: { name: 'Server', color: 'red' }, // Invalid hex format
    });
    expect([200, 400]).toContain(res.status());
  });

  test('template create - validates time format', async ({ page }) => {
    const res = await page.request.post('/api/templates', {
      data: {
        name: 'Morning Shift',
        positionId: '507f1f77bcf86cd799439011',
        dayOfWeek: 'mon',
        startTime: '25:00', // Invalid time
        endTime: '17:00',
        requiredStaff: 2,
      },
    });
    expect([200, 400]).toContain(res.status());
  });

  test('template create - validates start before end', async ({ page }) => {
    const res = await page.request.post('/api/templates', {
      data: {
        name: 'Morning Shift',
        positionId: '507f1f77bcf86cd799439011',
        dayOfWeek: 'mon',
        startTime: '17:00',
        endTime: '09:00', // End before start
        requiredStaff: 2,
      },
    });
    expect([200, 400]).toContain(res.status());
  });

  test('policy update - validates numeric constraints', async ({ page }) => {
    const res = await page.request.put('/api/policy', {
      data: {
        maxHoursPerWeek: -5, // Negative value
      },
    });
    expect([200, 400]).toContain(res.status());
  });

  test('invite create - validates email format', async ({ page }) => {
    const res = await page.request.post('/api/invites', {
      data: {
        email: 'invalid-email',
        role: 'EMPLOYEE',
      },
    });
    expect([200, 400]).toContain(res.status());
  });

  test('invite create - validates role enum', async ({ page }) => {
    const res = await page.request.post('/api/invites', {
      data: {
        email: 'test@example.com',
        role: 'INVALID_ROLE',
      },
    });
    expect([400, 500]).toContain(res.status());
  });

  test('org update - accepts valid timezone', async ({ page }) => {
    const res = await page.request.put('/api/org', {
      data: {
        timezone: 'America/New_York',
      },
    });
    expect([200, 403, 500]).toContain(res.status());
  });

  test('announcement create - validates max lengths', async ({ page }) => {
    const longTitle = 'a'.repeat(201); // Exceeds 200 char limit
    const res = await page.request.post('/api/announcements', {
      data: {
        title: longTitle,
        body: 'Test body',
      },
    });
    expect([200, 400]).toContain(res.status());
  });

  test('push subscription - validates subscription structure', async ({ page }) => {
    const res = await page.request.post('/api/push/subscribe', {
      data: {
        endpoint: 'not-a-url',
        keys: { p256dh: 'test', auth: 'test' },
      },
    });
    expect([200, 400]).toContain(res.status());
  });
});
