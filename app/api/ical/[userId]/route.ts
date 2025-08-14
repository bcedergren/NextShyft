
import { NextResponse } from 'next/server';

function toICS(events: { uid: string, start: string, end: string, summary: string }[]) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NextShyft//EN'
  ];
  for (const ev of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.uid}`);
    lines.push(`DTSTAMP:${ev.start.replace(/[-:]/g,'').split('.')[0]}Z`);
    lines.push(`DTSTART:${ev.start.replace(/[-:]/g,'').split('.')[0]}Z`);
    lines.push(`DTEND:${ev.end.replace(/[-:]/g,'').split('.')[0]}Z`);
    lines.push(`SUMMARY:${ev.summary}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export async function GET(_: Request, { params }: { params: { userId: string } }) {
  // TODO: query user shifts from DB
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 22, 0);
  const fmt = (d: Date) => d.toISOString();
  const ics = toICS([ { uid: `nextshyft-${params.userId}-1`, start: fmt(start), end: fmt(end), summary: 'Bartender Shift' } ]);
  return new NextResponse(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
}
