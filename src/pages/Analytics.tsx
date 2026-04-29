import AppLayout from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Send,
  MailOpen,
  MousePointerClick,
  TrendingUp,
  ShoppingCart,
  CircleDollarSign,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const dailyData = [
  { date: "05/01", sent: 18200, ctr: 7.8 },
  { date: "05/02", sent: 21400, ctr: 8.2 },
  { date: "05/03", sent: 19800, ctr: 8.6 },
  { date: "05/04", sent: 24500, ctr: 9.1 },
  { date: "05/05", sent: 28100, ctr: 9.7 },
  { date: "05/06", sent: 26300, ctr: 10.4 },
  { date: "05/07", sent: 30200, ctr: 11.1 },
];

const campaignCvr = [
  { name: "장바구니 이탈", cvr: 4.8 },
  { name: "VIP 재방문", cvr: 5.7 },
  { name: "신상품 알림", cvr: 2.4 },
  { name: "리뷰 요청", cvr: 4.1 },
  { name: "30일 미접속", cvr: 3.2 },
];

const campaigns = [
  { name: "장바구니 이탈 복구 - 5월", sent: 12430, open: 42.1, ctr: 8.4, cvr: 4.8, revenue: 18420000, ai: true },
  { name: "VIP 재방문 유도", sent: 4820, open: 51.3, ctr: 12.1, cvr: 5.7, revenue: 9840000, ai: true },
  { name: "신상품 카테고리 알림", sent: 21090, open: 38.7, ctr: 6.7, cvr: 2.4, revenue: 12200000, ai: false },
  { name: "리뷰 요청 캠페인", sent: 3210, open: 44.2, ctr: 9.8, cvr: 4.1, revenue: 1320000, ai: true },
  { name: "30일 미접속 리타겟팅", sent: 8740, open: 35.5, ctr: 7.1, cvr: 3.2, revenue: 5680000, ai: false },
];

const insights = [
  {
    text: "장바구니 이탈 캠페인의 클릭률이 평균보다 18% 높습니다.",
    tag: "성과 우수",
  },
  {
    text: "친근한 톤의 메시지가 전문적인 톤보다 전환율이 22% 높습니다.",
    tag: "톤 분석",
  },
  {
    text: "오후 8시 발송 캠페인의 반응률이 가장 높습니다. (평균 +14%)",
    tag: "타이밍",
  },
  {
    text: "AI 메시지를 사용한 캠페인의 전환율이 비사용 대비 31% 높습니다.",
    tag: "AI 효과",
  },
];

const fmtNum = (n: number) => n.toLocaleString();
const fmtKRW = (n: number) => `₩${(n / 1_000_000).toFixed(1)}M`;

export default function Analytics() {
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);

  return (
    <AppLayout
      title="캠페인 성과 분석"
      description="푸시·이메일·SMS 캠페인 성과와 AI 인사이트를 한눈에 확인하세요"
      action={
        <Select defaultValue="7d">
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">최근 7일</SelectItem>
            <SelectItem value="30d">최근 30일</SelectItem>
            <SelectItem value="90d">최근 90일</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      {/* KPIs */}
      <section aria-labelledby="kpi-heading" className="mb-6">
        <h2 id="kpi-heading" className="sr-only">핵심 성과 지표 (KPI)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="발송 수" value="284,512" delta="+8.3%" trend="up" icon={Send} />
          <StatCard label="오픈율" value="42.6%" delta="+2.1%p" trend="up" icon={MailOpen} />
          <StatCard label="클릭률" value="9.2%" delta="+1.4%p" trend="up" icon={MousePointerClick} />
          <StatCard label="전환율" value="3.8%" delta="-0.2%p" trend="down" icon={TrendingUp} />
          <StatCard label="구매 전환 수" value="10,812" delta="+6.4%" trend="up" icon={ShoppingCart} />
          <StatCard label="예상 매출" value={fmtKRW(totalRevenue)} delta="+12.7%" trend="up" icon={CircleDollarSign} />
        </div>
      </section>

      {/* Charts */}
      <section aria-labelledby="charts-heading" className="mb-6">
        <h2 id="charts-heading" className="sr-only">발송 및 클릭률 추이</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">일자별 발송 수</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sent" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="발송 수" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">일자별 클릭률 (CTR)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ctr"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  name="CTR"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>
      </section>

      <section aria-labelledby="cvr-heading" className="mb-6">
        <h2 id="cvr-heading" className="sr-only">캠페인별 전환율 비교</h2>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">캠페인별 전환율 비교</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaignCvr} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="cvr" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="전환율" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </section>

      {/* AI Insights */}
      <section aria-labelledby="ai-insights-heading" className="mb-6">
        <h2 id="ai-insights-heading" className="sr-only">AI 인사이트</h2>
      <Card className="shadow-card border-primary/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <CardTitle className="text-base font-semibold">AI 캠페인 인사이트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((i) => (
              <div
                key={i.text}
                className="flex items-start gap-3 rounded-lg border border-border bg-accent/40 p-4"
              >
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1.5 min-w-0">
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px]">
                    {i.tag}
                  </Badge>
                  <p className="text-sm text-foreground leading-relaxed">{i.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </section>

      {/* Campaigns Table */}
      <section aria-labelledby="campaigns-table-heading">
        <h2 id="campaigns-table-heading" className="sr-only">캠페인별 상세 성과</h2>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">캠페인별 성과</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>캠페인명</TableHead>
                <TableHead className="text-right">발송 수</TableHead>
                <TableHead className="text-right">오픈율</TableHead>
                <TableHead className="text-right">클릭률</TableHead>
                <TableHead className="text-right">전환율</TableHead>
                <TableHead className="text-right">매출</TableHead>
                <TableHead>AI 메시지</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.name}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtNum(c.sent)}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.open}%</TableCell>
                  <TableCell className="text-right tabular-nums">{c.ctr}%</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold text-primary">{c.cvr}%</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtKRW(c.revenue)}</TableCell>
                  <TableCell>
                    {c.ai ? (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 gap-1">
                        <Sparkles className="h-3 w-3" /> 사용
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        미사용
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </section>
    </AppLayout>
  );
}
