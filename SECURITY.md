# Security Guide

This document outlines the security measures implemented in NextShyft and best practices for maintaining security.

## Input Validation

All API routes now use **Zod schemas** for input validation:

- Located in `lib/validation/schemas.ts`
- Validates request body, query parameters, and route parameters
- Automatic error responses with detailed validation messages
- Prevents injection attacks and malformed data

### Example Usage

```typescript
import { validateBody } from '@/lib/validation/middleware';
import { userPositionsSchema } from '@/lib/validation/schemas';

const { positions } = await validateBody(req, userPositionsSchema);
```

## Authorization

### Role-Based Access Control (RBAC)

Routes are protected using consistent authorization guards:

- `requireManager()` - Manager, Owner, Admin, or SuperAdmin roles
- `requireOwner()` - Owner, Admin, or SuperAdmin roles only
- `withGuard()` - Flexible role-based guard wrapper

### Organization Isolation

All data queries include `orgId` verification to prevent cross-organization data access:

```typescript
// Verify resource belongs to user's org
if (String(resource.orgId) !== String(orgId)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Suspension Handling

Organizations can be suspended for billing or compliance reasons:

- Suspended orgs return `423 Locked` status
- Billing and org settings remain accessible during suspension
- Automatic unsuspension via Stripe webhook on payment

## Input Sanitization

User-generated content is sanitized before storage:

- `sanitizeName()` - Organization/user names (200 char limit)
- `sanitizeText()` - Single-line text fields
- `sanitizeMultilineText()` - Descriptions, announcements
- `sanitizeHtml()` - Escapes HTML to prevent XSS
- `sanitizeUrl()` - Validates and sanitizes URLs

### Example Usage

```typescript
import { sanitizeName, sanitizeMultilineText } from '@/lib/sanitize';

const org = await Org.create({
  name: sanitizeName(body.name),
  description: sanitizeMultilineText(body.description),
});
```

## Rate Limiting

Non-idempotent requests (POST, PUT, PATCH, DELETE) are rate-limited:

- **Middleware level**: 10 requests per 60 seconds per IP
- Uses Upstash Redis (falls back to in-memory)
- Returns `429 Too Many Requests` when exceeded
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Configuration

Set in `.env.local`:
```env
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

## Error Handling

Consistent error handling across all routes:

- Custom error classes with proper HTTP status codes
- `logError()` function for error tracking
- Development vs production error verbosity
- No sensitive information in error responses

### Error Classes

```typescript
import { ValidationError, NotFoundError, ForbiddenError } from '@/lib/errors';

throw new ValidationError('Invalid input', { field: 'email' });
throw new NotFoundError('Resource not found');
throw new ForbiddenError('Access denied');
```

## Authentication

NextAuth.js v5 with the following security features:

- Email magic links (passwordless)
- Password-based auth with SHA-256 hashing
- JWT session tokens
- HttpOnly cookies
- CSRF protection via SameSite cookies

### Test Bypass (E2E Only)

`TEST_BYPASS_AUTH=1` enables mock sessions for testing:

- **NEVER enable in production**
- Used only for Playwright E2E tests
- Allows assuming arbitrary roles for testing

## Stripe Webhook Security

Webhook endpoint validates signatures:

```typescript
const sig = req.headers.get('stripe-signature') || '';
const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
await billingService.handleWebhook(buf, sig, secret);
```

Event allowlist prevents processing unexpected events:
```env
STRIPE_WEBHOOK_EVENT_ALLOWLIST=checkout.session.completed,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded
```

## Database Security

### Connection Security

- MongoDB connection string in `.env.local` (never committed)
- Connection pooling via Mongoose
- Atlas network access restrictions recommended

### Query Security

- All user inputs validated before queries
- No string concatenation in queries
- ObjectId validation prevents injection
- Lean queries where possible to reduce attack surface

## Best Practices

### Environment Variables

Never commit sensitive values:
```bash
# .env.local (gitignored)
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-here
STRIPE_SECRET_KEY=sk_...
RESEND_API_KEY=re_...
```

### Regular Security Tasks

1. **Rotate secrets** quarterly
2. **Review audit logs** for suspicious activity
3. **Update dependencies** monthly
4. **Monitor Stripe dashboard** for fraud
5. **Review rate limit logs** for abuse patterns

### Production Checklist

- [ ] `TEST_BYPASS_AUTH` is unset or explicitly `0`
- [ ] `NODE_ENV=production`
- [ ] All secrets rotated from development
- [ ] HTTPS enabled (required for auth cookies)
- [ ] CORS configured if using external clients
- [ ] Rate limiting enabled with Upstash Redis
- [ ] Stripe webhook signature verification enabled
- [ ] MongoDB network access restricted to application IPs
- [ ] Error logging/monitoring configured

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email security concerns to: `SUPPORT_EMAIL` (set in env)
3. Include detailed description and steps to reproduce
4. Allow reasonable time for patch before disclosure

## Audit Logging

All critical actions are logged:

- User authentication attempts
- Role changes
- Organization modifications
- Schedule publications
- Swap approvals/denials
- Billing events

Access logs via:
- `/org/demo/(manager)/audit` - UI
- `GET /api/audit` - API
- `GET /api/audit/export` - CSV export

## Session Security

- Sessions expire after inactivity (configured in NextAuth)
- Logout clears session cookies
- No session data stored client-side
- Session tokens are JWT signed and encrypted

## Future Enhancements

Planned security improvements:

- [ ] Two-factor authentication (2FA)
- [ ] IP allowlisting for organizations
- [ ] Enhanced audit log filtering
- [ ] Automated security scanning in CI/CD
- [ ] CAPTCHA on signup/login
- [ ] Brute force protection on login
- [ ] Content Security Policy (CSP) headers
