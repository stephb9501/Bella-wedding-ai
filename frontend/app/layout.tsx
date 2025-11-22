import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://bellaweddingai.com'),
  title: {
    default: 'Bella Wedding AI - Your Dream Wedding, Perfectly Planned',
    template: '%s | Bella Wedding AI',
  },
  description:
    'Plan your perfect wedding with Bella Wedding AI. All-in-one wedding planning platform with AI-powered insights, guest management, budget tracking, vendor directory, timeline, photo gallery, and more. Free to start, no credit card required!',
  keywords: [
    'wedding planning app',
    'AI wedding planner',
    'wedding planning software',
    'online wedding planner',
    'free wedding planner',
    'wedding guest list',
    'RSVP management',
    'wedding budget tracker',
    'wedding checklist',
    'wedding timeline',
    'wedding vendor directory',
    'wedding photo gallery',
    'wedding registry aggregator',
    'AI wedding assistant',
    'digital wedding planner',
    'wedding planning tools',
  ],
  authors: [{ name: 'Bella Wedding AI' }],
  creator: 'Bella Wedding AI',
  publisher: 'Bella Wedding AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bellaweddingai.com',
    siteName: 'Bella Wedding AI',
    title: 'Bella Wedding AI - Your Dream Wedding, Perfectly Planned',
    description:
      'All-in-one wedding planning platform with AI-powered insights, guest management, budget tracking, vendor directory, and more. Free to start!',
    images: [
      {
        url: '/wedding-photos/deltalow-560.jpg',
        width: 1200,
        height: 630,
        alt: 'Bella Wedding AI - Beautiful beach wedding planning platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bella Wedding AI - Your Dream Wedding, Perfectly Planned',
    description:
      'All-in-one wedding planning platform with AI-powered insights. Plan your perfect wedding with ease!',
    images: ['/wedding-photos/deltalow-560.jpg'],
    creator: '@bellaweddingai',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  verification: {
    // Add your verification codes here when you set them up
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
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