import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LogOut, Shield, User as UserIcon } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function AppLayout({ children, title, description, action }: AppLayoutProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("로그아웃되었습니다");
    navigate("/auth", { replace: true });
  };

  const initials = (user?.user_metadata?.display_name || user?.email || "?")
    .toString()
    .slice(0, 2)
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger />
              <div className="hidden md:flex items-center gap-2 w-72 max-w-full">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="캠페인, 고객 검색..." className="pl-9 h-9 bg-secondary/60 border-transparent" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium truncate">
                        {user?.user_metadata?.display_name || user?.email}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                      {isAdmin && (
                        <Badge className="w-fit mt-1 bg-primary/10 text-primary hover:bg-primary/10 gap-1 text-[10px]">
                          <Shield className="h-2.5 w-2.5" /> 관리자
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" /> 관리자 페이지
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem disabled>
                    <UserIcon className="mr-2 h-4 w-4" /> 내 계정
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> 로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
