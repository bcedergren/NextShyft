import { z } from 'zod';

/**
 * Common validation schemas used across API routes
 */

// MongoDB ObjectId validation
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

// Email validation
export const emailSchema = z.string().email('Invalid email format').toLowerCase();

// Date validation
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

// Time validation (HH:MM format)
export const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)');

// Pagination
export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
});

// Date range
export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine((data) => data.startDate <= data.endDate, {
  message: 'Start date must be before or equal to end date',
});

/**
 * Shift assignment validation
 */
export const shiftAssignSchema = z.object({
  shiftId: objectIdSchema,
  staffId: objectIdSchema.optional(),
  staffIds: z.array(objectIdSchema).optional(),
}).refine((data) => data.staffId || (data.staffIds && data.staffIds.length > 0), {
  message: 'Either staffId or staffIds must be provided',
});

/**
 * Shift copy validation
 */
export const shiftCopySchema = z.object({
  shiftIds: z.array(objectIdSchema).min(1, 'At least one shift ID required'),
  targetDate: dateSchema.optional(),
  targetScheduleId: objectIdSchema.optional(),
});

/**
 * Shift time update validation
 */
export const shiftTimeSchema = z.object({
  start: timeSchema,
  end: timeSchema,
  date: dateSchema.optional(),
}).refine((data) => data.start < data.end, {
  message: 'Start time must be before end time',
});

/**
 * Swap request validation
 */
export const swapDecisionSchema = z.object({
  id: objectIdSchema,
  action: z.enum(['APPROVE', 'DENY'], {
    errorMap: () => ({ message: 'Action must be APPROVE or DENY' }),
  }),
});

export const swapCreateSchema = z.object({
  shiftId: objectIdSchema,
  type: z.enum(['open', 'direct']),
  targetUserId: objectIdSchema.optional(),
  reason: z.string().max(500).optional(),
});

/**
 * Policy validation
 */
export const policySchema = z.object({
  maxHoursPerWeek: z.number().int().positive().max(168).optional(),
  maxShiftsPerWeek: z.number().int().positive().max(50).optional(),
  minHoursBetweenShifts: z.number().nonnegative().max(168).optional(),
  maxConsecutiveDays: z.number().int().positive().max(14).optional(),
  overtimeThreshold: z.number().positive().max(168).optional(),
  requireBreaks: z.boolean().optional(),
  minBreakDuration: z.number().nonnegative().max(480).optional(),
});

/**
 * Availability validation
 */
export const availabilityBlockSchema = z.object({
  start: timeSchema,
  end: timeSchema,
}).refine((data) => data.start < data.end, {
  message: 'Start time must be before end time',
});

export const availabilitySchema = z.object({
  weekly: z.object({
    mon: z.array(availabilityBlockSchema).optional(),
    tue: z.array(availabilityBlockSchema).optional(),
    wed: z.array(availabilityBlockSchema).optional(),
    thu: z.array(availabilityBlockSchema).optional(),
    fri: z.array(availabilityBlockSchema).optional(),
    sat: z.array(availabilityBlockSchema).optional(),
    sun: z.array(availabilityBlockSchema).optional(),
  }).optional(),
  exceptions: z.array(z.object({
    date: dateSchema,
    available: z.boolean(),
    blocks: z.array(availabilityBlockSchema).optional(),
  })).optional(),
});

/**
 * Invite validation
 */
export const inviteCreateSchema = z.object({
  email: emailSchema,
  role: z.enum(['EMPLOYEE', 'MANAGER', 'OWNER'], {
    errorMap: () => ({ message: 'Role must be EMPLOYEE, MANAGER, or OWNER' }),
  }),
  positions: z.array(z.string()).optional(),
  message: z.string().max(500).optional(),
});

export const inviteUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'expired', 'revoked']).optional(),
  positions: z.array(z.string()).optional(),
});

/**
 * Position validation
 */
export const positionCreateSchema = z.object({
  name: z.string().min(1).max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  description: z.string().max(500).optional(),
  requiresCertification: z.boolean().optional(),
});

export const positionUpdateSchema = positionCreateSchema.partial();

/**
 * Template validation
 */
export const templateSchema = z.object({
  name: z.string().min(1).max(100),
  positionId: objectIdSchema,
  dayOfWeek: z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
  startTime: timeSchema,
  endTime: timeSchema,
  requiredStaff: z.number().int().positive().max(50),
  notes: z.string().max(500).optional(),
}).refine((data) => data.startTime < data.endTime, {
  message: 'Start time must be before end time',
});

/**
 * Announcement validation
 */
export const announcementCreateSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  pinned: z.boolean().default(false),
  expiresAt: z.string().datetime().optional(),
});

export const announcementUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(5000).optional(),
  pinned: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

/**
 * Organization validation
 */
export const orgUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  timezone: z.string().max(50).optional(),
  weekStartsOn: z.enum(['sun', 'mon']).optional(),
  industry: z.string().max(100).optional(),
});

/**
 * User profile validation
 */
export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  timezone: z.string().max(50).optional(),
});

/**
 * Notification preferences validation
 */
export const notificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  sms: z.boolean().optional(),
  schedulePublished: z.boolean().optional(),
  shiftReminder: z.boolean().optional(),
  swapRequests: z.boolean().optional(),
  announcements: z.boolean().optional(),
});

/**
 * Push subscription validation
 */
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  expirationTime: z.number().nullable().optional(),
});

// Flexible date string: YYYY-MM-DD or ISO (e.g. 2025-01-30T00:00:00.000Z)
const dateStringSchema = z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
  message: 'Invalid date format',
});

/**
 * Schedule creation validation
 * API and clients use periodStart/periodEnd (ISO or YYYY-MM-DD).
 */
export const scheduleCreateSchema = z.object({
  periodStart: dateStringSchema,
  periodEnd: dateStringSchema,
}).refine((data) => new Date(data.periodStart) <= new Date(data.periodEnd), {
  message: 'Start date must be before or equal to end date',
});

/**
 * User positions validation
 */
export const userPositionsSchema = z.object({
  positions: z.array(z.string()).min(0).max(20),
});

/**
 * User role validation
 */
export const userRoleSchema = z.object({
  userId: objectIdSchema,
  role: z.enum(['EMPLOYEE', 'MANAGER', 'OWNER', 'ADMIN', 'SUPERADMIN']),
});
