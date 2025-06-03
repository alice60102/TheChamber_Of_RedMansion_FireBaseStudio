
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
  const isReadPage = pathname === '/read' || pathname === '/read-book';

  if (isDashboardPage) {
    return <AppShell>{children}</AppShell>;
  } else {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {isReadPage ? (
          <main className="flex-1 overflow-hidden h-full">
            {children}
          </main>
        ) : (
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        )}
      </div>
    );
  }
}
