import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spotify Rewards — Ganhe até $350 por dia avaliando músicas',
  description:
    'Programa oficial Spotify Rewards de validação musical em parceria com grandes e pequenos artistas e produtoras. Avalie faixas e receba pagamentos diários.',
  openGraph: {
    title: 'Spotify Rewards — Ganhe até $350 por dia avaliando músicas',
    description:
      'Programa oficial Spotify Rewards de validação musical em parceria com grandes e pequenos artistas e produtoras. Avalie faixas e receba pagamentos diários.',
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
      <body>{children}</body>
    </html>
  );
}

