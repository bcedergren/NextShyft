# API Testing Guide

This guide provides comprehensive testing strategies for the NextShyft API endpoints.

## Test Strategy

All API routes should be tested for:

1. **Input Validation** - Invalid/missing required fields
2. **Authorization** - Unauthorized access attempts
3. **Business Logic** - Correct behavior with valid inputs
4. **Error Handling** - Proper error responses
5. **Edge Cases** - Boundary conditions and unusual inputs

## Testing Tools

### Current Setup

- **Playwright** - E2E testing (`pnpm e2e`)
- **Jest** - Unit testing (`pnpm test`)
- Test files in `tests/` directory

### Running Tests

```bash
# Run all tests
pnpm test

# Run E2E tests (requires dev server running)
pnpm dev  # Terminal 1
pnpm e2e  # Terminal 2

# Run specific test file
pnpm test InviteService.test.ts
```

## Test Categories

### 1. Validation Tests

Test that routes reject invalid inputs:

```typescript
// Example: Test shift assignment validation
describe('POST /api/shifts/assign', () => {
  it('should reject missing shiftId', async () => {
    const response = await fetch('/api/shifts/assign', {
      method: 'PUT',
      body: JSON.stringify({ staffId: '123' }), // Missing shiftId
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('Validation failed');
  });

  it('should reject invalid ObjectId format', async () => {
    const response = await fetch('/api/shifts/assign', {
      method: 'PUT',
      body: JSON.stringify({ shiftId: 'invalid', staffId: '123abc' }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(400);
  });
});
```

### 2. Authorization Tests

Test that routes enforce proper access control:

```typescript
describe('Authorization', () => {
  it('should reject unauthenticated requests', async () => {
    const response = await fetch('/api/shifts/assign', {
      method: 'PUT',
      body: JSON.stringify({ shiftId: validId, staffId: validId }),
    });
    expect(response.status).toBe(401);
  });

  it('should reject employee role for manager endpoints', async () => {
    // Login as employee
    await loginAs({ role: 'EMPLOYEE' });
    
    const response = await fetch('/api/shifts/assign', {
      method: 'PUT',
      body: JSON.stringify({ shiftId: validId, staffId: validId }),
    });
    expect(response.status).toBe(403);
  });

  it('should reject cross-org access', async () => {
    // Login as manager in org1
    await loginAs({ orgId: 'org1', role: 'MANAGER' });
    
    // Try to access org2 resource
    const response = await fetch(`/api/shifts/${org2ShiftId}`, {
      method: 'GET',
    });
    expect(response.status).toBe(403);
  });
});
```

### 3. Business Logic Tests

Test that routes perform expected operations:

```typescript
describe('Swap Request', () => {
  it('should create swap request and notify managers', async () => {
    await loginAs({ role: 'EMPLOYEE', email: 'employee@test.com' });
    
    const response = await fetch('/api/swaps', {
      method: 'POST',
      body: JSON.stringify({
        shiftId: validShiftId,
        type: 'open',
        reason: 'Personal emergency',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.swap).toBeDefined();
    
    // Verify audit log created
    const audit = await getAuditLogs({ action: 'SWAP_CREATE' });
    expect(audit.length).toBeGreaterThan(0);
    
    // Verify manager notification sent
    const notifications = await getNotifications({ type: 'SWAP_REQUEST' });
    expect(notifications.length).toBeGreaterThan(0);
  });
});
```

### 4. Error Handling Tests

Test that routes handle errors gracefully:

```typescript
describe('Error Handling', () => {
  it('should handle database errors gracefully', async () => {
    // Simulate DB connection failure
    mockDbError();
    
    const response = await fetch('/api/positions', {
      method: 'GET',
    });
    
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Internal server error'); // Production mode
  });

  it('should handle Stripe errors in billing', async () => {
    mockStripeError('card_declined');
    
    const response = await fetch('/api/billing/checkout?plan=pro', {
      method: 'POST',
    });
    
    expect(response.status).toBe(400);
  });
});
```

### 5. Edge Case Tests

Test boundary conditions and unusual inputs:

```typescript
describe('Edge Cases', () => {
  it('should handle empty arrays in bulk operations', async () => {
    const response = await fetch('/api/templates/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: [] }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(200); // Should succeed with no deletions
  });

  it('should handle very long strings within limits', async () => {
    const longName = 'a'.repeat(200); // Max allowed
    const response = await fetch('/api/positions', {
      method: 'POST',
      body: JSON.stringify({ name: longName }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(200);
  });

  it('should reject strings exceeding limits', async () => {
    const tooLong = 'a'.repeat(201);
    const response = await fetch('/api/positions', {
      method: 'POST',
      body: JSON.stringify({ name: tooLong }),
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status).toBe(400);
  });
});
```

## Test Coverage by Route

### High Priority Routes (Critical Path)

- [x] `/api/shifts/assign` - Validation + Authorization
- [x] `/api/swaps` (POST/PUT) - Validation + Authorization + Business Logic
- [x] `/api/policy` (PUT) - Validation + Authorization
- [x] `/api/availability` (PUT) - Validation
- [x] `/api/invites` (POST) - Validation + Authorization
- [x] `/api/positions` (POST) - Validation + Sanitization
- [x] `/api/templates` (POST) - Validation + Sanitization
- [x] `/api/announcements` (POST) - Validation + Authorization + Sanitization
- [x] `/api/org` (PUT) - Validation + Authorization + Sanitization

### Medium Priority Routes

- [ ] `/api/push/subscribe` - Validation
- [ ] `/api/me/profile` - Validation + Sanitization
- [ ] `/api/me/notifications` - Validation
- [ ] `/api/schedules` (POST) - Validation + Business Logic
- [ ] `/api/shifts/copy` - Validation + Authorization
- [ ] `/api/shifts/[id]/time` - Validation + Authorization
- [ ] `/api/users/[id]/positions` - Validation + Authorization
- [ ] `/api/audit` - Authorization
- [ ] `/api/audit/export` - Authorization
- [ ] `/api/availability/all` - Authorization

### Integration Tests

- [ ] Schedule generation end-to-end
- [ ] Swap request to approval flow
- [ ] Invite creation to acceptance
- [ ] Billing checkout to webhook
- [ ] Organization suspension flow

## Mock Data Helpers

```typescript
// tests/helpers/mockData.ts

export const mockUser = {
  email: 'test@example.com',
  name: 'Test User',
  orgId: 'org123',
  roles: ['EMPLOYEE'],
};

export const mockOrg = {
  _id: 'org123',
  name: 'Test Org',
  plan: 'pro',
  suspended: false,
};

export const mockShift = {
  _id: 'shift123',
  orgId: 'org123',
  date: '2026-02-01',
  start: '09:00',
  end: '17:00',
  positionId: 'pos123',
  assignments: [],
};
```

## Database Setup for Tests

```typescript
// tests/setup.ts

beforeAll(async () => {
  await connectTestDb();
});

afterAll(async () => {
  await disconnectTestDb();
});

beforeEach(async () => {
  await clearTestData();
});

export async function clearTestData() {
  await Promise.all([
    User.deleteMany({}),
    Org.deleteMany({}),
    Shift.deleteMany({}),
    // ... other models
  ]);
}
```

## E2E Test Pattern

```typescript
// tests/e2e/shift-management.spec.ts

test('Manager can assign employees to shifts', async ({ page }) => {
  // Login as manager
  await page.goto('/api/test/login?email=manager@test.com&roles=MANAGER&orgId=demo');
  
  // Navigate to schedule
  await page.goto('/org/demo/schedule');
  
  // Click on shift
  await page.click('[data-testid="shift-123"]');
  
  // Assign employee
  await page.selectOption('[data-testid="staff-select"]', 'employee@test.com');
  await page.click('[data-testid="assign-button"]');
  
  // Verify assignment
  await expect(page.locator('[data-testid="shift-123-assigned"]')).toContainText('Employee Name');
});
```

## Continuous Integration

Tests run automatically on:

- Pull requests
- Pushes to main branch
- Scheduled daily runs

### CI Configuration

See `.github/workflows/ci.yml` for:

- Linting
- Type checking
- Unit tests
- E2E tests
- Build verification

## Test Maintenance

### Adding New Tests

When adding a new API route:

1. Create test file: `tests/api/[route-name].test.ts`
2. Add validation tests
3. Add authorization tests
4. Add business logic tests
5. Update this guide's coverage checklist

### Updating Tests

When modifying routes:

1. Update corresponding test file
2. Ensure all test cases pass
3. Add new test cases for new behavior
4. Update mock data if schemas changed

## Performance Testing

```bash
# Load testing (requires k6 or similar)
k6 run tests/load/api-load.js

# Response time benchmarking
pnpm test -- --testNamePattern="performance"
```

## Security Testing

Automated security tests to add:

- [ ] SQL injection attempts
- [ ] XSS payload injection
- [ ] CSRF token validation
- [ ] Rate limit enforcement
- [ ] Session hijacking prevention
- [ ] API key exposure checks

## Useful Commands

```bash
# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test suite
pnpm test --testPathPattern=InviteService

# Debug tests
node --inspect-brk node_modules/.bin/jest --runInBand

# Update snapshots
pnpm test -- -u
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [API Testing Guide](https://www.postman.com/api-testing/)
