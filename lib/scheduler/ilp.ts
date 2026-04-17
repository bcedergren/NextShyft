
export type Shift = { 
  id: string; 
  positionId: string; 
  start: string; 
  end: string; 
  required: number; 
  day: string;
  date?: string; // ISO date for consecutive days tracking
};

export type Employee = { 
  id: string;
  name?: string;
  positions: string[]; 
  weekly: Record<string, { start: string; end: string }[]>; 
  maxHours?: number;
};

export type Assignment = Record<string, string[]>; // shiftId -> employeeIds

export type SchedulePolicy = {
  maxHoursPerWeek?: number;
  overtimeThreshold?: number;
  minRestHours?: number;
  maxConsecutiveDays?: number;
  fairnessWeight?: number; // 0-1, higher = more equal distribution
  avoidOvertimeWeight?: number; // 0-1, higher = avoid overtime
};

export type Warning = {
  type: 'error' | 'warning' | 'info';
  shiftId: string;
  employeeId?: string;
  message: string;
};

export type ScheduleResult = {
  assignments: Assignment;
  unfilled: string[];
  warnings: Warning[];
  stats: {
    totalShifts: number;
    filledShifts: number;
    partiallyFilledShifts: number;
    unfilledShifts: number;
    fillRate: number;
    totalHoursScheduled: number;
    employeesUsed: number;
  };
};

function hoursBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh + em/60) - (sh + sm/60);
}

function hasAvailability(employee: Employee, shift: Shift): boolean {
  const availSlots = employee.weekly[shift.day] || [];
  return availSlots.some(slot => 
    slot.start <= shift.start && slot.end >= shift.end
  );
}

function checkRestHours(
  employeeShifts: Map<string, Shift[]>,
  employeeId: string,
  newShift: Shift,
  minRestHours: number
): boolean {
  if (!minRestHours || !newShift.date) return true;
  
  const existingShifts = employeeShifts.get(employeeId) || [];
  
  for (const existing of existingShifts) {
    if (!existing.date) continue;
    
    const existingDate = new Date(existing.date);
    const newDate = new Date(newShift.date);
    const dayDiff = Math.abs((newDate.getTime() - existingDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayDiff <= 1) {
      const existingEnd = parseFloat(existing.end.replace(':', '.'));
      const newStart = parseFloat(newShift.start.replace(':', '.'));
      const hoursBetween = Math.abs(newStart - existingEnd);
      
      if (hoursBetween < minRestHours) {
        return false;
      }
    }
  }
  
  return true;
}

function checkConsecutiveDays(
  employeeShifts: Map<string, Shift[]>,
  employeeId: string,
  newShift: Shift,
  maxConsecutiveDays: number
): boolean {
  if (!maxConsecutiveDays || !newShift.date) return true;
  
  const existingShifts = employeeShifts.get(employeeId) || [];
  const dates = existingShifts
    .filter(s => s.date)
    .map(s => new Date(s.date!))
    .sort((a, b) => a.getTime() - b.getTime());
  
  if (dates.length === 0) return true;
  
  let consecutiveCount = 1;
  let currentDate = dates[0];
  
  for (let i = 1; i < dates.length; i++) {
    const nextDate = dates[i];
    const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      consecutiveCount++;
      if (consecutiveCount >= maxConsecutiveDays) {
        return false;
      }
    } else if (dayDiff > 1) {
      consecutiveCount = 1;
    }
    
    currentDate = nextDate;
  }
  
  return true;
}

/**
 * Enhanced greedy scheduler with production-quality constraints
 * Respects availability, max hours, rest periods, and fairness
 */
export function generateSchedule(
  shifts: Shift[], 
  employees: Employee[],
  policy: SchedulePolicy = {}
): ScheduleResult {
  const {
    maxHoursPerWeek = 40,
    overtimeThreshold = 40,
    minRestHours,
    maxConsecutiveDays,
    fairnessWeight = 0.7,
    avoidOvertimeWeight = 0.8
  } = policy;

  const assignments: Assignment = {};
  const hours: Record<string, number> = {};
  const employeeShifts = new Map<string, Shift[]>();
  const unfilled: string[] = [];
  const warnings: Warning[] = [];
  let totalHoursScheduled = 0;

  // Sort shifts by priority: required count DESC, then duration DESC
  const sorted = [...shifts].sort((a, b) => 
    (b.required - a.required) || (hoursBetween(b.start, b.end) - hoursBetween(a.start, a.end))
  );

  for (const shift of sorted) {
    assignments[shift.id] = [];
    const duration = hoursBetween(shift.start, shift.end);

    // Filter eligible employees
    const eligible = employees.filter(e => {
      // Must have matching position
      if (!e.positions.includes(shift.positionId)) return false;
      
      // Must have availability
      if (!hasAvailability(e, shift)) return false;
      
      return true;
    });

    if (eligible.length === 0) {
      unfilled.push(shift.id);
      warnings.push({
        type: 'error',
        shiftId: shift.id,
        message: `No qualified employees available for this shift`
      });
      continue;
    }

    // Score and sort employees by desirability
    const scored = eligible.map(emp => {
      const currentHours = hours[emp.id] || 0;
      const newTotal = currentHours + duration;
      
      let score = 0;
      
      // Fairness: prefer employees with fewer hours (weighted)
      const maxHoursPossible = maxHoursPerWeek;
      const hoursScore = 1 - (currentHours / maxHoursPossible);
      score += hoursScore * fairnessWeight;
      
      // Avoid overtime: penalize if would exceed threshold
      if (newTotal > overtimeThreshold) {
        const overtimePenalty = (newTotal - overtimeThreshold) / overtimeThreshold;
        score -= overtimePenalty * avoidOvertimeWeight;
      }
      
      return { employee: emp, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Assign employees to shift
    let filled = 0;
    for (const { employee: emp } of scored) {
      if (filled >= shift.required) break;

      const currentHours = hours[emp.id] || 0;
      const newTotal = currentHours + duration;

      // Hard constraint: max hours
      if (emp.maxHours && newTotal > emp.maxHours) {
        warnings.push({
          type: 'warning',
          shiftId: shift.id,
          employeeId: emp.id,
          message: `${emp.name || emp.id} would exceed max hours (${newTotal.toFixed(1)}/${emp.maxHours})`
        });
        continue;
      }

      // Hard constraint: rest hours
      if (minRestHours && !checkRestHours(employeeShifts, emp.id, shift, minRestHours)) {
        warnings.push({
          type: 'warning',
          shiftId: shift.id,
          employeeId: emp.id,
          message: `${emp.name || emp.id} needs ${minRestHours}h rest between shifts`
        });
        continue;
      }

      // Hard constraint: consecutive days
      if (maxConsecutiveDays && !checkConsecutiveDays(employeeShifts, emp.id, shift, maxConsecutiveDays)) {
        warnings.push({
          type: 'warning',
          shiftId: shift.id,
          employeeId: emp.id,
          message: `${emp.name || emp.id} would exceed ${maxConsecutiveDays} consecutive days`
        });
        continue;
      }

      // Soft warning: overtime
      if (newTotal > overtimeThreshold) {
        warnings.push({
          type: 'info',
          shiftId: shift.id,
          employeeId: emp.id,
          message: `${emp.name || emp.id} will work ${newTotal.toFixed(1)} hours (overtime threshold: ${overtimeThreshold})`
        });
      }

      // Assign!
      assignments[shift.id].push(emp.id);
      hours[emp.id] = newTotal;
      totalHoursScheduled += duration;
      
      if (!employeeShifts.has(emp.id)) {
        employeeShifts.set(emp.id, []);
      }
      employeeShifts.get(emp.id)!.push(shift);
      
      filled++;
    }

    // Check if shift fully filled
    if (filled < shift.required) {
      unfilled.push(shift.id);
      const severity = filled === 0 ? 'error' : 'warning';
      warnings.push({
        type: severity,
        shiftId: shift.id,
        message: `Only ${filled}/${shift.required} positions filled`
      });
    }
  }

  // Calculate stats
  const totalShifts = shifts.length;
  const fullyFilledShifts = shifts.filter(s => 
    assignments[s.id]?.length === s.required
  ).length;
  const partiallyFilledShifts = shifts.filter(s => {
    const assigned = assignments[s.id]?.length || 0;
    return assigned > 0 && assigned < s.required;
  }).length;
  const unfilledShifts = unfilled.length;
  const fillRate = totalShifts > 0 
    ? ((fullyFilledShifts + (partiallyFilledShifts * 0.5)) / totalShifts) * 100 
    : 0;
  const employeesUsed = Object.keys(hours).length;

  return {
    assignments,
    unfilled,
    warnings,
    stats: {
      totalShifts,
      filledShifts: fullyFilledShifts,
      partiallyFilledShifts,
      unfilledShifts,
      fillRate: parseFloat(fillRate.toFixed(1)),
      totalHoursScheduled: parseFloat(totalHoursScheduled.toFixed(1)),
      employeesUsed
    }
  };
}
