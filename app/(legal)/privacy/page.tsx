import { Typography, Box, Divider } from '@mui/material';

export const metadata = {
  title: 'Privacy Policy - NextShyft',
  description: 'Privacy Policy for NextShyft workforce scheduling platform'
};

export default function PrivacyPage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 4 }}>
        Last updated: April 17, 2026
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ '& > *': { mb: 3 }}>
        <section>
          <Typography variant="h5" gutterBottom>
            1. Introduction
          </Typography>
          <Typography paragraph>
            NextShyft ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use 
            our workforce scheduling service ("Service").
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            2. Information We Collect
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            2.1 Information You Provide
          </Typography>
          <Typography paragraph>
            We collect information that you voluntarily provide when using the Service:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Account Information:</strong> Name, email address, password, phone number</li>
            <li><strong>Profile Information:</strong> Job positions, availability preferences, notification settings</li>
            <li><strong>Organization Information:</strong> Company name, scheduling policies, shift templates</li>
            <li><strong>Communication Data:</strong> Messages, announcements, support requests</li>
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            2.2 Automatically Collected Information
          </Typography>
          <Typography paragraph>
            When you use the Service, we automatically collect:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Usage Data:</strong> Pages viewed, features used, actions performed</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>Cookies and Tracking:</strong> Session cookies, analytics cookies</li>
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            3. How We Use Your Information
          </Typography>
          <Typography paragraph>
            We use your information to:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Provide, maintain, and improve the Service</li>
            <li>Create and manage your account</li>
            <li>Process payments and send billing information</li>
            <li>Send notifications about schedules, shifts, and approvals</li>
            <li>Respond to your support requests and communications</li>
            <li>Analyze usage patterns and improve user experience</li>
            <li>Detect, prevent, and address technical issues and fraud</li>
            <li>Comply with legal obligations</li>
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            4. Legal Basis for Processing (GDPR)
          </Typography>
          <Typography paragraph>
            If you are in the European Economic Area (EEA), we process your personal data based on:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Contract Performance:</strong> To provide the Service you've subscribed to</li>
            <li><strong>Legitimate Interests:</strong> To improve the Service and prevent fraud</li>
            <li><strong>Consent:</strong> For marketing communications (you can opt out anytime)</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            5. Data Sharing and Disclosure
          </Typography>
          <Typography paragraph>
            We do not sell your personal data. We may share your information with:
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            5.1 Within Your Organization
          </Typography>
          <Typography paragraph>
            Your schedule information, availability, and profile are visible to managers and administrators 
            in your organization.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            5.2 Service Providers
          </Typography>
          <Typography paragraph>
            We share data with third-party vendors who help us provide the Service:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Hosting:</strong> Vercel (infrastructure), MongoDB Atlas (database)</li>
            <li><strong>Payment Processing:</strong> Stripe</li>
            <li><strong>Email Delivery:</strong> Resend</li>
            <li><strong>SMS Delivery:</strong> Twilio (if enabled)</li>
            <li><strong>Analytics:</strong> Vercel Analytics</li>
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            5.3 Legal Requirements
          </Typography>
          <Typography paragraph>
            We may disclose your information if required by law, subpoena, or to protect our rights and safety.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            6. Data Retention
          </Typography>
          <Typography paragraph>
            We retain your personal data for as long as your account is active or as needed to provide the Service. 
            After account deletion, we retain anonymized data for analytics and audit purposes.
          </Typography>
          <Typography paragraph>
            <strong>Retention Periods:</strong>
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Account data: Duration of account + 30 days</li>
            <li>Schedule history: 2 years for compliance</li>
            <li>Billing records: 7 years for tax compliance</li>
            <li>Audit logs: 1 year (anonymized)</li>
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            7. Your Data Rights
          </Typography>
          <Typography paragraph>
            You have the following rights regarding your personal data:
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            7.1 Access and Portability
          </Typography>
          <Typography paragraph>
            You can access and export your data at any time from your account settings or by contacting us.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            7.2 Correction
          </Typography>
          <Typography paragraph>
            You can update your account information directly in your profile settings.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            7.3 Deletion (Right to be Forgotten)
          </Typography>
          <Typography paragraph>
            You can delete your account from your profile settings. We will anonymize your data within 30 days.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            7.4 Object to Processing
          </Typography>
          <Typography paragraph>
            You can object to marketing communications or certain processing activities by contacting us.
          </Typography>

          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            7.5 Withdraw Consent
          </Typography>
          <Typography paragraph>
            You can withdraw consent for optional data processing (e.g., marketing emails) at any time.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            8. California Privacy Rights (CCPA)
          </Typography>
          <Typography paragraph>
            If you are a California resident, you have additional rights under the California Consumer Privacy Act:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Right to know what personal information we collect and how we use it</li>
            <li>Right to request deletion of your personal information</li>
            <li>Right to opt-out of the "sale" of personal information (we do not sell your data)</li>
            <li>Right to non-discrimination for exercising your privacy rights</li>
          </Typography>
          <Typography paragraph>
            To exercise these rights, contact us at support@YOUR_DOMAIN.com
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            9. Cookies and Tracking
          </Typography>
          <Typography paragraph>
            We use cookies and similar tracking technologies to:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li><strong>Essential Cookies:</strong> Required for the Service to function (e.g., session management)</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use the Service</li>
          </Typography>
          <Typography paragraph>
            You can control cookies through your browser settings. Note that disabling essential cookies may 
            affect your ability to use the Service.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            10. Data Security
          </Typography>
          <Typography paragraph>
            We implement industry-standard security measures to protect your data:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Encryption in transit (HTTPS/TLS)</li>
            <li>Encryption at rest for sensitive data</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure third-party providers (SOC 2 compliant)</li>
          </Typography>
          <Typography paragraph>
            However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            11. Children's Privacy
          </Typography>
          <Typography paragraph>
            The Service is not intended for children under 16. We do not knowingly collect personal information 
            from children. If we learn we have collected data from a child, we will delete it promptly.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            12. International Data Transfers
          </Typography>
          <Typography paragraph>
            Your data may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place, such as Standard Contractual Clauses for EU data transfers.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            13. Changes to This Privacy Policy
          </Typography>
          <Typography paragraph>
            We may update this Privacy Policy from time to time. We will notify you of material changes via email 
            or through the Service. The "Last updated" date at the top reflects the most recent version.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            14. Contact Us
          </Typography>
          <Typography paragraph>
            If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:
          </Typography>
          <Typography paragraph>
            Email: support@YOUR_DOMAIN.com
          </Typography>
          <Typography paragraph>
            <strong>For EU residents:</strong> You also have the right to lodge a complaint with your local 
            data protection authority.
          </Typography>
        </section>
      </Box>
    </Box>
  );
}
