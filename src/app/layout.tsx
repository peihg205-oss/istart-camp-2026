import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ScoringProvider } from '@/lib/store/scoringStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/ToastProvider';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IStart Camp 2026 | Bảng Điểm Trực Tuyến - Unlock the iSER in you',
  description: 'Hệ thống chấm điểm trực tuyến thời gian thực cho 14 đội tuyển tranh tài tại trại IStart Camp 2026. Cập nhật bảng xếp hạng, điểm số hoạt động và kỷ luật.',
  keywords: ['IStart Camp 2026', 'Scoring System', 'Leaderboard', 'iSER', '14 Teams', 'BDA', 'AIT', 'BEL'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={plusJakartaSans.variable}>
      <body className={`${plusJakartaSans.className} antialiased min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-[#1A55E3]/20 selection:text-[#1A55E3]`}>
        <ScoringProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 w-full flex flex-col">{children}</main>
            <Footer />
          </ToastProvider>
        </ScoringProvider>
      </body>
    </html>
  );
}
