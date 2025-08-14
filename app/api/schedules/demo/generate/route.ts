
import { NextResponse } from 'next/server';
import { generateSchedule } from '@/lib/scheduler/ilp';

export async function POST() {
  const shifts = [
    { id:'A', positionId:'bartender', start:'17:00', end:'22:00', required:1, day:'fri' },
    { id:'B', positionId:'server', start:'18:00', end:'23:00', required:2, day:'fri' },
  ];
  const employees = [
    { id:'u1', positions:['bartender','server'], weekly:{ fri:[{start:'16:00', end:'23:30'}] }, maxHours: 40 },
    { id:'u2', positions:['server'], weekly:{ fri:[{start:'17:00', end:'23:00'}] }, maxHours: 40 },
    { id:'u3', positions:['server'], weekly:{ fri:[{start:'19:00', end:'23:00'}] }, maxHours: 40 },
  ];

  const result = generateSchedule(shifts as any, employees as any);
  return NextResponse.json(result);
}
