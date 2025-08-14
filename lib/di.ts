
import { ResendEmailSender } from '@/services/EmailSender';
import { WebPushSender } from '@/services/PushSender';
import { NotificationService } from '@/services/NotificationService';
import { AuditService } from '@/services/AuditService';
import { InviteService } from '@/services/InviteService';

const emailSender = new ResendEmailSender();
const pushSender = new WebPushSender();

export const notificationService = new NotificationService(emailSender, pushSender);
export const auditService = new AuditService();
export const inviteService = new InviteService(emailSender);
