# E2E Test Suite

Comprehensive end-to-end test suite for NextShyft API and UI.

## Overview

This test suite provides complete coverage of:
- ✅ API Validation
- ✅ Authorization & Access Control
- ✅ Business Logic Workflows
- ✅ Error Handling
- ✅ Edge Cases
- ✅ UI Integration
- ✅ Performance & Rate Limiting

## Test Files

### API Tests

#### `validation.spec.ts`
Tests input validation for all data-modifying endpoints:
- Required fields validation
- Data type validation
- Format validation (email, ObjectId, time, etc.)
- Length constraints
- Enum validation

**Coverage:** 15+ validation scenarios across 10+ routes

#### `authorization.spec.ts`
Tests access control and permissions:
- Unauthenticated access (401)
- Insufficient permissions (403)
- Role-based access (EMPLOYEE, MANAGER, OWNER, SUPERADMIN)
- Cross-organization access prevention

**Coverage:** 12+ authorization scenarios

#### `workflows.spec.ts`
Tests complete business workflows:
- Schedule creation and management
- Employee availability setting
- Swap request lifecycle
- Invitation flow
- Announcement system
- Organization management

**Coverage:** 6 major workflows end-to-end

#### `edge-cases.spec.ts`
Tests boundary conditions and unusual scenarios:
- Input sanitization (XSS prevention)
- Error handling
- Empty/null values
- Maximum lengths
- Concurrent requests
- Rate limiting
- Audit logging
- Session management

**Coverage:** 20+ edge case scenarios

#### `ui-integration.spec.ts`
Tests UI and full-stack integration:
- Manager dashboard navigation
- Employee dashboard access
- Form validation in UI
- Responsive design
- Error pages
- Loading states

**Coverage:** 15+ UI scenarios

### Supporting Files

#### `auth.ts`
Authentication helpers:
- `mockLogin()` - Create mock session for testing
- `mockLogout()` - Clear session

#### `helpers.ts`
Test utilities and data generators:
- Test data generators
- Assertion helpers
- Mock data sets
- Performance measurement tools

## Running Tests

### Prerequisites

1. **Environment Setup:**
   ```bash
   # Copy example env
   cp .env.example .env.local
   
   # Set test mode
   TEST_BYPASS_AUTH=1
   ```

2. **Database:**
   - Tests use mock authentication, minimal DB setup needed
   - Some tests may require seeded data

### Run All Tests

```bash
# Start dev server (Terminal 1)
pnpm dev

# Run all E2E tests (Terminal 2)
pnpm e2e
```

### Run Specific Test Files

```bash
# Run validation tests only
pnpm e2e validation

# Run authorization tests only
pnpm e2e authorization

# Run workflow tests only
pnpm e2e workflows

# Run edge case tests only
pnpm e2e edge-cases

# Run UI integration tests only
pnpm e2e ui-integration
```

### Run in Different Modes

```bash
# Run with UI (headed mode)
pnpm e2e --headed

# Run in debug mode
pnpm e2e --debug

# Run specific test
pnpm e2e --grep "shift assign - rejects missing shiftId"

# Run tests matching pattern
pnpm e2e --grep "validation"
```

### CI/CD

Tests run automatically in GitHub Actions:
```yaml
# .github/workflows/ci.yml
- name: Run E2E tests
  run: |
    pnpm build
    pnpm start &
    sleep 5
    pnpm e2e
```

## Test Structure

### Typical Test Pattern

```typescript
import { test, expect } from '@playwright/test';
import { mockLogin, mockLogout } from './auth';

test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login with appropriate role
    await mockLogin(page, { roles: ['MANAGER'], orgId: 'test-org' });
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Logout
    await mockLogout(page);
  });

  test('should perform action', async ({ request }) => {
    // Arrange
    const data = { field: 'value' };

    // Act
    const res = await request.post('/api/endpoint', { data });

    // Assert
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('expectedField');
  });
});
```

## Test Coverage

### By Feature

| Feature | Validation | Authorization | Workflows | Edge Cases | UI |
|---------|-----------|---------------|-----------|------------|-----|
| Shifts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Swaps | ✅ | ✅ | ✅ | ✅ | ✅ |
| Positions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Templates | ✅ | ✅ | ✅ | ❌ | ❌ |
| Policy | ✅ | ✅ | ✅ | ❌ | ✅ |
| Availability | ✅ | ❌ | ✅ | ❌ | ✅ |
| Invites | ✅ | ✅ | ✅ | ✅ | ❌ |
| Announcements | ✅ | ✅ | ✅ | ✅ | ❌ |
| Organization | ✅ | ✅ | ✅ | ✅ | ❌ |
| Audit | ❌ | ✅ | ❌ | ✅ | ❌ |
| Schedules | ✅ | ❌ | ✅ | ❌ | ✅ |

**Overall Coverage: ~75% across all features**

### By Test Type

- **API Tests:** 80+ test cases
- **UI Tests:** 15+ test cases
- **Integration Tests:** 10+ workflows
- **Total:** 105+ test cases

## Writing New Tests

### 1. Choose Appropriate Test File

- **Validation?** → `validation.spec.ts`
- **Authorization?** → `authorization.spec.ts`
- **Complete workflow?** → `workflows.spec.ts`
- **Edge case?** → `edge-cases.spec.ts`
- **UI behavior?** → `ui-integration.spec.ts`

### 2. Use Test Helpers

```typescript
import { 
  generateTestEmail,
  generateObjectId,
  expectValidationError,
  expectForbidden 
} from './helpers';

test('my test', async ({ request }) => {
  const email = generateTestEmail('mytest');
  const id = generateObjectId();
  
  const res = await request.post('/api/endpoint', {
    data: { email, id }
  });
  
  await expectValidationError(res);
});
```

### 3. Follow Naming Conventions

```typescript
// Good test names (clear, specific, includes expected behavior)
test('shift assign - rejects missing shiftId')
test('employee cannot access manager endpoints')
test('complete schedule workflow')

// Bad test names (vague, unclear expectations)
test('test shifts')
test('authorization')
test('workflow')
```

### 4. Keep Tests Independent

```typescript
// Good - test is self-contained
test('can create position', async ({ request }) => {
  const res = await request.post('/api/positions', {
    data: { name: 'Server' }
  });
  expect(res.ok()).toBeTruthy();
});

// Bad - test depends on external state
test('can update position', async ({ request }) => {
  // Assumes position with ID '123' exists
  const res = await request.put('/api/positions/123', {
    data: { name: 'Updated' }
  });
});
```

## Debugging Tests

### View Test Results

```bash
# Show test report
pnpm e2e --reporter=html

# Open report
open playwright-report/index.html
```

### Debug Failing Test

```bash
# Run single test with UI
pnpm e2e --grep "test name" --headed --debug

# Or use VSCode Playwright extension
# 1. Install extension
# 2. Open test file
# 3. Click debug icon next to test
```

### Inspect Network Requests

```typescript
test('inspect requests', async ({ page }) => {
  page.on('request', req => console.log('→', req.method(), req.url()));
  page.on('response', res => console.log('←', res.status(), res.url()));
  
  await mockLogin(page);
  // ... rest of test
});
```

### Take Screenshots

```typescript
test('visual verification', async ({ page }) => {
  await page.goto('/org/test-org/schedule');
  await page.screenshot({ path: 'screenshot.png' });
});
```

## Troubleshooting

### "Test timeout"
- Increase timeout: `test.setTimeout(60000)`
- Check if dev server is running
- Verify network requests complete

### "Connection refused"
- Ensure dev server is running: `pnpm dev`
- Check `PLAYWRIGHT_BASE_URL` in config
- Verify port 3000 is not in use

### "Unauthorized" errors
- Check `TEST_BYPASS_AUTH=1` is set
- Verify `mockLogin()` is called
- Check session cookie is set

### "Rate limit exceeded"
- Tests run too fast
- Skip rate limit tests in CI: `test.skip()`
- Add delay between requests: `await page.waitForTimeout(100)`

### "Validation failed" unexpectedly
- Check schema matches route expectations
- Verify test data is valid
- Review recent schema changes

## Best Practices

1. **Always use beforeEach/afterEach for auth**
   ```typescript
   test.beforeEach(async ({ page }) => {
     await mockLogin(page);
   });
   test.afterEach(async ({ page }) => {
     await mockLogout(page);
   });
   ```

2. **Generate unique test data**
   ```typescript
   const email = `test-${Date.now()}@example.com`;
   const name = `Test ${Date.now()}`;
   ```

3. **Test both success and failure cases**
   ```typescript
   test('accepts valid input', async ({ request }) => { /* ... */ });
   test('rejects invalid input', async ({ request }) => { /* ... */ });
   ```

4. **Use descriptive assertions**
   ```typescript
   // Good
   expect(response.status()).toBe(400);
   expect(body.error).toContain('Validation failed');
   
   // Bad
   expect(response.ok()).toBeFalsy();
   ```

5. **Keep tests focused**
   - One behavior per test
   - Test name describes what and why
   - Easy to understand failure

## Performance

Tests are optimized for speed:
- Parallel execution (default)
- API-only tests (no UI overhead)
- Mock authentication (no real auth flow)
- Minimal database queries

**Typical run time:**
- Validation tests: ~10 seconds
- Authorization tests: ~8 seconds
- Workflow tests: ~15 seconds
- Edge case tests: ~12 seconds
- UI tests: ~20 seconds
- **Total: ~65 seconds** for full suite

## CI/CD Integration

Tests run in GitHub Actions on:
- Pull requests
- Pushes to main
- Daily scheduled runs

See `.github/workflows/ci.yml` for configuration.

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Add validation tests
3. Add authorization tests
4. Add workflow test if applicable
5. Update this README with coverage info

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Best Practices](../TESTING.md)
- [API Documentation](../API_IMPLEMENTATION_SUMMARY.md)
- [Security Guide](../SECURITY.md)
