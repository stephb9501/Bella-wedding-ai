import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bella Wedding AI - AI-Powered Wedding Planning Platform',
  description: 'Plan your dream wedding with AI-powered tools. Manage guests, budget, timeline, photos, registry, and more. Free wedding planning software for couples and vendors.',
  keywords: ['wedding planner', 'wedding planning app', 'AI wedding planner', 'wedding budget tracker', 'guest list manager', 'wedding checklist', 'wedding registry', 'wedding photo gallery', 'wedding vendor directory', 'free wedding planner'],
  authors: [{ name: 'Bella Wedding AI' }],
  creator: 'Bella Wedding AI',
  publisher: 'Bella Wedding AI',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bellaweddingai.com',
    siteName: 'Bella Wedding AI',
    title: 'Bella Wedding AI - AI-Powered Wedding Planning Platform',
    description: 'Plan your dream wedding with AI-powered tools. Manage guests, budget, timeline, photos, registry, and more. Free wedding planning software.',
    images: [
      {
        url: 'https://bellaweddingai.com/wedding-photos/deltalow-560.jpg',
        width: 1200,
        height: 630,
        alt: 'Bella Wedding AI - Wedding Planning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bella Wedding AI - AI-Powered Wedding Planning',
    description: 'Plan your dream wedding with AI-powered tools. Free wedding planning software for couples.',
    images: ['https://bellaweddingai.com/wedding-photos/deltalow-560.jpg'],
  },
  alternates: {
    canonical: 'https://bellaweddingai.com',
  },
  category: 'Wedding Planning',
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