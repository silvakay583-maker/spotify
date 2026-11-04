// TypeScript / app/layout.tsx / Next.js 14+ / browser target
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spotify Rewards Cashout',
  description:
    'Interactive Spotify Rewards evaluation and cashout experience with step-by-step chat flow, audio preview player, and earnings dashboard.',
  openGraph: {
    title: 'Spotify Rewards Cashout',
    description:
      'Interactive Spotify Rewards evaluation and cashout experience with step-by-step chat flow, audio preview player, and earnings dashboard.',
  },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
