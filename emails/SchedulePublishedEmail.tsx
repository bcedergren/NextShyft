import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface SchedulePublishedEmailProps {
  employeeName: string;
  orgName: string;
  scheduleUrl: string;
  weekStartDate: string;
  shiftCount: number;
  totalHours: number;
}

export default function SchedulePublishedEmail({
  employeeName = 'Sam Patel',
  orgName = 'Demo Bar & Grill',
  scheduleUrl = 'https://app.nextshyft.com/org/demo/myschedule',
  weekStartDate = 'Monday, April 21',
  shiftCount = 4,
  totalHours = 32,
}: SchedulePublishedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your schedule for {weekStartDate} is now available</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📅 New Schedule Published</Heading>
          
          <Text style={text}>
            Hi {employeeName},
          </Text>
          
          <Text style={text}>
            Your schedule for the week of <strong>{weekStartDate}</strong> is now available.
          </Text>
          
          <Section style={statsBox}>
            <Text style={statText}>
              <strong>{shiftCount}</strong> shifts scheduled
            </Text>
            <Text style={statText}>
              <strong>{totalHours}</strong> hours total
            </Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href={scheduleUrl}>
              View Your Schedule
            </Button>
          </Section>
          
          <Text style={text}>
            <strong>What you can do:</strong>
          </Text>
          
          <ul style={list}>
            <li>View all your shifts for the week</li>
            <li>Add to your personal calendar (iCal export)</li>
            <li>Request shift swaps if needed</li>
            <li>Update your availability for future schedules</li>
          </ul>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            {orgName} · Powered by <Link href="https://app.nextshyft.com" style={link}>NextShyft</Link>
          </Text>
          
          <Text style={footer}>
            <Link href={`${scheduleUrl}?unsubscribe=schedule`} style={link}>
              Unsubscribe from schedule notifications
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '560px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: '700',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
};

const statsBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 24px',
  textAlign: 'center' as const,
};

const statText = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '600',
  margin: '8px 0',
};

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
  paddingLeft: '20px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#1f2937',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const link = {
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '8px 24px',
  textAlign: 'center' as const,
};
