import { render } from '@react-email/render';
import React from 'react';

// Import React Email templates
import InviteEmail from '@/emails/InviteEmail';
import SchedulePublishedEmail from '@/emails/SchedulePublishedEmail';
import SwapDecisionEmail from '@/emails/SwapDecisionEmail';
import PasswordResetEmail from '@/emails/PasswordResetEmail';
import WelcomeEmail from '@/emails/WelcomeEmail';

/**
 * Support escalation email (plain HTML for internal use)
 */
export function supportEscalationEmail(
  orgName: string,
  orgId: string,
  actorEmail: string,
  plan: string,
) {
  return `
    <h2>NextShyft — Suspension Escalation</h2>
    <p>Org: <strong>${orgName}</strong> (${orgId})</p>
    <p>Plan: ${plan}</p>
    <p>Requested by: ${actorEmail}</p>
    <p>Time: ${new Date().toISOString()}</p>
  `;
}

/**
 * Invite email using React Email template
 */
export function inviteEmail(
  link: string, 
  firstName = '', 
  lastName = '',
  inviterName = 'Your manager',
  orgName = 'Your organization'
) {
  const inviteeName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'there';
  
  return render(
    React.createElement(InviteEmail, {
      inviterName,
      orgName,
      acceptUrl: link,
      inviteeName
    })
  );
}

/**
 * Password reset email using React Email template
 */
export function resetPasswordEmail(link: string, userName = 'there') {
  return render(
    React.createElement(PasswordResetEmail, {
      userName,
      resetUrl: link,
      expiresInMinutes: 60
    })
  );
}

/**
 * Welcome email using React Email template
 */
export function welcomeEmail(
  userName: string,
  orgName: string,
  dashboardUrl: string,
  isManager = false
) {
  return render(
    React.createElement(WelcomeEmail, {
      userName,
      orgName,
      dashboardUrl,
      isManager
    })
  );
}

/**
 * Schedule published email using React Email template
 */
export function schedulePublishedEmail(
  employeeName: string,
  orgName: string,
  scheduleUrl: string,
  weekStartDate: string,
  shiftCount: number,
  totalHours: number
) {
  return render(
    React.createElement(SchedulePublishedEmail, {
      employeeName,
      orgName,
      scheduleUrl,
      weekStartDate,
      shiftCount,
      totalHours
    })
  );
}

/**
 * Swap decision email using React Email template
 */
export function swapDecisionEmail(
  employeeName: string,
  orgName: string,
  shiftDate: string,
  shiftTime: string,
  position: string,
  decision: 'approved' | 'denied',
  reason: string | undefined,
  scheduleUrl: string
) {
  return render(
    React.createElement(SwapDecisionEmail, {
      employeeName,
      orgName,
      shiftDate,
      shiftTime,
      position,
      decision,
      reason,
      scheduleUrl
    })
  );
}
