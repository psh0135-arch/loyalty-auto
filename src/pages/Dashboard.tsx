import AppLayout from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Send, MousePointerClick, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const recentCampaigns = [
  { name: "장바구니 이탈 복구 - 5월", channel: "푸시", sent: "12,430", ctr: "8.4%", cvr: "3.2%", status: "활성" },
  { name: "VIP 재방문 유도", channel: "이메일", sent: "4,820", ctr: "12.1%", cvr: "5.7%", status: "활성" },
  { name: "신상품 카테고리 알림", channel: "푸시", sent: "21,090", ctr: "6.7%", cvr: "2.4%", status: "완료" },
  { name: "리뷰 요청 캠페인", channel: "SMS", sent: "3,210", ctr: "9.8%", cvr: "4.1%", status: "활성" },
];

export default function Dashboard() {
  return (
    <AppLayout
      title="CRM 자동화 대시보드"
      description="개인화 캠페인 성과와 핵심 KPI를 한눈에 확인하세요"
      action={
        <Button asChild className="bg-gradient-primary shadow-elevated">
          <Link to="/campaigns/new">
            새 캠페인 만들기
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      }
    >
      <section aria-labelledby="kpi-heading" className="mb-6">
        <h2 id="kpi-heading" className="sr-only">캠페인 핵심 성과 지표 (KPI)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="전체 캠페인 수" value="48" delta="+12% 이번 달" trend="up" icon={Megaphone} />
          <StatCard label="발송 메시지 수" value="284,512" delta="+8.3%" trend="up" icon={Send} />
          <StatCard label="평균 클릭률 (CTR)" value="9.2%" delta="+1.4%p" trend="up" icon={MousePointerClick} />
          <StatCard label="전환율 (CVR)" value="3.8%" delta="-0.2%p" trend="down" icon={TrendingUp} />
        </div>
      </section>

      <section aria-labelledby="recent-campaigns-heading">
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle id="recent-campaigns-heading" className="text-base font-semibold">최근 개인화 캠페인 성과</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/campaigns">
              전체 보기 <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentCampaigns.map((c) => (
              <div
                key={c.name}
                className="rounded-lg border border-border p-4 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">채널: {c.channel}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      c.status === "활성"
                        ? "bg-success/10 text-success hover:bg-success/10"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">발송</p>
                    <p className="text-sm font-semibold mt-0.5">{c.sent}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CTR</p>
                    <p className="text-sm font-semibold mt-0.5">{c.ctr}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CVR</p>
                    <p className="text-sm font-semibold mt-0.5 text-primary">{c.cvr}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </section>
    </AppLayout>
  );
}
