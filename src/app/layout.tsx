
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext'; // Added

// Noto Serif SC is imported in globals.css

export const metadata: Metadata = {
  title: '紅樓慧讀', // This might become dynamic later if needed
  description: '探索《紅樓夢》的智能閱讀夥伴 (An intelligent reading companion for exploring "Dream of the Red Chamber")',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // LanguageProvider will set document.documentElement.lang
    // Initial lang here might be overridden by LanguageProvider's useEffect
    <html lang="zh-TW"> 
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" 
          integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body className="font-sans">
        <AuthProvider>
          <LanguageProvider> {/* Added LanguageProvider */}
            {children}
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
