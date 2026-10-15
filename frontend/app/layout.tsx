import type { Metadata } from 'next';
import { DM_Sans, Newsreader, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700'] });
const serif = Newsreader({ subsets: ['latin'], variable: '--font-serif', weight: ['400', '500'], style: ['normal', 'italic'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata: Metadata = {
  title: '11-0 — AI Cricket Recommendations & World Cup Heroes',
  description: '11-0 AI-powered cricket player recommendation system & World Cup simulation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
