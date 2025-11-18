import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bella Wedding AI - Your AI-Powered Wedding Planning Platform',
  description: 'Plan your dream wedding with AI-powered tools. Guest management, budget tracking, timeline, photo gallery, vendor directory, and more. All in one elegant platform. Free to start!',
  keywords: ['wedding planning', 'AI wedding planner', 'guest list', 'RSVP management', 'wedding budget', 'wedding checklist', 'wedding vendors', 'wedding registry', 'wedding photos'],
  authors: [{ name: 'Bella Wedding AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bellaweddingai.com',
    siteName: 'Bella Wedding AI',
    title: 'Bella Wedding AI - Your AI-Powered Wedding Planning Platform',
    description: 'Plan your dream wedding with AI-powered tools. Guest management, budget tracking, timeline, photo gallery, vendor directory, and more. All in one elegant platform. Free to start!',
    images: [
      {
        url: '/images/IMG_3941.JPG',
        width: 1200,
        height: 630,
        alt: 'Bella Wedding AI - Beautiful beach wedding with bride and groom',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bella Wedding AI - Your AI-Powered Wedding Planning Platform',
    description: 'Plan your dream wedding with AI-powered tools. Guest management, budget tracking, timeline, and more. Free to start!',
    images: ['/images/IMG_3941.JPG'],
    creator: '@BellaWeddingAI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}