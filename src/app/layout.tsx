import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SniperMCP — Robinhood Chain',
  description: 'Autonomous execution and stock-paired liquidity terminal for Robinhood Chain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-black font-sans font-light text-zinc-100 antialiased selection:bg-white selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
