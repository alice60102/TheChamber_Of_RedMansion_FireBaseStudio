
"use client"; 

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // Added usePathname
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
     return null; 
  }
  
  if (!user) {
    return null;
  }

  // For the read page, we want the AppShell to take full height
  // and the main content area to be scrollable without a fixed header inside AppShell's main
  const isReadPage = pathname === '/read';

  return (
    <AppShell>
      {isReadPage ? (
        <main className="flex-1 overflow-hidden h-full"> 
          {/* Read page content will manage its own scrolling and header */}
          {children}
        </main>
      ) : (
        <>
          {/* Original structure for non-read pages */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md md:hidden">
            {/* For mobile: SidebarTrigger might be here or in AppShell's SidebarInset header */}
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </>
      )}
    </AppShell>
  );
}

    