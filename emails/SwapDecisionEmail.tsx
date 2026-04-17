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

interface SwapDecisionEmailProps {
  employeeName: string;
  orgName: string;
  shiftDate: string;
  shiftTime: string;
  position: string;
  decision: 'approved' | 'denied';
  reason?: string;
  scheduleUrl: string;
}

export default function SwapDecisionEmail({
  employeeName = 'Sam Patel',
  orgName = 'Demo Bar & Grill',
  shiftDate = 'Friday, April 25',
  shiftTime = '5:00 PM - 11:00 PM',
  position = 'Bartender',
  decision = 'approved',
  reason,
  scheduleUrl = 'https://app.nextshyft.com/org/demo/myschedule',
}: SwapDecisionEmailProps) {
  const isApproved = decision === 'approved';
  
  return (
    <Html>
      <Head />
      <Preview>
        Your shift swap request has been {isApproved ? 'approved' : 'denied'}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isApproved ? '✅ Swap Approved' : '❌ Swap Denied'}
          </Heading>
          
          <Text style={text}>
            Hi {employeeName},
          </Text>
          
          <Text style={text}>
            Your request to swap the following shift has been <strong>{decision}</strong>:
          </Text>
          
          <Section style={shiftBox}>
            <Text style={shiftDetail}>
              <strong>Date:</strong> {shiftDate}
            </Text>
            <Text style={shiftDetail}>
              <strong>Time:</strong> {shiftTime}
            </Text>
            <Text style={shiftDetail}>
              <strong>Position:</strong> {position}
            </Text>
          </Section>
          
          {reason && (
            <>
              <Text style={text}>
                <strong>{isApproved ? 'Note' : 'Reason'}:</strong>
              </Text>
              <Section style={reasonBox}>
                <Text style={reasonText}>{reason}</Text>
              </Section>
            </>
          )}
          
          {isApproved && (
            <Text style={text}>
              The schedule has been updated to reflect this change. 
              Make sure to coordinate with your teammate!
            </Text>
          )}
          
          {!isApproved && (
            <Text style={text}>
              You're still scheduled for this shift. If you need time off, 
              please reach out to your manager directly.
            </Text>
          )}
          
          <Section style={buttonContainer}>
            <Button style={button} href={scheduleUrl}>
              View Your Schedule
            </Button>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            {orgName} · Powered by <Link href="https://app.nextshyft.com" style={link}>NextShyft</Link>
          </Text>
          
          <Text style={footer}>
            <Link href={`${scheduleUrl}?unsubscribe=swaps`} style={link}>
              Unsubscribe from swap notifications
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

const shiftBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 24px',
};

const shiftDetail = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '8px 0',
};

const reasonBox = {
  backgroundColor: '#fef3c7',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '4px',
  padding: '16px',
  margin: '16px 24px',
};

const reasonText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
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
