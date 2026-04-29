import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, ShoppingCart, CheckCircle2, LogOut, Smartphone, MousePointerClick, Search, Activity, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";

type EventType = "view" | "add_cart" | "purchase" | "cart_abandon" | "app_open" | "push_click";

const eventMeta: Record<EventType, { label: string; icon: LucideIcon; color: string }> = {
  view: { label: "상품 조회", icon: Eye, color: "bg-blue-500/10 text-blue-600" },
  add_cart: { label: "장바구니 추가", icon: ShoppingCart, color: "bg-violet-500/10 text-violet-600" },
  purchase: { label: "구매 완료", icon: CheckCircle2, color: "bg-success/10 text-success" },
  cart_abandon: { label: "장바구니 이탈", icon: LogOut, color: "bg-warning/10 text-warning" },
  app_open: { label: "앱 접속", icon: Smartphone, color: "bg-muted text-muted-foreground" },
  push_click: { label: "푸시 클릭", icon: MousePointerClick, color: "bg-primary/10 text-primary" },
};

interface EventLog {
  id: string;
  customerId: string;
  type: EventType;
  category: string;
  productId: string;
  occurredAt: string;
}

const events: EventLog[] = [
  { id: "1", customerId: "U-10245", type: "view", category: "패션", productId: "P-8821", occurredAt: "2026-04-29 10:42" },
  { id: "2", customerId: "U-10245", type: "add_cart", category: "패션", productId: "P-8821", occurredAt: "2026-04-29 10:45" },
  { id: "3", customerId: "U-10312", type: "purchase", category: "뷰티", productId: "P-7711", occurredAt: "2026-04-29 09:58" },
  { id: "4", customerId: "U-10287", type: "cart_abandon", category: "전자제품", productId: "P-9402", occurredAt: "2026-04-29 09:31" },
  { id: "5", customerId: "U-10199", type: "app_open", category: "-", productId: "-", occurredAt: "2026-04-29 09:12" },
  { id: "6", customerId: "U-10245", type: "push_click", category: "패션", productId: "P-8821", occurredAt: "2026-04-29 08:50" },
  { id: "7", customerId: "U-10456", type: "view", category: "뷰티", productId: "P-7711", occurredAt: "2026-04-29 08:33" },
  { id: "8", customerId: "U-10456", type: "view", category: "뷰티", productId: "P-7720", occurredAt: "2026-04-29 08:35" },
  { id: "9", customerId: "U-10456", type: "view", category: "뷰티", productId: "P-7733", occurredAt: "2026-04-29 08:39" },
  { id: "10", customerId: "U-10312", type: "app_open", category: "-", productId: "-", occurredAt: "2026-04-28 21:14" },
  { id: "11", customerId: "U-10287", type: "view", category: "전자제품", productId: "P-9402", occurredAt: "2026-04-28 18:02" },
  { id: "12", customerId: "U-10287", type: "add_cart", category: "전자제품", productId: "P-9402", occurredAt: "2026-04-28 18:09" },
];

interface CustomerProfile {
  customerId: string;
  recentBehaviors: { label: string; time: string }[];
  favoriteCategories: string[];
  purchases: { product: string; date: string; amount: string }[];
  lastSeen: string;
}

const customerProfiles: Record<string, CustomerProfile> = {
  "U-10245": {
    customerId: "U-10245",
    recentBehaviors: [
      { label: "푸시 클릭 - 패션 카테고리", time: "10분 전" },
      { label: "장바구니 추가 - P-8821", time: "1시간 전" },
      { label: "상품 조회 - P-8821", time: "1시간 전" },
    ],
    favoriteCategories: ["패션", "신발", "액세서리"],
    purchases: [
      { product: "데님 자켓", date: "2026-04-15", amount: "₩89,000" },
      { product: "스니커즈", date: "2026-03-22", amount: "₩129,000" },
    ],
    lastSeen: "2026-04-29 10:45",
  },
  "U-10312": {
    customerId: "U-10312",
    recentBehaviors: [
      { label: "구매 완료 - P-7711", time: "2시간 전" },
      { label: "앱 접속", time: "어제" },
    ],
    favoriteCategories: ["뷰티", "스킨케어"],
    purchases: [
      { product: "수분 크림", date: "2026-04-29", amount: "₩45,000" },
      { product: "립스틱 세트", date: "2026-04-10", amount: "₩68,000" },
      { product: "선크림", date: "2026-03-30", amount: "₩32,000" },
    ],
    lastSeen: "2026-04-29 09:58",
  },
  "U-10287": {
    customerId: "U-10287",
    recentBehaviors: [
      { label: "장바구니 이탈 - P-9402", time: "5시간 전" },
      { label: "장바구니 추가 - P-9402", time: "어제" },
      { label: "상품 조회 - P-9402", time: "어제" },
    ],
    favoriteCategories: ["전자제품", "오디오"],
    purchases: [{ product: "블루투스 이어폰", date: "2026-02-18", amount: "₩159,000" }],
    lastSeen: "2026-04-29 09:31",
  },
  "U-10199": {
    customerId: "U-10199",
    recentBehaviors: [{ label: "앱 접속", time: "오늘" }],
    favoriteCategories: ["식품"],
    purchases: [],
    lastSeen: "2026-04-29 09:12",
  },
  "U-10456": {
    customerId: "U-10456",
    recentBehaviors: [
      { label: "상품 조회 - P-7733 (뷰티)", time: "오늘" },
      { label: "상품 조회 - P-7720 (뷰티)", time: "오늘" },
      { label: "상품 조회 - P-7711 (뷰티)", time: "오늘" },
    ],
    favoriteCategories: ["뷰티"],
    purchases: [],
    lastSeen: "2026-04-29 08:39",
  },
};

function defaultProfile(id: string): CustomerProfile {
  return {
    customerId: id,
    recentBehaviors: [{ label: "행동 데이터 수집 중", time: "—" }],
    favoriteCategories: ["—"],
    purchases: [],
    lastSeen: "—",
  };
}

export default function Events() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchType = filter === "all" || e.type === filter;
      const matchSearch =
        !search ||
        e.customerId.toLowerCase().includes(search.toLowerCase()) ||
        e.productId.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [search, filter]);

  const profile = selected ? customerProfiles[selected] || defaultProfile(selected) : null;

  return (
    <AppLayout title="고객 행동 이벤트 로그" description="실시간 고객 행동 트리거 데이터를 확인하세요">
      <h2 className="sr-only">이벤트 검색 및 필터</h2>
      <Card className="shadow-card mb-4">
        <CardContent className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="고객 ID 또는 상품 ID 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="이벤트 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 이벤트</SelectItem>
              {(Object.keys(eventMeta) as EventType[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {eventMeta[k].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            events.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="아직 수집된 이벤트가 없어요"
                description="고객의 행동 데이터가 들어오면 이곳에 실시간으로 표시됩니다."
              />
            ) : (
              <EmptyState
                icon={Search}
                title="조건에 맞는 이벤트가 없어요"
                description="검색어나 이벤트 유형 필터를 변경해보세요."
              />
            )
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                    <TableHead>고객 ID</TableHead>
                    <TableHead>이벤트 유형</TableHead>
                    <TableHead className="hidden md:table-cell">카테고리</TableHead>
                    <TableHead className="hidden lg:table-cell">상품 ID</TableHead>
                    <TableHead className="hidden sm:table-cell">발생 시간</TableHead>
                    <TableHead className="text-right">상세</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => {
                    const meta = eventMeta[e.type];
                    const Icon = meta.icon;
                    return (
                      <TableRow key={e.id} className="hover:bg-secondary/30">
                        <TableCell className="font-mono text-xs font-medium">{e.customerId}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("gap-1 font-normal", meta.color)}>
                            <Icon className="h-3 w-3" />
                            {meta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground hidden md:table-cell">{e.category}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground hidden lg:table-cell">{e.productId}</TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden sm:table-cell">{e.occurredAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelected(e.customerId)}>
                            보기
                          </Button>
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

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-base">{profile?.customerId}</span>
              <Badge variant="secondary" className="bg-accent text-accent-foreground">
                고객 프로필
              </Badge>
            </DialogTitle>
            <DialogDescription>최근 행동과 선호도 기반 인사이트</DialogDescription>
          </DialogHeader>

          {profile && (
            <div className="space-y-5">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  최근 행동 내역
                </h3>
                <ul className="space-y-1.5">
                  {profile.recentBehaviors.map((b, i) => (
                    <li key={i} className="flex items-center justify-between text-sm rounded-md bg-secondary/50 px-3 py-2">
                      <span>{b.label}</span>
                      <span className="text-xs text-muted-foreground">{b.time}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  관심 카테고리
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.favoriteCategories.map((c) => (
                    <Badge key={c} variant="secondary" className="bg-accent text-accent-foreground">
                      {c}
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  구매 이력
                </h3>
                {profile.purchases.length === 0 ? (
                  <p className="text-sm text-muted-foreground">구매 이력이 없습니다</p>
                ) : (
                  <ul className="space-y-1.5">
                    {profile.purchases.map((p, i) => (
                      <li key={i} className="flex items-center justify-between text-sm rounded-md border border-border px-3 py-2">
                        <div>
                          <p className="font-medium">{p.product}</p>
                          <p className="text-xs text-muted-foreground">{p.date}</p>
                        </div>
                        <span className="text-sm font-semibold text-primary">{p.amount}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="flex items-center justify-between text-sm pt-3 border-t border-border">
                <span className="text-muted-foreground">마지막 접속</span>
                <span className="font-medium">{profile.lastSeen}</span>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
