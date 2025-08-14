import Announcement from '@/models/Announcement';
export interface IAnnouncementRepository {
  list(orgId: string): Promise<any[]>;
  create(orgId: string, data: any): Promise<any>;
  pinned(orgId: string): Promise<any | null>;
}
export class AnnouncementRepository implements IAnnouncementRepository {
  list(orgId: string) {
    return (Announcement as any)
      .find({ orgId, publishAt: { $lte: new Date() } })
      .sort({ pinned: -1, publishAt: -1 })
      .limit(50);
  }
  create(orgId: string, data: any) {
    return (Announcement as any).create({ ...data, orgId });
  }
  pinned(orgId: string) {
    return (Announcement as any).findOne({ orgId, pinned: true }).sort({ publishAt: -1 });
  }
}
