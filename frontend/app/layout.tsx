import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bella Wedding AI',
  description: 'Your AI-powered wedding planner',
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