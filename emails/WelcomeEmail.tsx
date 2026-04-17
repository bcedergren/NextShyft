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

interface WelcomeEmailProps {
  userName: string;
  orgName: string;
  dashboardUrl: string;
  isManager?: boolean;
}

export default function WelcomeEmail({
  userName = 'Alex',
  orgName = 'Demo Bar & Grill',
  dashboardUrl = 'https://app.nextshyft.com/dashboard',
  isManager = false,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to NextShyft - Let's get started!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to NextShyft! 🎉</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>
          
          <Text style={text}>
            Thank you for joining <strong>{orgName}</strong> on NextShyft! 
            We're excited to help make scheduling easier for your team.
          </Text>
          
          {isManager ? (
            <>
              <Text style={sectionHeading}>🚀 Quick Start Guide</Text>
              
              <ul style={list}>
                <li><strong>Set up positions:</strong> Define the roles your team works in (Server, Bartender, etc.)</li>
                <li><strong>Invite your team:</strong> Send invitations to your employees</li>
                <li><strong>Create shift templates:</strong> Set up recurring shift patterns</li>
                <li><strong>Generate schedules:</strong> Use AI to automatically assign shifts</li>
                <li><strong>Publish:</strong> Notify your team when schedules are ready</li>
              </ul>
              
              <Section style={buttonContainer}>
                <Button style={button} href={dashboardUrl}>
                  Start Building Your Schedule
                </Button>
              </Section>
            </>
          ) : (
            <>
              <Text style={sectionHeading}>📱 What You Can Do</Text>
              
              <ul style={list}>
                <li><strong>View your schedule:</strong> See all your shifts in one place</li>
                <li><strong>Set availability:</strong> Let your manager know when you can work</li>
                <li><strong>Request swaps:</strong> Trade shifts with teammates easily</li>
                <li><strong>Stay updated:</strong> Get notifications about schedule changes</li>
                <li><strong>Export to calendar:</strong> Add shifts to Google Calendar or Apple Calendar</li>
              </ul>
              
              <Section style={buttonContainer}>
                <Button style={button} href={dashboardUrl}>
                  View Your Dashboard
                </Button>
              </Section>
            </>
          )}
          
          <Hr style={hr} />
          
          <Text style={sectionHeading}>💡 Helpful Resources</Text>
          
          <Section style={resourceBox}>
            <Text style={resourceText}>
              📖 <Link href="https://app.nextshyft.com/help" style={resourceLink}>
                Help Center
              </Link> - Learn how to use NextShyft
            </Text>
            <Text style={resourceText}>
              💬 <Link href="mailto:support@nextshyft.com" style={resourceLink}>
                Contact Support
              </Link> - We're here to help
            </Text>
            <Text style={resourceText}>
              🔔 <Link href={`${dashboardUrl}/profile`} style={resourceLink}>
                Notification Settings
              </Link> - Customize your alerts
            </Text>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            Welcome aboard! We're here if you need anything.
          </Text>
          
          <Text style={footer}>
            The NextShyft Team
          </Text>
          
          <Text style={footer}>
            <Link href="https://app.nextshyft.com" style={footerLink}>NextShyft</Link> · 
            <Link href="https://app.nextshyft.com/privacy" style={footerLink}>Privacy Policy</Link> · 
            <Link href="https://app.nextshyft.com/terms" style={footerLink}>Terms</Link>
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

const sectionHeading = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: '600',
  margin: '32px 24px 16px',
};

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '28px',
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

const resourceBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 24px',
};

const resourceText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const resourceLink = {
  color: '#3b82f6',
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

const footerLink = {
  color: '#3b82f6',
  fontSize: '12px',
  textDecoration: 'underline',
};
