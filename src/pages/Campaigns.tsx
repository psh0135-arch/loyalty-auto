import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/EmptyState";
import {
  BarChart3,
  Plus,
  Bell,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  FileEdit,
  Megaphone,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const channelMeta: Record<string, { icon: typeof Bell; label: string }> = {
  push: { icon: Bell, label: "푸시 알림" },
  email: { icon: Mail, label: "이메일" },
  sms: { icon: MessageSquare, label: "SMS" },
};

type CampaignStatus = "draft" | "active" | "paused" | "ended";

const statusMeta: Record<CampaignStatus, { label: string; className: string }> = {
  draft: { label: "초안", className: "bg-muted text-muted-foreground hover:bg-muted" },
  active: { label: "활성", className: "bg-success/10 text-success hover:bg-success/10" },
  paused: { label: "일시중지", className: "bg-warning/10 text-warning hover:bg-warning/10" },
  ended: { label: "종료", className: "bg-secondary text-muted-foreground hover:bg-secondary" },
};

interface Campaign {
  id: string;
  name: string;
  trigger: string;
  channel: keyof typeof channelMeta;
  status: CampaignStatus;
  date: string;
}

const initialCampaigns: Campaign[] = [
  { id: "1", name: "장바구니 이탈 복구 - 5월", trigger: "장바구니 이탈", channel: "push", status: "active", date: "2026-04-22" },
  { id: "2", name: "VIP 재방문 유도", trigger: "30일 미접속", channel: "email", status: "active", date: "2026-04-18" },
  { id: "3", name: "신상품 카테고리 알림", trigger: "특정 카테고리 반복 조회", channel: "push", status: "ended", date: "2026-04-12" },
  { id: "4", name: "리뷰 요청 캠페인", trigger: "장바구니 이탈", channel: "sms", status: "paused", date: "2026-04-09" },
  { id: "5", name: "휴면 고객 깨우기", trigger: "30일 미접속", channel: "email", status: "draft", date: "2026-04-05" },
  { id: "6", name: "뷰티 카테고리 추천", trigger: "특정 카테고리 반복 조회", channel: "push", status: "ended", date: "2026-03-30" },
];

const tabs: { value: CampaignStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "active", label: "활성" },
  { value: "paused", label: "일시중지" },
  { value: "draft", label: "초안" },
  { value: "ended", label: "종료" },
];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = campaigns.filter((c) => {
    const matchTab = tab === "all" || c.status === tab;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const updateStatus = (id: string, status: CampaignStatus) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success("상태가 변경되었습니다", {
      description: `${statusMeta[status].label} 상태로 전환되었습니다.`,
    });
  };

  const counts = campaigns.reduce(
    (acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1, all: acc.all + 1 }),
    { all: 0 } as Record<string, number>,
  );

  return (
    <AppLayout
      title="개인화 캠페인 관리"
      description="고객 행동 트리거 기반 자동화 캠페인을 만들고 상태를 관리하세요"
      action={
        <Button asChild className="bg-gradient-primary shadow-elevated">
          <Link to="/campaigns/new">
            <Plus className="mr-1 h-4 w-4" /> 새 캠페인
          </Link>
        </Button>
      }
    >
      <h2 className="sr-only">캠페인 필터 및 검색</h2>
      <Card className="shadow-card mb-4">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
            <TabsList className="w-full md:w-auto overflow-x-auto justify-start">
              {tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5">
                  {t.label}
                  <span className="text-[10px] text-muted-foreground">
                    {counts[t.value] || 0}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="캠페인명 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <h2 className="sr-only">캠페인 목록</h2>
      <Card className="shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            campaigns.length === 0 ? (
              <EmptyState
                icon={Megaphone}
                title="아직 생성된 캠페인이 없어요"
                description="첫 자동화 캠페인을 만들어 고객 행동에 따라 개인화 메시지를 발송해보세요."
                action={
                  <Button asChild className="bg-gradient-primary shadow-elevated">
                    <Link to="/campaigns/new">
                      <Plus className="mr-1 h-4 w-4" /> 새 캠페인 만들기
                    </Link>
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={Search}
                title="조건에 맞는 캠페인이 없어요"
                description="검색어나 상태 필터를 변경해보세요."
              />
            )
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                    <TableHead>캠페인명</TableHead>
                    <TableHead className="hidden md:table-cell">트리거</TableHead>
                    <TableHead className="hidden sm:table-cell">채널</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden lg:table-cell">생성일</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => {
                    const ch = channelMeta[c.channel];
                    const Icon = ch.icon;
                    const status = statusMeta[c.status];
                    return (
                      <TableRow key={c.id} className="hover:bg-secondary/30">
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span>{c.name}</span>
                            <span className="text-xs text-muted-foreground md:hidden">
                              {c.trigger}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">
                          {c.trigger}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="inline-flex items-center gap-1.5 text-sm">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                            {ch.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn(status.className)}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden lg:table-cell">
                          {c.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="hidden sm:inline-flex"
                            >
                              <Link to="/analytics">
                                <BarChart3 className="mr-1 h-3.5 w-3.5" /> 성과
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel>상태 변경</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => updateStatus(c.id, "active")}>
                                  <Play className="mr-2 h-4 w-4 text-success" /> 활성화
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(c.id, "paused")}>
                                  <Pause className="mr-2 h-4 w-4 text-warning" /> 일시중지
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatus(c.id, "draft")}>
                                  <FileEdit className="mr-2 h-4 w-4 text-muted-foreground" /> 초안으로
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => updateStatus(c.id, "ended")}>
                                  <Square className="mr-2 h-4 w-4 text-muted-foreground" /> 종료
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
