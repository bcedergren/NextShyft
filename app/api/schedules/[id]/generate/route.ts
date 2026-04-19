import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { generateSchedule, Shift as ShiftType, Employee } from '@/lib/scheduler/ilp';
import OrgPolicy from '@/models/OrgPolicy';
import User from '@/models/User';
import ShiftTemplate from '@/models/ShiftTemplate';
import Availability from '@/models/Availability';
import Schedule from '@/models/Schedule';
import Shift from '@/models/Shift';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    const orgId = (((session as any)?.user?.orgId || (session as any)?.orgId) as string | undefined) || '';
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dateRange } = await req.json();
    if (!dateRange?.start || !dateRange?.end) {
      return NextResponse.json({ error: 'Date range required' }, { status: 400 });
    }

    // Fetch schedule to verify it exists and belongs to org
    const schedule = await (Schedule as any).findOne({ 
      _id: params.id, 
      orgId 
    });
    
    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    // Fetch org policy for constraints
    const policy = await (OrgPolicy as any).findOne({ orgId });
    
    // Fetch all employees with their positions and availability
    const users = await (User as any).find({ 
      orgId,
      roles: 'EMPLOYEE'
    });

    // Fetch availability for all employees
    const availabilities = await (Availability as any).find({
      userId: { $in: users.map(u => u._id) }
    });

    // Build employee data
    const employees: Employee[] = users.map(user => {
      const avail = availabilities.find(a => 
        a.userId.toString() === user._id.toString()
      );
      
      return {
        id: user._id.toString(),
        name: user.name || user.email,
        positions: user.positions?.map((p: any) => p.toString()) || [],
        weekly: avail?.weekly || {},
        maxHours: policy?.constraints?.maxHoursPerWeek || user.maxHours
      };
    });

    // Fetch existing shifts for this schedule to use as templates
    const existingShifts = await (Shift as any).find({ scheduleId: params.id });
    
    let shifts: ShiftType[] = [];
    
    if (existingShifts.length > 0) {
      // Use existing shifts
      shifts = existingShifts.map(s => ({
        id: s._id.toString(),
        positionId: s.positionId.toString(),
        start: s.start,
        end: s.end,
        required: s.required || 1,
        day: s.day,
        date: s.date
      }));
    } else {
      // Create shifts from templates
      const templates = await (ShiftTemplate as any).find({ 
        orgId 
      });
      
      if (templates.length === 0) {
        return NextResponse.json({ 
          error: 'No shift templates found. Please create shift templates first.' 
        }, { status: 400 });
      }

      // Expand templates to date range
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const dayMap: Record<string, string> = {
        'Sunday': '0', 'Monday': '1', 'Tuesday': '2', 'Wednesday': '3',
        'Thursday': '4', 'Friday': '5', 'Saturday': '6'
      };
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        const dayNum = dayMap[dayName];
        
        for (const template of templates) {
          if (template.day === dayNum || template.day === dayName) {
            shifts.push({
              id: `temp-${d.toISOString()}-${template._id}`,
              positionId: template.positionId.toString(),
              start: template.start,
              end: template.end,
              required: template.required || 1,
              day: dayName,
              date: d.toISOString().split('T')[0]
            });
          }
        }
      }
    }

    if (shifts.length === 0) {
      return NextResponse.json({ 
        error: 'No shifts to schedule. Create shift templates or add shifts manually.' 
      }, { status: 400 });
    }

    if (employees.length === 0) {
      return NextResponse.json({ 
        error: 'No employees found. Invite employees to your organization first.' 
      }, { status: 400 });
    }

    // Generate schedule with AI
    const result = generateSchedule(shifts, employees, {
      maxHoursPerWeek: policy?.constraints?.maxHoursPerWeek || 40,
      overtimeThreshold: policy?.constraints?.maxHoursPerWeek || 40,
      minRestHours: policy?.constraints?.minRestHours,
      maxConsecutiveDays: policy?.constraints?.maxConsecutiveDays,
      fairnessWeight: policy?.softPreferences?.fairnessWeight || 0.7,
      avoidOvertimeWeight: policy?.softPreferences?.avoidOvertimeWeight || 0.8
    });

    // Save assignments to database if shifts were from templates
    if (existingShifts.length === 0) {
      // Create new shifts with assignments
      const shiftDocs = [];
      for (const shift of shifts) {
        const assignedTo = result.assignments[shift.id] || [];
        shiftDocs.push({
          scheduleId: params.id,
          orgId,
          positionId: shift.positionId,
          day: shift.day,
          date: shift.date,
          start: shift.start,
          end: shift.end,
          required: shift.required,
          assignedTo: assignedTo.map(id => id)
        });
      }
      
      await (Shift as any).insertMany(shiftDocs);
    } else {
      // Update existing shifts with assignments
      for (const shift of shifts) {
        const assignedTo = result.assignments[shift.id] || [];
        await (Shift as any).updateOne(
          { _id: shift.id },
          { $set: { assignedTo } }
        );
      }
    }

    return NextResponse.json({
      scheduleId: params.id,
      status: 'generated',
      assignments: result.assignments,
      unfilled: result.unfilled,
      warnings: result.warnings,
      stats: result.stats
    });

  } catch (error: any) {
    console.error('Schedule generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate schedule',
      details: error.message 
    }, { status: 500 });
  }
}
