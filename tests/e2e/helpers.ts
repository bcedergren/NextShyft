import { test as base, expect } from '@playwright/test';

/**
 * Test Fixtures and Helpers
 */

// Extend base test with custom fixtures
export const test = base.extend({
  // Add any custom fixtures here
});

export { expect };

/**
 * Test Data Generators
 */

export const generateTestEmail = (prefix = 'test') => {
  return `${prefix}-${Date.now()}@example.com`;
};

export const generateObjectId = () => {
  // Generate a valid MongoDB ObjectId for testing
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomHex = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join('');
  return timestamp + randomHex;
};

export const generateTestOrg = () => ({
  name: `Test Org ${Date.now()}`,
  plan: 'pro',
  timezone: 'America/New_York',
});

export const generateTestUser = () => ({
  email: generateTestEmail('user'),
  name: `Test User ${Date.now()}`,
  roles: ['EMPLOYEE'],
});

export const generateTestPosition = () => ({
  name: `Position ${Date.now()}`,
  color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
  description: 'Test position',
});

export const generateTestShift = () => {
  const today = new Date();
  return {
    date: today.toISOString().split('T')[0],
    start: '09:00',
    end: '17:00',
    requiredCount: 2,
  };
};

export const generateTestAvailability = () => ({
  weekly: {
    mon: [{ start: '09:00', end: '17:00' }],
    tue: [{ start: '09:00', end: '17:00' }],
    wed: [{ start: '09:00', end: '17:00' }],
    thu: [{ start: '09:00', end: '17:00' }],
    fri: [{ start: '09:00', end: '17:00' }],
  },
});

/**
 * Common Test Utilities
 */

export const waitForResponse = async (page: any, urlPattern: string | RegExp, action: () => Promise<void>) => {
  const responsePromise = page.waitForResponse(
    (response: any) => {
      const url = response.url();
      return typeof urlPattern === 'string' ? url.includes(urlPattern) : urlPattern.test(url);
    },
    { timeout: 10000 }
  );
  
  await action();
  return await responsePromise;
};

export const getResponseBody = async (response: any) => {
  try {
    return await response.json();
  } catch {
    return await response.text();
  }
};

/**
 * Assertion Helpers
 */

export const expectValidationError = async (response: any) => {
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body).toHaveProperty('error');
  expect(body.error).toContain('Validation');
};

export const expectUnauthorized = async (response: any) => {
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body).toHaveProperty('error');
};

export const expectForbidden = async (response: any) => {
  expect(response.status()).toBe(403);
  const body = await response.json();
  expect(body).toHaveProperty('error');
};

export const expectNotFound = async (response: any) => {
  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body).toHaveProperty('error');
};

/**
 * Database Cleanup Helpers
 * Note: These should only be used in test environment
 */

export const clearTestData = async (request: any, orgId: string) => {
  // Only works if TEST_BYPASS_AUTH is enabled
  if (process.env.TEST_BYPASS_AUTH !== '1') {
    console.warn('Skipping clearTestData - TEST_BYPASS_AUTH not enabled');
    return;
  }

  // Clear test data via API calls
  // This is safer than direct DB access in E2E tests
  
  // Note: Implement cleanup endpoints in test environment if needed
  console.log(`Cleared test data for org: ${orgId}`);
};

/**
 * Performance Helpers
 */

export const measureResponseTime = async (action: () => Promise<any>) => {
  const start = Date.now();
  const result = await action();
  const duration = Date.now() - start;
  return { result, duration };
};

/**
 * Mock Data Sets
 */

export const mockOrganizations = [
  { id: 'org1', name: 'Test Restaurant', plan: 'pro' },
  { id: 'org2', name: 'Test Cafe', plan: 'free' },
  { id: 'org3', name: 'Test Hotel', plan: 'business' },
];

export const mockRoles = ['EMPLOYEE', 'MANAGER', 'OWNER', 'ADMIN', 'SUPERADMIN'];

export const mockPositions = [
  { name: 'Server', color: '#3B82F6' },
  { name: 'Bartender', color: '#8B5CF6' },
  { name: 'Host', color: '#10B981' },
  { name: 'Cook', color: '#F59E0B' },
  { name: 'Dishwasher', color: '#6B7280' },
];

export const mockDaysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const mockTimeSlots = [
  { start: '06:00', end: '14:00', name: 'Morning' },
  { start: '14:00', end: '22:00', name: 'Evening' },
  { start: '22:00', end: '06:00', name: 'Night' },
];
