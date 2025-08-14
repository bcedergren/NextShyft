import Notification from '@/models/Notification';
export interface INotificationRepository {
  create(data: any): Promise<any>;
  listByUser(email: string): Promise<any[]>;
  countUnread(email: string): Promise<number>;
  markAllRead(email: string): Promise<void>;
  deleteByIdForUser(id: string, email: string): Promise<void>;
}
export class NotificationRepository implements INotificationRepository {
  create(data: any) {
    return (Notification as any).create(data);
  }
  listByUser(email: string) {
    return (Notification as any).find({ userEmail: email }).sort({ createdAt: -1 }).limit(100);
  }
  countUnread(email: string) {
    return (Notification as any).countDocuments({ userEmail: email, read: false });
  }
  async markAllRead(email: string) {
    await (Notification as any).updateMany(
      { userEmail: email, read: false },
      { $set: { read: true } },
    );
  }
  async deleteByIdForUser(id: string, email: string) {
    await (Notification as any).deleteOne({ _id: id, userEmail: email });
  }
}
