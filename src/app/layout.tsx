import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DemoSwitcher from '@/components/common/DemoSwitcher';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'Digital Heroes | Golf Performance & Charity Draw Platform',
  description:
    'A subscription-driven web platform combining Stableford golf score tracking, charity fundraising, and transparent monthly draw-based prize pools.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 antialiased selection:bg-orange-500 selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <DemoSwitcher />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
