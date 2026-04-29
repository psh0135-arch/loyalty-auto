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

  const handleSave = () => {
    if (!name || !trigger || !channel || !goal) {
      toast.error("모든 항목을 입력해주세요");
      return;
    }
    toast.success("캠페인이 저장되었습니다", {
      description: `${name} 캠페인이 생성되었습니다.`,
    });
    setTimeout(() => navigate("/campaigns"), 600);
  };

  return (
    <AppLayout
      title="캠페인 생성"
      description="AI가 고객 행동에 맞는 개인화 메시지를 생성합니다"
    >
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
            <CardContent>
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
                <Button onClick={handleSave} className="bg-gradient-primary shadow-elevated">
                  저장
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
