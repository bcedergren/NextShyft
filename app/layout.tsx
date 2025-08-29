import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'NextShyft',
  description: 'Smart shift scheduling for bars & restaurants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6C63FF" />
      </head>
      <body>
        <Providers>
          <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
            <div style={{ flex: '1 0 auto' }}>{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
