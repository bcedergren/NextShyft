import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import { getServerSession } from 'next-auth';
import User from '@/models/User';
import Shift from '@/models/Shift';
import Availability from '@/models/Availability';
import Notification from '@/models/Notification';
import Audit from '@/models/Audit';

export async function GET() {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch all user data
    const [user, shifts, availability, notifications, auditLogs] = await Promise.all([
      User.findById(userId).lean(),
      Shift.find({ assignedTo: userId }).lean(),
      Availability.findOne({ userId }).lean(),
      Notification.find({ userId }).lean(),
      Audit.find({ userId }).lean()
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive fields
    const sanitizedUser = {
      ...user,
      passwordHash: undefined,
      reset: undefined
    };

    // Compile all data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: sanitizedUser,
      shifts: shifts.map(s => ({
        id: s._id,
        scheduleId: s.scheduleId,
        positionId: s.positionId,
        day: s.day,
        date: s.date,
        start: s.start,
        end: s.end,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      })),
      availability: availability || null,
      notifications: notifications.map(n => ({
        id: n._id,
        type: n.type,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt
      })),
      auditLog: auditLogs.map(a => ({
        action: a.action,
        timestamp: a.timestamp,
        details: a.details
      }))
    };

    // Return as JSON file download
    const filename = `nextshyft-export-${userId}-${Date.now()}.json`;
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error('Data export error:', error);
    return NextResponse.json({ 
      error: 'Failed to export data',
      details: error.message 
    }, { status: 500 });
  }
}
