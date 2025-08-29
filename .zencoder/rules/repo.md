---
description: Repository Information Overview
alwaysApply: true
---

# NextShyft Information

## Summary
NextShyft is a Next.js 14 application scaffold for workforce scheduling and shift management. It provides features for organization-based authentication with role management, availability tracking, shift scheduling, swap requests, and notifications via email, SMS, and web push.

## Structure
- **app/**: Next.js app router structure with routes and API endpoints
- **components/**: React components for UI elements
- **lib/**: Core utilities, database connections, and business logic
- **models/**: Mongoose models for database entities
- **repositories/**: Data access layer for database operations
- **services/**: Business logic services
- **scripts/**: Utility scripts for seeding data and environment checks
- **tests/**: Jest and Playwright tests
- **emails/**: Email templates for notifications
- **public/**: Static assets and service worker
- **styles/**: Theme configuration

## Language & Runtime
**Language**: TypeScript
**Version**: ES2020 target with Node.js
**Build System**: Next.js
**Package Manager**: pnpm (recommended), npm compatible

## Dependencies
**Main Dependencies**:
- Next.js 14.2.4 - React framework
- React 18.2.0 - UI library
- MongoDB/Mongoose 8.5.1 - Database
- NextAuth 4.24.8 - Authentication
- MUI 7.3.1 - Component library
- Zod 3.23.8 - Schema validation
- Resend 4.0.0 - Email service
- Stripe 16.7.0 - Payment processing
- Tsyringe 4.8.0 - Dependency injection

**Development Dependencies**:
- TypeScript 5.4.5
- Jest 29.7.0 - Unit testing
- Playwright 1.45.3 - E2E testing
- ESLint 8.57.0 - Linting

## Build & Installation
```bash
# Install dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run tests
pnpm test
pnpm e2e
```

## Testing
**Unit Testing**:
- **Framework**: Jest
- **Test Location**: /tests
- **Naming Convention**: *.test.ts
- **Configuration**: jest.config.js
- **Run Command**:
```bash
pnpm test
```

**E2E Testing**:
- **Framework**: Playwright
- **Test Location**: /tests/e2e
- **Configuration**: playwright.config.ts
- **Run Command**:
```bash
pnpm e2e
```

## Key Features
- **Authentication**: Email magic links via NextAuth
- **RBAC**: Role-based access control (Employee, Manager, Owner, Super Admin)
- **Scheduling**: ILP-based schedule generator
- **Notifications**: Email (Resend), SMS (Twilio), Web Push
- **Shift Management**: Swap requests, availability tracking
- **Billing**: Stripe integration for subscription management
- **Reporting**: Coverage heatmaps, employee hours

## Database
- **Type**: MongoDB
- **ORM**: Mongoose
- **Models**: User, Organization, Position, Shift, Schedule, Notification, etc.
- **Connection**: Via MONGODB_URI environment variable

## API Structure
- RESTful API endpoints under /app/api
- Authentication middleware for protected routes
- Role-based access control for organization resources
- Rate limiting for API endpoints

## Environment Configuration
Required environment variables:
- MONGODB_URI - MongoDB connection string
- NEXTAUTH_SECRET - Auth encryption key
- NEXTAUTH_URL - Base URL for auth callbacks
- RESEND_API_KEY - For email notifications
- Optional: STRIPE_SECRET_KEY, TWILIO credentials, VAPID keys for web push