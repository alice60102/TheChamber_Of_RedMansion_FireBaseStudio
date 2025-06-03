
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

  const isReadBookPage = pathname === '/read-book';

  if (isReadBookPage) {
    // Special layout for the book reading page (no AppShell, custom main for full immersion)
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <main className="flex-1 overflow-hidden h-full">
          {children}
        </main>
      </div>
    );
  } else {
    // Default layout for all other authenticated pages (wrapped with AppShell)
    // AppShell internally provides a <main> with p-6 and overflow-y-auto
    return <AppShell>{children}</AppShell>;
  }
}
