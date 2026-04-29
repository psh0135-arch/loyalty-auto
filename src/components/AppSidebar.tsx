import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Megaphone, PlusCircle, Sparkles, Activity, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const overview = [
  { title: "대시보드", url: "/", icon: LayoutDashboard },
  { title: "성과 분석", url: "/analytics", icon: BarChart3 },
];

const campaign = [
  { title: "캠페인", url: "/campaigns", icon: Megaphone },
  { title: "캠페인 생성", url: "/campaigns/new", icon: PlusCircle },
];

const data = [{ title: "고객 이벤트", url: "/events", icon: Activity }];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const renderItems = (items: typeof overview) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <NavLink to={item.url} end={item.url === "/"} className="flex items-center gap-2">
            <item.icon className="h-4 w-4" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-elevated">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">AI CRM</span>
              <span className="text-xs text-muted-foreground mt-1">Automation</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>개요</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(overview)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>캠페인</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(campaign)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>고객 데이터</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(data)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
