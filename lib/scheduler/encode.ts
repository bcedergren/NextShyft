// LP model encoder for javascript-lp-solver
// npm i javascript-lp-solver
export function buildLP(shifts: any[], employees: any[], policy: any) {
  const model: any = { optimize: 'penalty', opType: 'min', constraints: {}, variables: {} };
  let penaltyScale = 1000;

  for (const s of shifts) {
    const shiftVarList: string[] = [];
    for (const e of employees) {
      const varName = `x_${e.id}_${s.id}`;
      // initialize variable
      model.variables[varName] = { penalty: 0 };
      // coverage: sum x_{e,s} == requiredCount(s)
      model.constraints[`cover_${s.id}`] = model.constraints[`cover_${s.id}`] || {
        equal: s.required,
      };
      model.variables[varName][`cover_${s.id}`] = 1;
      // availability: weekly pattern
      let avail = (e.weekly[s.day] || []).some((r: any) => r.start <= s.start && r.end >= s.end);
      // date-specific overrides: if a date exists in 'dates', use that instead for the day
      if ((e.dates?.[s.dateStr] || []).length > 0) {
        avail = (e.dates[s.dateStr] || []).some((r: any) => r.start <= s.start && r.end >= s.end);
      }
      // holidays: forbid if policy marks date as holiday and policy.constraints.requireRoleMatch is used to encode strictness
      const isHoliday = Array.isArray(policy?.holidays)
        ? policy.holidays.some((h: any) => h?.date === s.dateStr)
        : false;
      const roleOk = e.positions.includes(s.positionId);
      if (isHoliday) {
        model.variables[varName].penalty += penaltyScale * 1000;
      }
      if (!avail || (policy?.constraints?.requireRoleMatch && !roleOk)) {
        // prohibit by not adding any variable? We'll keep variable but add massive penalty so solver avoids it
        model.variables[varName].penalty += penaltyScale * 1000;
      }
      // soft: fairness and overtime penalties (approx)
      if (policy?.softPreferences?.preferAvailabilityWeight && !avail)
        model.variables[varName].penalty += penaltyScale;
    }
  }
  return model;
}
