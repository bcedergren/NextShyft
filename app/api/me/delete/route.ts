import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Shift from '@/models/Shift';
import Availability from '@/models/Availability';
import Notification from '@/models/Notification';
import SwapRequest from '@/models/SwapRequest';
import Invite from '@/models/Invite';

export async function DELETE() {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Soft delete: anonymize user data instead of hard delete
    // This preserves referential integrity for schedules and audit logs
    const anonymizedEmail = `deleted-${userId}-${Date.now()}@deleted.local`;
    const deletionDate = new Date();

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          email: anonymizedEmail,
          name: 'Deleted User',
          firstName: '',
          lastName: '',
          passwordHash: '',
          phone: '',
          phoneVerified: false,
          phoneVerification: undefined,
          reset: { token: '', expiresAt: null },
          deletedAt: deletionDate,
          notificationPrefs: {
            inApp: false,
            email: false,
            sms: false,
            shiftReminderEnabled: false
          }
        }
      }
    );

    // Remove user from all future shift assignments
    await Shift.updateMany(
      { assignedTo: userId, date: { $gte: new Date().toISOString().split('T')[0] } },
      { $pull: { assignedTo: userId } }
    );

    // Delete availability
    await Availability.deleteMany({ userId });

    // Delete notifications
    await Notification.deleteMany({ userId });

    // Delete pending swap requests
    await SwapRequest.deleteMany({
      $or: [
        { requesterId: userId },
        { targetId: userId }
      ],
      status: 'pending'
    });

    // Delete pending invites
    await Invite.deleteMany({ 
      email: user.email,
      status: 'pending'
    });

    // Note: We keep audit logs for compliance, but user is anonymized
    // Note: We keep past shift assignments for scheduling history

    return NextResponse.json({ 
      message: 'Account deleted successfully',
      deletedAt: deletionDate.toISOString()
    });

  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account',
      details: error.message 
    }, { status: 500 });
  }
}
