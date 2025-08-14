
import { IAnnouncementRepository } from '@/repositories/AnnouncementRepository';
import { NotificationService } from './NotificationService';

export class AnnouncementService {
  constructor(private repo: IAnnouncementRepository, private notify: NotificationService) {}

  list(orgId: string) { return this.repo.list(orgId); }

  async post(orgId: string, title: string, body: string, pinned=false) {
    const doc = await this.repo.create(orgId, { title, body, pinned });
    // Fan-out notification to all ('*' broadcast pattern kept simple)
    await this.notify.notify({ orgId, userEmail: '*', type: 'ANNOUNCEMENT', title, body });
    return doc;
  }
}
