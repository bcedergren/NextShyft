import { IScheduleRepository } from '@/repositories/ScheduleRepository';
import { IShiftRepository } from '@/repositories/ShiftRepository';
import { IUserRepository } from '@/repositories/UserRepository';
import Availability from '@/models/Availability';
import OrgPolicy from '@/models/OrgPolicy';
import { buildLP } from '@/lib/scheduler/encode';
import { generateSchedule } from '@/lib/scheduler/ilp';

export class SchedulerService {
  constructor(
    private schedules: IScheduleRepository,
    private shifts: IShiftRepository,
    private users: IUserRepository,
  ) {}

  async generateForLatestOrg(orgId?: string, opts?: { includeManagers?: boolean }) {
    const includeManagers = opts?.includeManagers ?? false;
    const schedule = orgId
      ? await this.schedules.findLatestByOrg(orgId)
      : await this.schedules.findLatest();
    if (!schedule) throw new Error('No schedule');
    const shifts = await this.shifts.findBySchedule(String(schedule._id));
    const org = String(schedule.orgId);
    const users = await this.users.findByOrg(org);
    const allowedRoles = includeManagers ? ['EMPLOYEE', 'MANAGER'] : ['EMPLOYEE'];
    const eligibleUsers = users.filter((u: any) => {
      const roles: string[] = Array.isArray(u.roles) ? u.roles : [];
      return roles.some((r) => allowedRoles.includes(String(r || '').toUpperCase()));
    });
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

    const asId = (v: any) => {
      if (!v) return '';
      if (typeof v === 'string') return v;
      if (typeof v.toHexString === 'function') return v.toHexString();
      return String(v._id || v.id || v.$oid || v);
    };
    const employees = eligibleUsers.map((u: any) => ({
      id: String(u._id),
      positions: (u.positions || u.positionIds || [])
        .map((p: any) => String(asId(p)))
        .filter(Boolean),
      weekly: avWeeklyByEmail[u.email || ''] || {},
      dates: avDatesByEmail[u.email || ''] || {},
    }));

    const hhmm = (v: any) => {
      if (typeof v === 'string') {
        // Extract the last HH:mm occurrence (works for '17:00' or ISO strings '2025-08-28T17:00:00Z')
        const matches = v.match(/(\d{2}:\d{2})/g);
        if (matches && matches.length) return matches[matches.length - 1];
      }
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) {
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
      }
      return typeof v === 'number' ? `${String(Math.floor(v)).padStart(2, '0')}:00` : '00:00';
    };

    const model = buildLP(
      shifts.map((s: any) => ({
        id: String(s._id),
        positionId: String(s.positionId),
        start: hhmm(s.start),
        end: hhmm(s.end),
        required: s.requiredCount,
        day: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date(s.date).getDay()],
        dateStr: new Date(s.date).toISOString().slice(0, 10),
      })),
      employees,
      policy,
    );

    // Precompute candidate variable counts from the model
    const candidateByShift: Record<string, number> = {};
    for (const key of Object.keys((model as any).variables || {})) {
      if (!key.startsWith('x_')) continue;
      const parts = key.split('_');
      const shiftId = parts[2];
      candidateByShift[shiftId] = (candidateByShift[shiftId] || 0) + 1;
    }

    let solution: any = {};
    try {
      const solver = await import('javascript-lp-solver');
      // @ts-ignore
      solution = (solver as any).Solve(model);
    } catch (e) {
      solution = { note: 'Install javascript-lp-solver to compute optimal solution.' };
    }

    const summary: any = {
      feasible: !!solution && (solution as any).feasible !== false,
      result: (solution as any)?.result,
      assignedPairs: 0,
      totalShifts: shifts.length,
      fullyCovered: 0,
      underfilled: [] as Array<{ shiftId: string; required: number; assigned: number }>,
      candidatePairs: Object.values(candidateByShift).reduce((a, b) => a + b, 0),
      shiftsWithCandidates: Object.values(candidateByShift).filter((v) => v > 0).length,
      employeeCount: employees.length,
    };

    const assigns: Record<string, string[]> = {};
    if (solution && (solution.feasible || solution.result === 'optimal')) {
      for (const [k, v] of Object.entries(solution)) {
        if (!k.startsWith('x_')) continue;
        const val = typeof v === 'number' ? v : Number(v);
        if (!isFinite(val) || val < 0.5) continue; // treat >= 0.5 as assigned
        const [, e, s] = k.split('_'); // x_{e}_{s}
        assigns[s] = assigns[s] || [];
        assigns[s].push(e);
        summary.assignedPairs++;
      }
      // persist assignments
      for (const [sid, userIds] of Object.entries(assigns)) {
        await this.shifts.saveAssignments(sid, userIds);
      }
    }

    // compute coverage stats
    const reqByShift = new Map<string, number>();
    for (const s of shifts as any[]) reqByShift.set(String(s._id), Number(s.requiredCount) || 0);
    for (const [sid, req] of reqByShift.entries()) {
      const assigned = assigns[sid]?.length || 0;
      if (assigned >= req) summary.fullyCovered++;
      if (assigned < req) summary.underfilled.push({ shiftId: sid, required: req, assigned });
    }

    // Greedy fallback: if LP assigned nothing but candidates exist, try a simple generator
    if (summary.assignedPairs === 0 && summary.candidatePairs > 0) {
      const greedy = generateSchedule(
        (shifts as any[]).map((s: any) => ({
          id: String(s._id),
          positionId: String(s.positionId),
          start: hhmm(s.start),
          end: hhmm(s.end),
          required: Number(s.requiredCount) || 0,
          day: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date(s.date).getDay()],
        })),
        employees.map((e: any) => ({
          id: e.id,
          positions: e.positions,
          weekly: e.weekly,
        })),
      );
      // persist greedy assignments
      for (const [sid, userIds] of Object.entries(greedy.assignments)) {
        if ((userIds as any[]).length > 0)
          await this.shifts.saveAssignments(sid, userIds as string[]);
      }
      // recompute summary from greedy
      const assigns2 = greedy.assignments as Record<string, string[]>;
      summary.assignedPairs = Object.values(assigns2).reduce((a, v) => a + (v?.length || 0), 0);
      summary.fullyCovered = 0;
      summary.underfilled = [];
      for (const [sid, req] of reqByShift.entries()) {
        const assigned = assigns2[sid]?.length || 0;
        if (assigned >= req) summary.fullyCovered++;
        if (assigned < req) summary.underfilled.push({ shiftId: sid, required: req, assigned });
      }
      summary.result = summary.assignedPairs > 0 ? 'greedy' : summary.result;
    }

    return { model, solution, summary };
  }
}
