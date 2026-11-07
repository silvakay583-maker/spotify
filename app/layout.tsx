import type { Metadata, Viewport } from 'next';
import PassThroughScript from './components/PassThroughScript';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next Offer Spot — The Central Hub for Exclusive Offers, Remote Tasks & Rewards',
  description:
    'Discover verified high-paying remote tasks, audio track evaluations, brand sentiment testing, and exclusive member vouchers with instant payouts.',
  openGraph: {
    title: 'Next Offer Spot — The Central Hub for Exclusive Offers, Remote Tasks & Rewards',
    description:
      'Discover verified high-paying remote tasks, audio track evaluations, brand sentiment testing, and exclusive member vouchers with instant payouts.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <PassThroughScript />
        {children}
      </body>
    </html>
  );
}
