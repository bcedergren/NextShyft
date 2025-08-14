import { IScheduleRepository } from '@/repositories/ScheduleRepository';
import { IShiftRepository } from '@/repositories/ShiftRepository';
import { IUserRepository } from '@/repositories/UserRepository';
import Availability from '@/models/Availability';
import OrgPolicy from '@/models/OrgPolicy';
import { buildLP } from '@/lib/scheduler/encode';

export class SchedulerService {
  constructor(
    private schedules: IScheduleRepository,
    private shifts: IShiftRepository,
    private users: IUserRepository,
  ) {}

  async generateForLatestOrg(orgId?: string) {
    const schedule = orgId
      ? await this.schedules.findLatestByOrg(orgId)
      : await this.schedules.findLatest();
    if (!schedule) throw new Error('No schedule');
    const shifts = await this.shifts.findBySchedule(String(schedule._id));
    const org = String(schedule.orgId);
    const users = await this.users.findByOrg(org);
    const avDocs = await (Availability as any).find({ orgId: org });
    const policy = (await (OrgPolicy as any).findOne({ orgId: schedule.orgId })) || ({} as any);

    const avWeeklyByEmail: Record<string, any> = {};
    const avDatesByEmail: Record<string, Record<string, any[]>> = {};
    for (const a of avDocs) {
      avWeeklyByEmail[a.userEmail] = a.weekly || {};
      try {
        const dates: Record<string, any[]> = {};
        if (a.dates && typeof a.dates.forEach === 'function') {
          a.dates.forEach((v: any, k: string) => (dates[k] = v));
        } else if (a.dates && typeof a.dates === 'object') {
          Object.assign(dates, a.dates);
        }
        avDatesByEmail[a.userEmail] = dates;
      } catch {
        avDatesByEmail[a.userEmail] = {};
      }
    }

    const employees = users.map((u: any) => ({
      id: String(u._id),
      positions: (u.positions || []).map((p: any) => String(p)),
      weekly: avWeeklyByEmail[u.email || ''] || {},
      dates: avDatesByEmail[u.email || ''] || {},
    }));

    const model = buildLP(
      shifts.map((s: any) => ({
        id: String(s._id),
        positionId: String(s.positionId),
        start: s.start,
        end: s.end,
        required: s.requiredCount,
        day: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date(s.date).getDay()],
        dateStr: new Date(s.date).toISOString().slice(0, 10),
      })),
      employees,
      policy,
    );

    let solution: any = {};
    try {
      const solver = await import('javascript-lp-solver');
      // @ts-ignore
      solution = (solver as any).Solve(model);
    } catch (e) {
      solution = { note: 'Install javascript-lp-solver to compute optimal solution.' };
    }

    if (solution && (solution.feasible || solution.result === 'optimal')) {
      const assigns: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(solution)) {
        if (!k.startsWith('x_') || v !== 1) continue;
        const [, e, s] = k.split('_'); // x_{e}_{s}
        assigns[s] = assigns[s] || [];
        assigns[s].push(e);
      }
      for (const [sid, userIds] of Object.entries(assigns)) {
        await this.shifts.saveAssignments(sid, userIds);
      }
    }

    return { model, solution };
  }
}
