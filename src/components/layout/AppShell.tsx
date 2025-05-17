
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Settings,
  ScrollText,
  LayoutDashboard,
  Brain,
  Library,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  tooltip: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "儀表板", icon: LayoutDashboard, tooltip: "Dashboard" },
  { href: "/read", label: "章回閱讀", icon: BookOpen, tooltip: "Read Chapters" },
  { href: "/characters", label: "學習狀況分析", icon: Brain, tooltip: "Learning Status Analysis" },
  { href: "/research", label: "專題研究", icon: Library, tooltip: "Research Topics" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r-sidebar-border">
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ScrollText className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-artistic text-black">紅樓慧讀</h1>
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
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-auto w-full items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar"/>
                  <AvatarFallback>用戶</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-sidebar-foreground">用戶名</p>
                  <p className="text-xs text-sidebar-foreground/70">student@example.com</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>我的帳戶</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>設置</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert('登出功能待實現')}>
                <span>登出</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-4">
            {/* Add any header content here, like search or notifications */}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
