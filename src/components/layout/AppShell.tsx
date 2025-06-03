
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
  Search, // Added for search
  Trophy, // Added for Achievements
  // BarChart3, // For '研讀' (Research) - Removed
  // Sparkles, // For '情境連結' (Modern Relevance) - Removed
  // Users2, // For '學習社群' (Community) - if different from Users
  // MessageSquare, // For '寫作輔助' (Writing Assistant)
  // ListChecks, // For '學習目標' (Goals) - Removed
  // Brain, // For '學習狀況' (Learning Analysis) - Removed
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
  SidebarTrigger, 
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

const navItems: NavItem[] = [
  { href: "/dashboard", label: "首頁", icon: LayoutDashboard, tooltip: "首頁" },
  { href: "/read", label: "閱讀", icon: BookOpen, tooltip: "閱讀" },
  { href: "/achievements", label: "成就與目標", icon: Trophy, tooltip: "我的成就與目標" }, // Added
  // { href: "/goals", label: "學習目標", icon: ListChecks, tooltip: "學習目標與進度" }, // Removed
  // { href: "/characters", label: "學習狀況", icon: Brain, tooltip: "個人知識圖譜與學習分析" }, // Removed
  // { href: "/research", label: "研讀", icon: BarChart3, tooltip: "專題研究" }, // Removed
  // { href: "/modern-relevance", label: "情境連結", icon: Sparkles, tooltip: "現代生活連結" }, // Removed
  { href: "/community", label: "紅學社", icon: Users, tooltip: "學習社群" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); 
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
                    variant={pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/') || (pathname === '/read-book' && item.href === '/read') ? "default" : "ghost"}
                    isActive={pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/') || (pathname === '/read-book' && item.href === '/read')}
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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-start border-b bg-background/80 px-6 backdrop-blur-md md:justify-between">
          <SidebarTrigger className="md:hidden" /> 
          <div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-6"> 
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
