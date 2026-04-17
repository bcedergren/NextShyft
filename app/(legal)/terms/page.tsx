import { Typography, Box, Divider } from '@mui/material';

export const metadata = {
  title: 'Terms of Service - NextShyft',
  description: 'Terms of Service for NextShyft workforce scheduling platform'
};

export default function TermsPage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Terms of Service
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 4 }}>
        Last updated: April 17, 2026
      </Typography>

      <Divider sx={{ mb: 4 }} />

      <Box sx={{ '& > *': { mb: 3 } }}>
        <section>
          <Typography variant="h5" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph>
            By accessing or using NextShyft ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
            If you do not agree to these Terms, you may not use the Service.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            2. Description of Service
          </Typography>
          <Typography paragraph>
            NextShyft provides workforce scheduling and shift management software as a service (SaaS). 
            The Service allows organizations to create schedules, manage employee availability, 
            and communicate shift information to team members.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            3. User Accounts
          </Typography>
          <Typography paragraph>
            To use the Service, you must create an account. You are responsible for:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Maintaining the confidentiality of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
            <li>Providing accurate and current information</li>
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            4. Acceptable Use
          </Typography>
          <Typography paragraph>
            You agree not to:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Use the Service for any illegal purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorized access to the Service or related systems</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Impersonate any person or entity</li>
            <li>Scrape, spider, or harvest data from the Service</li>
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            5. Subscription and Payment
          </Typography>
          <Typography paragraph>
            <strong>Free Plan:</strong> We offer a free tier with limited features. 
            We reserve the right to modify or discontinue the free plan at any time.
          </Typography>
          <Typography paragraph>
            <strong>Paid Plans:</strong> Paid subscriptions are billed in advance on a monthly or annual basis. 
            You authorize us to charge your payment method for all fees incurred.
          </Typography>
          <Typography paragraph>
            <strong>Cancellation:</strong> You may cancel your subscription at any time. 
            Cancellations take effect at the end of the current billing period. No refunds are provided for partial months.
          </Typography>
          <Typography paragraph>
            <strong>Price Changes:</strong> We may change subscription prices with 30 days' notice. 
            Continued use of the Service after a price change constitutes acceptance of the new price.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            6. Data and Privacy
          </Typography>
          <Typography paragraph>
            Your use of the Service is also governed by our Privacy Policy. 
            We collect and process data as described in our <a href="/privacy">Privacy Policy</a>.
          </Typography>
          <Typography paragraph>
            You retain all rights to your data. You may export or delete your data at any time through your account settings.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            7. Intellectual Property
          </Typography>
          <Typography paragraph>
            The Service, including all content, features, and functionality, is owned by NextShyft and is protected 
            by copyright, trademark, and other intellectual property laws.
          </Typography>
          <Typography paragraph>
            You are granted a limited, non-exclusive, non-transferable license to access and use the Service 
            for your internal business purposes only.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            8. Termination
          </Typography>
          <Typography paragraph>
            We may suspend or terminate your access to the Service at any time, with or without cause, 
            with or without notice. Upon termination:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Your right to use the Service immediately ceases</li>
            <li>You remain liable for all fees incurred prior to termination</li>
            <li>You may request a data export within 30 days of termination</li>
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            9. Disclaimer of Warranties
          </Typography>
          <Typography paragraph>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, 
            FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </Typography>
          <Typography paragraph>
            We do not warrant that the Service will be uninterrupted, error-free, or completely secure.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            10. Limitation of Liability
          </Typography>
          <Typography paragraph>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEXTSHYFT SHALL NOT BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
            WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </Typography>
          <Typography paragraph>
            Our total liability to you for any claims arising from your use of the Service shall not exceed 
            the amount you paid us in the 12 months preceding the claim.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            11. Indemnification
          </Typography>
          <Typography paragraph>
            You agree to indemnify and hold harmless NextShyft from any claims, damages, losses, liabilities, 
            and expenses (including attorneys' fees) arising from:
          </Typography>
          <Typography component="ul" sx={{ pl: 4 }}>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            12. Changes to Terms
          </Typography>
          <Typography paragraph>
            We reserve the right to modify these Terms at any time. We will notify you of material changes 
            via email or through the Service. Your continued use of the Service after such changes constitutes 
            your acceptance of the new Terms.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            13. Governing Law
          </Typography>
          <Typography paragraph>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
            in which NextShyft is registered, without regard to its conflict of law provisions.
          </Typography>
        </section>

        <section>
          <Typography variant="h5" gutterBottom>
            14. Contact Information
          </Typography>
          <Typography paragraph>
            If you have any questions about these Terms, please contact us at:
          </Typography>
          <Typography paragraph>
            Email: support@YOUR_DOMAIN.com
          </Typography>
        </section>
      </Box>
    </Box>
  );
}
