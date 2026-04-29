import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Plus, Bell, Mail, MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const channelMeta: Record<string, { icon: typeof Bell; label: string }> = {
  push: { icon: Bell, label: "푸시 알림" },
  email: { icon: Mail, label: "이메일" },
  sms: { icon: MessageSquare, label: "SMS" },
};

const statusMeta: Record<string, string> = {
  active: "bg-success/10 text-success hover:bg-success/10",
  draft: "bg-muted text-muted-foreground hover:bg-muted",
  done: "bg-accent text-accent-foreground hover:bg-accent",
};

const campaigns = [
  { name: "장바구니 이탈 복구 - 5월", trigger: "장바구니 이탈", channel: "push", status: "active", statusLabel: "활성", date: "2026-04-22" },
  { name: "VIP 재방문 유도", trigger: "30일 미접속", channel: "email", status: "active", statusLabel: "활성", date: "2026-04-18" },
  { name: "신상품 카테고리 알림", trigger: "특정 카테고리 반복 조회", channel: "push", status: "done", statusLabel: "완료", date: "2026-04-12" },
  { name: "리뷰 요청 캠페인", trigger: "장바구니 이탈", channel: "sms", status: "active", statusLabel: "활성", date: "2026-04-09" },
  { name: "휴면 고객 깨우기", trigger: "30일 미접속", channel: "email", status: "draft", statusLabel: "초안", date: "2026-04-05" },
  { name: "뷰티 카테고리 추천", trigger: "특정 카테고리 반복 조회", channel: "push", status: "done", statusLabel: "완료", date: "2026-03-30" },
];

export default function Campaigns() {
  return (
    <AppLayout
      title="캠페인"
      description="자동화 캠페인을 관리하고 성과를 확인하세요"
      action={
        <Button asChild className="bg-gradient-primary shadow-elevated">
          <Link to="/campaigns/new">
            <Plus className="mr-1 h-4 w-4" /> 새 캠페인
          </Link>
        </Button>
      }
    >
      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead>캠페인명</TableHead>
                  <TableHead>트리거</TableHead>
                  <TableHead>채널</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>생성일</TableHead>
                  <TableHead className="text-right">성과</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => {
                  const ch = channelMeta[c.channel];
                  const Icon = ch.icon;
                  return (
                    <TableRow key={c.name} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.trigger}</TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-1.5 text-sm">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          {ch.label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusMeta[c.status]}>
                          {c.statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="mr-1 h-3.5 w-3.5" /> 성과 보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
