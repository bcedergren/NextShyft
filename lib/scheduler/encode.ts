// LP model encoder for javascript-lp-solver
// npm i javascript-lp-solver
function toMinutes(t: string): number {
  const [h, m] = String(t || '0:0')
    .split(':')
    .map((v) => parseInt(v, 10) || 0);
  return ((h % 24) * 60 + (m % 60) + 1440) % 1440;
}

// Return true if the entire shift [sStart->sEnd) is contained within availability [aStart->aEnd)
// Times are on a 24h circle; handles overnight for either shift or availability.
function coversStrict(sStart: string, sEnd: string, aStart: string, aEnd: string): boolean {
  const s0 = toMinutes(sStart);
  const s1 = toMinutes(sEnd);
  const a0 = toMinutes(aStart);
  const a1 = toMinutes(aEnd);
  const shiftLen = (s1 - s0 + 1440) % 1440 || (s0 === s1 ? 1440 : 0); // if equal, treat as 24h or 0h; prefer 24h
  if (shiftLen === 0) return false; // zero-length shift yields no work
  const availLen = (a1 - a0 + 1440) % 1440 || (a0 === a1 ? 1440 : 0);
  if (availLen === 0) return false;
  // unfold around a0 so availability is [0, availLen)
  const sStartRel = (s0 - a0 + 1440) % 1440;
  return sStartRel + shiftLen <= availLen;
}

export function buildLP(shifts: any[], employees: any[], policy: any) {
  const model: any = {
    optimize: 'penalty',
    opType: 'min',
    constraints: {},
    variables: {},
    ints: {},
    binaries: {},
  };
  let penaltyScale = 1000;

  for (const s of shifts) {
    let created = 0;
    for (const e of employees) {
      const varName = `x_${e.id}_${s.id}`;
      // Strict role match: skip creating variable if employee cannot work this position
      const roleOk = Array.isArray(e.positions) && e.positions.includes(s.positionId);
      if (!roleOk) continue;
      // Strict availability: must be fully covered either by weekly pattern or date override (supports overnight)
      let avail = (e.weekly?.[s.day] || []).some((r: any) =>
        coversStrict(s.start, s.end, r.start, r.end),
      );
      if ((e.dates?.[s.dateStr] || []).length > 0) {
        avail = (e.dates[s.dateStr] || []).some((r: any) =>
          coversStrict(s.start, s.end, r.start, r.end),
        );
      }
      if (!avail) continue;
      // Initialize variable only for eligible pairs
      model.variables[varName] = { penalty: 0 };
      model.binaries[varName] = 1; // force 0/1 decisions
      created++;
      // coverage: sum x_{e,s} == requiredCount(s)
      model.constraints[`cover_${s.id}`] = model.constraints[`cover_${s.id}`] || {
        equal: s.required,
      };
      model.variables[varName][`cover_${s.id}`] = 1;
      // holidays: discourage if policy marks date as holiday
      const isHoliday = Array.isArray(policy?.holidays)
        ? policy.holidays.some((h: any) => h?.date === s.dateStr)
        : false;
      if (isHoliday) {
        model.variables[varName].penalty += penaltyScale * 1000;
      }
      // soft: optional small penalty when only weekly available but not date-specific preferred
      if (
        policy?.softPreferences?.preferAvailabilityWeight &&
        !((e.dates?.[s.dateStr] || []).length > 0)
      ) {
        // Nudge towards date-specific entries when present
        model.variables[varName].penalty += penaltyScale * 0.1;
      }
    }
    // If no eligible pairs created for this shift (too strict), fall back to soft allowing any employee with large penalty.
    if (created === 0) {
      for (const e of employees) {
        const varName = `x_${e.id}_${s.id}`;
        if (model.variables[varName]) continue;
        model.variables[varName] = { penalty: penaltyScale * 100 };
        model.binaries[varName] = 1;
        model.variables[varName][`cover_${s.id}`] = 1;
      }
    }
    // Add a slack variable to allow underfilling when strict constraints leave no feasible full cover
    // This keeps the model feasible: solver uses slack only when needed.
    model.constraints[`cover_${s.id}`] = model.constraints[`cover_${s.id}`] || {
      equal: s.required,
    };
    const slackVar = `slack_${s.id}`;
    model.variables[slackVar] = model.variables[slackVar] || { penalty: penaltyScale * 1000 };
    model.variables[slackVar][`cover_${s.id}`] =
      (model.variables[slackVar][`cover_${s.id}`] || 0) + 1;
    model.ints[slackVar] = 1; // integer slack (can be >= 0)
  }
  return model;
}
