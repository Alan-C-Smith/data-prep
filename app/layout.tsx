import type { Metadata } from 'next';
import { Providers } from '@/providers';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import './globals.css';

export const metadata: Metadata = {
  title: 'DataPrep.ai - Data Preprocessing Tool',
  description: 'Transform your data with intelligent preprocessing operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
