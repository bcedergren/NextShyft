import Schedule from '@/models/Schedule';
export interface IScheduleRepository {
  findLatestByOrg(orgId: string): Promise<any | null>;
  findLatest(): Promise<any | null>;
}
export class ScheduleRepository implements IScheduleRepository {
  findLatestByOrg(orgId: string) {
    return (Schedule as any).findOne({ orgId }).sort({ createdAt: -1 });
  }
  findLatest() {
    return (Schedule as any).findOne({}).sort({ createdAt: -1 });
  }
}
