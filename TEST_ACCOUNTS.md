# NextShyft Test Accounts

This document contains all the test accounts created for development and testing purposes.

## 🚀 Quick Start

### For Component Testing (Recommended)
```bash
npm run seed:comprehensive
```
Then sign in with `alex@example.com` / `password123` to see the full demo experience.

### For Role Testing
```bash
npm run create:test-accounts
```
Then test different roles with the basic test accounts.

## Test Organizations

### 1. Demo Bar & Grill (Comprehensive Demo)
- **Name:** Demo Bar & Grill
- **Plan:** Pro
- **Signup Code:** DEMO01
- **Data:** Rich demo data with schedules, shifts, announcements, and notifications

### 2. Test Organization (Basic Test)
- **Name:** Test Organization
- **Plan:** Pro
- **Signup Code:** TEST01
- **Data:** Basic test accounts for role testing

## Test Accounts

All accounts use the same password: `password123`

## 🎭 Comprehensive Demo Accounts (Demo Bar & Grill)

These accounts provide rich, realistic data for testing all components:

### 👑 Manager Account
- **Email:** `alex@example.com`
- **Name:** Alex Rivera
- **Roles:** `MANAGER`, `EMPLOYEE`
- **Positions:** Manager, Bartender
- **Permissions:** Full access to everything
  - ✅ Dashboard access
  - ✅ User management
  - ✅ Organization settings
  - ✅ Schedule management
  - ✅ Position management
  - ✅ All admin features

### 👔 Lead Server Account
- **Email:** `jordan@example.com`
- **Name:** Jordan Lee
- **Roles:** `LEAD`, `EMPLOYEE`
- **Positions:** Server
- **Permissions:** Team leadership and schedule management
  - ✅ Dashboard access
  - ✅ Schedule management
  - ✅ Shift creation and editing
  - ✅ Employee availability management
  - ✅ Swap request approval
  - ❌ User management
  - ❌ Organization settings

### 🍸 Bartender Account
- **Email:** `sam@example.com`
- **Name:** Sam Patel
- **Roles:** `EMPLOYEE`
- **Positions:** Bartender
- **Permissions:** Basic employee access
  - ✅ Dashboard access
  - ✅ View personal schedule
  - ✅ Submit availability
  - ✅ Request shift swaps
  - ✅ View announcements

### 🍽️ Server Account
- **Email:** `taylor@example.com`
- **Name:** Taylor Kim
- **Roles:** `EMPLOYEE`
- **Positions:** Server
- **Permissions:** Basic employee access
  - ✅ Dashboard access
  - ✅ View personal schedule
  - ✅ Submit availability
  - ✅ Request shift swaps
  - ✅ View announcements

### 🚪 Host Account
- **Email:** `riley@example.com`
- **Name:** Riley Chen
- **Roles:** `EMPLOYEE`
- **Positions:** Host
- **Permissions:** Basic employee access
  - ✅ Dashboard access
  - ✅ View personal schedule
  - ✅ Submit availability
  - ✅ Request shift swaps
  - ✅ View announcements

### 👨‍🍳 Kitchen Account
- **Email:** `casey@example.com`
- **Name:** Casey Johnson
- **Roles:** `EMPLOYEE`
- **Positions:** Kitchen
- **Permissions:** Basic employee access
  - ✅ Dashboard access
  - ✅ View personal schedule
  - ✅ Submit availability
  - ✅ Request shift swaps
  - ✅ View announcements

### 🍺 Barback Account
- **Email:** `morgan@example.com`
- **Name:** Morgan Smith
- **Roles:** `EMPLOYEE`
- **Positions:** Barback
- **Permissions:** Basic employee access
  - ✅ Dashboard access
  - ✅ View personal schedule
  - ✅ Submit availability
  - ✅ Request shift swaps
  - ✅ View announcements

## 🧪 Basic Test Accounts (Test Organization)

These accounts are for basic role testing:

### 👑 Owner Account
- **Email:** `owner@test.com`
- **Name:** Test Owner
- **Role:** `OWNER`
- **Permissions:** Full access to everything
  - ✅ Dashboard access
  - ✅ User management
  - ✅ Organization settings
  - ✅ Billing and subscription management
  - ✅ Schedule management
  - ✅ Position management
  - ✅ All admin features

### 👔 Manager Account
- **Email:** `manager@test.com`
- **Name:** Test Manager
- **Role:** `MANAGER`
- **Permissions:** Schedule and employee management
  - ✅ Dashboard access
  - ✅ Schedule management
  - ✅ Shift creation and editing
  - ✅ Employee availability management
  - ✅ Swap request approval
  - ❌ User management
  - ❌ Organization settings
  - ❌ Billing access

### 👷 Employee Account
- **Email:** `employee@test.com`
- **Name:** Test Employee
- **Role:** `EMPLOYEE`
- **Permissions:** Basic employee access
  - ✅ Dashboard access
  - ✅ View personal schedule
  - ✅ Submit availability
  - ✅ Request shift swaps
  - ✅ View announcements
  - ❌ Schedule management
  - ❌ User management
  - ❌ Organization settings

## How to Use

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Access the Signin Page

Navigate to: `http://localhost:3000/signin`

### 3. Test Different Roles

Sign in with different accounts to test role-based permissions:

1. **Test Owner Features:**
   - Sign in as `owner@test.com`
   - Navigate to organization settings
   - Try user management features
   - Access billing section

2. **Test Manager Features:**
   - Sign in as `manager@test.com`
   - Try to access organization settings (should be restricted)
   - Test schedule management features
   - Approve swap requests

3. **Test Employee Features:**
   - Sign in as `employee@test.com`
   - Try to access admin features (should be restricted)
   - Submit availability
   - Request shift swaps

### 4. Debug Authentication

Check the browser console for detailed authentication logs:

- `[SIGNIN]` - Form submission logs
- `[AUTH]` - NextAuth authentication logs

## Scripts

### Create Comprehensive Demo Data (Recommended)

```bash
npm run seed:comprehensive
```

This creates the rich demo environment with:
- 7 users with different roles and positions
- 6 positions with colors
- Availability patterns and shift templates
- Current week schedule with assigned shifts
- Announcements and notifications
- Pending invites

### Create Basic Test Accounts

```bash
npm run create:test-accounts
```

### Create Single Test User

```bash
npm run create:test-user
```

### Create Basic Demo Data

```bash
npm run seed:demo
```

### Check Environment

```bash
npm run check:env
```

## Role Hierarchy

```
OWNER (Full Access)
├── User Management
├── Organization Settings
├── Billing
├── Schedule Management
└── All Features

MANAGER (Schedule Management)
├── Schedule Management
├── Shift Creation/Editing
├── Employee Management
└── Swap Approvals

EMPLOYEE (Basic Access)
├── View Schedule
├── Submit Availability
├── Request Swaps
└── View Announcements
```

## Testing Scenarios

### 🎭 Comprehensive Demo Testing (Demo Bar & Grill)

**Best for testing all components with realistic data:**

1. **Manager Experience (alex@example.com):**
   - View dashboard with populated data
   - Manage schedules with actual shifts
   - View employee availability patterns
   - Create and edit positions with colors
   - Manage announcements and notifications
   - Approve swap requests

2. **Lead Experience (jordan@example.com):**
   - View team schedules
   - Manage server shifts
   - Approve employee requests
   - View coverage requirements

3. **Employee Experience (sam@example.com, taylor@example.com, etc.):**
   - View personal schedules with assigned shifts
   - Submit availability preferences
   - Request shift swaps
   - View announcements and notifications

4. **Component Testing:**
   - Schedule views with real shift data
   - Availability grids with patterns
   - Position management with colors
   - Announcement system
   - Notification system
   - Coverage templates and requirements

### 🧪 Basic Role Testing (Test Organization)

**Best for testing role-based permissions:**

1. **Owner Testing (owner@test.com):**
   - Full system access
   - User management
   - Organization settings
   - Billing access

2. **Manager Testing (manager@test.com):**
   - Schedule management
   - Employee oversight
   - Restricted admin access

3. **Employee Testing (employee@test.com):**
   - Basic employee features
   - Restricted management access

### Authentication Testing

- ✅ Valid credentials sign in
- ✅ Invalid credentials show error
- ✅ Role-based access control
- ✅ Session persistence

### Feature Testing

- ✅ Dashboard access per role
- ✅ Navigation restrictions
- ✅ Feature availability per role
- ✅ Error handling for unauthorized access

### Edge Cases

- ✅ Password reset functionality
- ✅ Magic link authentication
- ✅ Session timeout
- ✅ Multiple browser tabs

## Security Notes

⚠️ **Important:** These are test accounts only!

- Never use these credentials in production
- All accounts use the same simple password
- Accounts are created in a test organization
- Intended for development and testing only

## Troubleshooting

### Common Issues

1. **Authentication Fails:**
   - Check browser console for error logs
   - Verify MongoDB connection
   - Ensure environment variables are set

2. **Role Permissions Not Working:**
   - Check user roles in database
   - Verify middleware configuration
   - Check authorization guards

3. **Database Connection Issues:**
   - Run `npm run check:env`
   - Verify MongoDB Atlas connection
   - Check network connectivity

### Reset Test Data

To reset all test accounts:

```bash
npm run create:test-accounts
```

This will update existing accounts or create new ones with fresh passwords.
