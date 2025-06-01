
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null; 
  }

  const isDashboardPage = pathname === '/dashboard';
  const isReadPage = pathname === '/read';

  if (isDashboardPage) {
    // Dashboard uses AppShell with the sidebar
    return <AppShell>{children}</AppShell>;
  } else {
    // Other pages (e.g., /read, /community) do not use the sidebar
    // They get a simpler, full-width layout
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {/* No global header here from this layout for non-dashboard pages */}
        {/* Individual pages like /read manage their own specific headers if needed (like the top toolbar) */}
        {isReadPage ? (
          <main className="flex-1 overflow-hidden h-full">
            {/* Read page content will manage its own scrolling and header */}
            {children}
          </main>
        ) : (
          // For pages like /community, /research etc.
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        )}
      </div>
    );
  }
}
