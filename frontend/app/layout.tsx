import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CricketIQ — AI Cricket Recommendations',
  description: 'AI-powered cricket player recommendation system.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
