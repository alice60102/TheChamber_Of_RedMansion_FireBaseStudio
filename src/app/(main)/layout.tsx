
"use client"; // This layout needs to be a client component for the hook and router

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // If loading, or if user is null (and useEffect will redirect),
  // you might want to show a loading spinner or null to prevent flashing content.
  // For now, AppShell will be rendered, and if user is null, redirect will happen.
  // If user is not yet loaded, AuthProvider shows a loading screen.
  if (isLoading) {
     return null; // Or a loading component specific to this layout
  }
  
  if (!user) {
    // This case should ideally be handled by the redirect,
    // but as a fallback or during the brief moment before redirect,
    // rendering null can prevent attempting to render child components that might rely on user.
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
