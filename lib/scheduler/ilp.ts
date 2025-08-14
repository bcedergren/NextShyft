
export type Shift = { id: string; positionId: string; start: string; end: string; required: number; day: string };
export type Employee = { id: string; positions: string[]; weekly: Record<string, { start: string; end: string }[]>; maxHours?: number };
export type Assignment = Record<string, string[]>; // shiftId -> employeeIds

function hoursBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh + em/60) - (sh + sm/60);
}

// A greedy assignment respecting availability, role match, and max hours.
// This is a placeholder for a true ILP solver; good enough for initial drafts.
export function generateSchedule(shifts: Shift[], employees: Employee[]): { assignments: Assignment, unfilled: string[] } {
  const assignments: Assignment = {};
  const hours: Record<string, number> = {};
  const unfilled: string[] = [];

  // sort shifts by required desc then by duration desc
  const sorted = [...shifts].sort((a,b)=> (b.required - a.required) || (hoursBetween(b.start,b.end) - hoursBetween(a.start,a.end)));

  for (const shift of sorted) {
    assignments[shift.id] = [];
    const duration = hoursBetween(shift.start, shift.end);
    const eligibles = employees.filter(e => e.positions.includes(shift.positionId) &&
      (e.weekly[shift.day]||[]).some(r => r.start <= shift.start && r.end >= shift.end));

    // sort eligibles by least hours worked so far (fairness)
    eligibles.sort((a,b)=>(hours[a.id]||0) - (hours[b.id]||0));

    for (const e of eligibles) {
      if (assignments[shift.id].length >= shift.required) break;
      const nextHours = (hours[e.id]||0) + duration;
      if (e.maxHours && nextHours > e.maxHours) continue;
      assignments[shift.id].push(e.id);
      hours[e.id] = nextHours;
    }
    if (assignments[shift.id].length < shift.required) unfilled.push(shift.id);
  }
  return { assignments, unfilled };
}
