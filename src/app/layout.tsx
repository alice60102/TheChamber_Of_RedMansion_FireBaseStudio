
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';

// Noto Serif SC is imported in globals.css

export const metadata: Metadata = {
  title: '紅樓慧讀',
  description: '探索《紅樓夢》的智能閱讀夥伴 (An intelligent reading companion for exploring "Dream of the Red Chamber")',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
