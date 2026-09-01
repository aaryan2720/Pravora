import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from '@/lib/context/AppContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400','500','600','700','800','900'] });

export const metadata = {
  metadataBase: new URL('https://www.pravora.food'),
  title: {
    default: 'Pravora | Restaurant Operating System',
    template: '%s | Pravora',
  },
  description: 'Real-time operating system for modern restaurants. Live QR ordering, kitchen management, table sessions, and AI-powered insights.',
  keywords: 'restaurant management, POS, QR ordering, restaurant SaaS, table management, live kitchen',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Pravora | Intelligent Restaurant Operating System',
    description: 'The live restaurant control center that connects dining rooms, kitchens, and management.',
    type: 'website',
    url: 'https://www.pravora.food',
    siteName: 'Pravora',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} data-scroll-behavior="smooth">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-google-client-id'}>
          <AppProvider>
            {children}
          </AppProvider>
        </GoogleOAuthProvider>
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
