
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Settings,
  ScrollText,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger, // Kept for mobile view on dashboard
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}

// Nav items for the sidebar, shown when AppShell is used (i.e., on dashboard)
const navItems: NavItem[] = [
  { href: "/dashboard", label: "首頁", icon: LayoutDashboard, tooltip: "首頁" },
  { href: "/read", label: "閱讀", icon: BookOpen, tooltip: "閱讀" },
  { href: "/community", label: "紅學社", icon: Users, tooltip: "Community Forum" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); // Used for highlighting active nav item
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); 
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // AppShell is now only rendered by MainAppLayout when on '/dashboard'.
  // So, SidebarProvider can default to open for desktop.
  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r-sidebar-border">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-artistic text-white">紅樓慧讀</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                    asChild
                    className="w-full justify-start"
                    variant={pathname === item.href ? "default" : "ghost"}
                    isActive={pathname === item.href}
                    tooltip={item.tooltip}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Separator className="my-2 bg-sidebar-border" />
           {user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-auto w-full items-center justify-start gap-2 p-2">
                  <i 
                    className="fa fa-user-circle text-sidebar-foreground" 
                    aria-hidden="true"
                    style={{ fontSize: '32px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  ></i>
                  <div className="text-left">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{user.displayName || '用戶'}</p>
                    <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>我的帳戶</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>設置 (待開發)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>登出</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/login">登入 / 註冊</Link>
            </Button>
           )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {/* This header is part of the main content area when AppShell is used (on dashboard) */}
        {/* It contains the SidebarTrigger for mobile */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-start border-b bg-background/80 px-6 backdrop-blur-md md:justify-between">
          <SidebarTrigger className="md:hidden" /> {/* For opening sidebar on mobile when on dashboard */}
          <div>{/* Placeholder for any other content in dashboard's header */}</div>
        </header>
        <main className="flex-1 overflow-y-auto p-6"> {/* Dashboard content always has padding */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
