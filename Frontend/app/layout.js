import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400','500','600','700','800','900'] });

export const metadata = {
  title: 'ServeLoop — Smart Restaurant Operations Platform',
  description: 'Connect guests, staff, kitchen, and management in real time. Live ordering, QR sessions, analytics, and AI-powered insights for modern restaurants.',
  keywords: 'restaurant management, POS, QR ordering, restaurant SaaS, table management',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'ServeLoop — Smart Restaurant Operations Platform',
    description: 'The live restaurant control center that connects everyone.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#0f172a' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#0f172a' } },
          }}
        />
      </body>
    </html>
  );
}
