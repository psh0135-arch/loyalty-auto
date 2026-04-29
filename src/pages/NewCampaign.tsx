import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare, ShoppingCart, MoonStar, Eye, Target, Repeat, Star, Sparkles, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AIMessageGenerator } from "@/components/AIMessageGenerator";
import { MessageChannel } from "@/services/aiMessage";

interface OptionCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function OptionCard({ icon: Icon, label, description, active, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border p-4 transition-all hover:shadow-sm",
        active
          ? "border-primary bg-accent shadow-elevated"
          : "border-border bg-card hover:border-primary/40"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg mb-3",
          active ? "bg-gradient-primary text-primary-foreground" : "bg-secondary text-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-medium text-sm">{label}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </button>
  );
}

const triggers = [
  { id: "cart", label: "장바구니 이탈", description: "30분 이상 장바구니 미결제 고객", icon: ShoppingCart },
  { id: "inactive", label: "30일 미접속", description: "최근 30일간 앱 접속 이력 없음", icon: MoonStar },
  { id: "category", label: "특정 카테고리 반복 조회", description: "동일 카테고리 3회 이상 조회", icon: Eye },
];

const channels = [
  { id: "push", label: "푸시 알림", description: "앱 사용자에게 즉시 알림", icon: Bell },
  { id: "email", label: "이메일", description: "리치 컨텐츠 메시지", icon: Mail },
  { id: "sms", label: "SMS", description: "광범위 도달, 짧은 메시지", icon: MessageSquare },
];

const goals = [
  { id: "purchase", label: "구매 전환", description: "결제 완료 유도", icon: Target },
  { id: "revisit", label: "재방문", description: "앱/웹 재방문 유도", icon: Repeat },
  { id: "review", label: "리뷰 요청", description: "구매 후기 작성", icon: Star },
];

export default function NewCampaign() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<string>("");
  const [channel, setChannel] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  // Trigger-specific conditions
  const [cartHours, setCartHours] = useState("3");
  const [categoryName, setCategoryName] = useState("");
  const [categoryViews, setCategoryViews] = useState("3");
  const [inactiveDays, setInactiveDays] = useState("30");
  const [purchaseDays, setPurchaseDays] = useState("7");

  const handleSave = (asDraft = false) => {
    if (!asDraft && (!name || !trigger || !channel || !goal)) {
      toast.error("모든 항목을 입력해주세요", {
        description: "캠페인명, 트리거, 채널, 목표는 필수입니다.",
      });
      return;
    }
    if (asDraft && !name) {
      toast.error("캠페인명을 입력해주세요");
      return;
    }
    toast.success(asDraft ? "초안으로 저장되었습니다" : "캠페인이 저장되었습니다", {
      description: `${name}${asDraft ? " (초안)" : ""} 캠페인이 캠페인 목록에 추가되었습니다.`,
      action: { label: "성과 보기", onClick: () => navigate("/analytics") },
    });
    setTimeout(() => navigate("/campaigns"), 600);
  };

  const steps = [
    { label: "기본 정보", done: !!name },
    { label: "트리거", done: !!trigger },
    { label: "채널", done: !!channel },
    { label: "목표", done: !!goal },
  ];
  const completed = steps.filter((s) => s.done).length;

  return (
    <AppLayout
      title="개인화 캠페인 생성"
      description="고객 행동 트리거에 맞춰 AI가 개인화 메시지를 자동 생성합니다"
    >
      <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                s.done
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border",
              )}
            >
              {i + 1}
            </div>
            <span className={cn("font-medium", s.done ? "text-foreground" : "text-muted-foreground")}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="w-6 h-px bg-border" />}
          </div>
        ))}
        <span className="ml-auto text-muted-foreground">
          {completed}/{steps.length} 완료
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">기본 정보</CardTitle>
              <CardDescription>캠페인을 식별할 이름을 입력하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="name">캠페인명</Label>
                <Input
                  id="name"
                  placeholder="예: 장바구니 이탈 복구 - 5월"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">트리거 선택</CardTitle>
              <CardDescription>캠페인이 발동될 고객 행동 조건</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {triggers.map((t) => (
                  <OptionCard
                    key={t.id}
                    icon={t.icon}
                    label={t.label}
                    description={t.description}
                    active={trigger === t.id}
                    onClick={() => setTrigger(t.id)}
                  />
                ))}
              </div>

              {trigger && (
                <div className="rounded-lg border border-border bg-secondary/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                    상세 조건
                  </p>
                  {trigger === "cart" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cartHours">이탈 후 발송 시간</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="cartHours"
                            type="number"
                            min={1}
                            value={cartHours}
                            onChange={(e) => setCartHours(e.target.value)}
                            className="bg-card"
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">시간 후</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchaseDays">최근 구매 제외 기간</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="purchaseDays"
                            type="number"
                            min={0}
                            value={purchaseDays}
                            onChange={(e) => setPurchaseDays(e.target.value)}
                            className="bg-card"
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">일 이내 구매자 제외</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {trigger === "inactive" && (
                    <div className="space-y-2 max-w-sm">
                      <Label htmlFor="inactiveDays">미접속 일수</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="inactiveDays"
                          type="number"
                          min={1}
                          value={inactiveDays}
                          onChange={(e) => setInactiveDays(e.target.value)}
                          className="bg-card"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">일 이상 미접속</span>
                      </div>
                    </div>
                  )}
                  {trigger === "category" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="categoryName">대상 카테고리</Label>
                        <Input
                          id="categoryName"
                          placeholder="예: 뷰티"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          className="bg-card"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoryViews">조회 횟수</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="categoryViews"
                            type="number"
                            min={1}
                            value={categoryViews}
                            onChange={(e) => setCategoryViews(e.target.value)}
                            className="bg-card"
                          />
                          <span className="text-sm text-muted-foreground whitespace-nowrap">회 이상 (7일 내)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">채널 선택</CardTitle>
              <CardDescription>메시지를 발송할 채널을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {channels.map((c) => (
                  <OptionCard
                    key={c.id}
                    icon={c.icon}
                    label={c.label}
                    description={c.description}
                    active={channel === c.id}
                    onClick={() => setChannel(c.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">목표 선택</CardTitle>
              <CardDescription>AI가 메시지를 최적화할 목표</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {goals.map((g) => (
                  <OptionCard
                    key={g.id}
                    icon={g.icon}
                    label={g.label}
                    description={g.description}
                    active={goal === g.id}
                    onClick={() => setGoal(g.id)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <AIMessageGenerator
            defaultChannel={(channel as MessageChannel) || "push"}
            defaultGoal={goals.find((g) => g.id === goal)?.label || ""}
          />
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-card sticky top-24">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <CardTitle className="text-base">캠페인 요약</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">캠페인명</p>
                <p className="text-sm font-medium">{name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">트리거</p>
                <p className="text-sm font-medium">
                  {triggers.find((t) => t.id === trigger)?.label || "—"}
                </p>
                {trigger === "cart" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    이탈 후 {cartHours}시간 뒤 발송 · 최근 {purchaseDays}일 내 구매자 제외
                  </p>
                )}
                {trigger === "inactive" && (
                  <p className="text-xs text-muted-foreground mt-1">{inactiveDays}일 이상 미접속</p>
                )}
                {trigger === "category" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {categoryName || "카테고리"} {categoryViews}회 이상 조회
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">채널</p>
                <p className="text-sm font-medium">
                  {channels.find((c) => c.id === channel)?.label || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">목표</p>
                <p className="text-sm font-medium">
                  {goals.find((g) => g.id === goal)?.label || "—"}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button
                  onClick={() => handleSave(false)}
                  className="bg-gradient-primary shadow-elevated"
                >
                  캠페인 저장 및 활성화
                </Button>
                <Button variant="outline" onClick={() => handleSave(true)}>
                  초안으로 저장
                </Button>
                <Button variant="ghost" onClick={() => navigate("/campaigns")}>
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
