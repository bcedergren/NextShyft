
import 'reflect-metadata';
import { container, instanceCachingFactory } from 'tsyringe';

// Services
import { ResendEmailSender } from '@/services/EmailSender';
import { WebPushSender } from '@/services/PushSender';
import { NotificationService } from '@/services/NotificationService';
import { AuditService } from '@/services/AuditService';
import { InviteService } from '@/services/InviteService';
import { AnnouncementService } from '@/services/AnnouncementService';
import { AcceptInviteService } from '@/services/AcceptInviteService';
// Repos
import { AnnouncementRepository } from '@/repositories/AnnouncementRepository';
import { InviteRepository } from '@/repositories/InviteRepository';
import { OrgRepository } from '@/repositories/OrgRepository';
import { UserRepository } from '@/repositories/UserRepository';
import { ScheduleRepository } from '@/repositories/ScheduleRepository';
import { ShiftRepository } from '@/repositories/ShiftRepository';

// Singleton adapters
container.register('IEmailSender', { useClass: ResendEmailSender });
container.register('IPushSender', { useClass: WebPushSender });

container.register('NotificationService', { useFactory: instanceCachingFactory(c => new NotificationService(c.resolve('IEmailSender' as any), c.resolve('IPushSender' as any))) });
container.register('AuditService', { useClass: AuditService });
container.register('InviteService', { useFactory: instanceCachingFactory(c => new InviteService(c.resolve('IEmailSender' as any))) });
container.register('AnnouncementRepository', { useClass: AnnouncementRepository });
container.register('AnnouncementService', { useFactory: instanceCachingFactory(c => new AnnouncementService(c.resolve('AnnouncementRepository'), c.resolve('NotificationService'))) });
container.register('AcceptInviteService', { useFactory: instanceCachingFactory(c => new AcceptInviteService(new InviteRepository())) });
container.register('OrgRepository', { useClass: OrgRepository });
container.register('UserRepository', { useClass: UserRepository });
container.register('ScheduleRepository', { useClass: ScheduleRepository });
container.register('ShiftRepository', { useClass: ShiftRepository });

export { container };
