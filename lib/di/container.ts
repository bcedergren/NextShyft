import 'reflect-metadata';
import { container } from '@/lib/di/registry';

import { ResendEmailSender } from '@/services/EmailSender';
import { WebPushSender } from '@/services/PushSender';
import { NotificationService } from '@/services/NotificationService';
import { AuditService } from '@/services/AuditService';
import { InviteService } from '@/services/InviteService';
import { AnnouncementService } from '@/services/AnnouncementService';
import { AcceptInviteService } from '@/services/AcceptInviteService';
import { AnnouncementRepository } from '@/repositories/AnnouncementRepository';
import { InviteRepository } from '@/repositories/InviteRepository';
import { OrgRepository } from '@/repositories/OrgRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { ScheduleRepository } from '@/repositories/ScheduleRepository';
import { ShiftRepository } from '@/repositories/ShiftRepository';

export function makeContainer(ctx: { orgId?: string; actorEmail?: string } = {}) {
  const email = container.resolve('IEmailSender' as any) as any;
  const push = container.resolve('IPushSender' as any) as any;
  const notify = container.resolve('NotificationService');
  const audit = container.resolve('AuditService');
  const invites = container.resolve('InviteService');
  const acceptInvites = container.resolve('AcceptInviteService');
  const announ = container.resolve('AnnouncementService');
  const orgs = container.resolve('OrgRepository');
  const users = container.resolve('UserRepository');
  const schedules = container.resolve('ScheduleRepository');
  const shifts = container.resolve('ShiftRepository');
  return {
    email,
    push,
    notify,
    audit,
    invites,
    acceptInvites,
    announ,
    orgs,
    users,
    schedules,
    shifts,
    ctx,
  };
}
