import Shift from '@/models/Shift';
export interface IShiftRepository {
  findBySchedule(scheduleId: string): Promise<any[]>;
  saveAssignments(shiftId: string, userIds: string[]): Promise<void>;
}
export class ShiftRepository implements IShiftRepository {
  findBySchedule(scheduleId: string) {
    return (Shift as any).find({ scheduleId });
  }
  async saveAssignments(shiftId: string, userIds: string[]) {
    const ShiftModel: any = (await import('@/models/Shift')).default;
    const sh = await ShiftModel.findById(shiftId);
    if (!sh) return;
    sh.assignments = userIds.map((u: string) => ({ userId: u }));
    await sh.save();
  }
}
