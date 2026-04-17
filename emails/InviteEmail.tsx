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

interface InviteEmailProps {
  inviterName: string;
  orgName: string;
  acceptUrl: string;
  inviteeName?: string;
}

export default function InviteEmail({
  inviterName = 'Alex Rivera',
  orgName = 'Demo Bar & Grill',
  acceptUrl = 'https://app.nextshyft.com/accept?token=abc123',
  inviteeName = 'there',
}: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {orgName} on NextShyft</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You're invited! 👋</Heading>
          
          <Text style={text}>
            Hi {inviteeName},
          </Text>
          
          <Text style={text}>
            <strong>{inviterName}</strong> has invited you to join <strong>{orgName}</strong> on NextShyft.
          </Text>
          
          <Text style={text}>
            NextShyft makes scheduling easy. You'll be able to:
          </Text>
          
          <ul style={list}>
            <li>View your schedule anytime, anywhere</li>
            <li>Set your availability preferences</li>
            <li>Request shift swaps with teammates</li>
            <li>Get notifications about schedule changes</li>
          </ul>
          
          <Section style={buttonContainer}>
            <Button style={button} href={acceptUrl}>
              Accept Invitation
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={link}>
            {acceptUrl}
          </Text>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            This invitation was sent by {inviterName} from {orgName}. 
            If you didn't expect this invitation, you can safely ignore this email.
          </Text>
          
          <Text style={footer}>
            <Link href="https://app.nextshyft.com" style={link}>NextShyft</Link> - 
            Workforce Scheduling Made Simple
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
  fontSize: '32px',
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
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
  margin: '0 24px',
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
};
