import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DemoSwitcher from '@/components/common/DemoSwitcher';
import AnimatedGolfBackground from '@/components/common/AnimatedGolfBackground';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/common/Toast';

export const metadata: Metadata = {
  title: 'Digital Heroes | Golf Performance & Charity Draw Platform',
  description:
    'A subscription-driven web platform combining Stableford golf score tracking, charity fundraising, and transparent monthly draw-based prize pools.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Digital Heroes | Golf & Charity Platform',
    description: 'Log rolling golf scores, enter monthly jackpot draws, and support verified charities.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#0b0e14] text-slate-100 antialiased selection:bg-orange-500 selection:text-white relative">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <AnimatedGolfBackground />
                <div className="relative z-10 flex-1 flex flex-col">
                  <Navbar />
                  <main className="flex-1 focus:outline-none" id="main-content">{children}</main>
                  <Footer />
                </div>
                <DemoSwitcher />
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
