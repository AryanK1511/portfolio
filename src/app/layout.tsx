import { Analytics } from '@vercel/analytics/next';

import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';

import Navbar from '@/components/navbar';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PROFILE } from '@/data/resume';
import { cn } from '@/lib/utils';

import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(PROFILE.url),
  title: {
    default: PROFILE.name,
    template: `%s | ${PROFILE.name}`,
  },
  description: PROFILE.description,
  openGraph: {
    title: `${PROFILE.name}`,
    description: PROFILE.description,
    url: PROFILE.url,
    siteName: `${PROFILE.name}`,
    locale: 'en_US',
    type: 'website',
  },
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
  twitter: {
    title: `${PROFILE.name}`,
    card: 'summary_large_image',
  },
  verification: {
    google: '',
    yandex: '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased max-w-4xl mx-auto py-12 sm:py-24 px-6',
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <TooltipProvider delayDuration={0}>
            {children}
            <Navbar />
          </TooltipProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
