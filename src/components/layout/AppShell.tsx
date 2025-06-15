
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
  Trophy,
  ChevronDown,
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
import { useLanguage } from "@/hooks/useLanguage";
import { LANGUAGES } from "@/lib/translations";
import type { Language } from "@/lib/translations";


export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname(); 
  const router = useRouter();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { href: "/dashboard", labelKey: "sidebar.home", icon: LayoutDashboard },
    { href: "/read", labelKey: "sidebar.read", icon: BookOpen },
    { href: "/achievements", labelKey: "sidebar.achievements", icon: Trophy },
    { href: "/community", labelKey: "sidebar.community", icon: Users },
  ];
  
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
            <h1 className="text-xl font-artistic text-white">{t('appName')}</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.labelKey}>
                <SidebarMenuButton
                    asChild
                    className="w-full justify-start"
                    variant={pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/') || (pathname === '/read-book' && item.href === '/read') ? "default" : "ghost"}
                    isActive={pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/') || (pathname === '/read-book' && item.href === '/read')}
                    tooltip={t(item.labelKey)}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="truncate">{t(item.labelKey)}</span>
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
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{user.displayName || t('community.anonymousUser')}</p>
                    <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>{t('appShell.userAccount')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('appShell.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('buttons.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           ) : (
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/login">{t('buttons.login')}</Link>
            </Button>
           )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
          <SidebarTrigger className="md:hidden" /> 
          <div></div> {/* Placeholder for potential header content on the right */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-xs sm:text-sm font-medium text-foreground/70 hover:text-foreground px-2 sm:px-3">
                {LANGUAGES.find(lang => lang.code === language)?.name || language}
                <ChevronDown className="ml-1 h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {LANGUAGES.map((langOption) => (
                <DropdownMenuItem
                  key={langOption.code}
                  onSelect={() => setLanguage(langOption.code as Language)}
                  disabled={language === langOption.code}
                >
                  {langOption.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto p-6"> 
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
