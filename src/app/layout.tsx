import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'SniperMCP — Robinhood Chain AI Trench Terminal',
  description: 'Zero-setup AI trench terminal, stock-pair radar, and natural-language sniper for Robinhood Chain.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#030303] text-zinc-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
