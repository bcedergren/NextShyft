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

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export default function PasswordResetEmail({
  userName = 'there',
  resetUrl = 'https://app.nextshyft.com/reset?token=abc123',
  expiresInMinutes = 60,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your NextShyft password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🔐 Password Reset Request</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>
          
          <Text style={text}>
            We received a request to reset your NextShyft password. 
            Click the button below to create a new password:
          </Text>
          
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Your Password
            </Button>
          </Section>
          
          <Text style={text}>
            Or copy and paste this URL into your browser:
          </Text>
          <Text style={link}>
            {resetUrl}
          </Text>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              ⏱️ This link will expire in <strong>{expiresInMinutes} minutes</strong> for security reasons.
            </Text>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={securityText}>
            <strong>Security Tips:</strong>
          </Text>
          <ul style={list}>
            <li>Never share your password with anyone</li>
            <li>Use a unique password you don't use elsewhere</li>
            <li>Consider using a password manager</li>
          </ul>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            If you didn't request this password reset, you can safely ignore this email. 
            Your password will not be changed.
          </Text>
          
          <Text style={footer}>
            <Link href="https://app.nextshyft.com" style={footerLink}>NextShyft</Link> - 
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

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
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

const warningBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 24px',
  textAlign: 'center' as const,
};

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const securityText = {
  color: '#1f2937',
  fontSize: '16px',
  margin: '16px 24px 8px',
};

const list = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 24px',
  paddingLeft: '20px',
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
