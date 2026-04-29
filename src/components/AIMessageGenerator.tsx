import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Wand2, Clock, Loader2, Eye } from "lucide-react";
import { MessagePreview } from "@/components/MessagePreview";
import { toast } from "sonner";
import {
  BrandTone,
  GeneratedMessage,
  MessageChannel,
  generateAIMessage,
} from "@/services/aiMessage";

interface AIMessageGeneratorProps {
  defaultChannel?: MessageChannel;
  defaultGoal?: string;
}

export function AIMessageGenerator({ defaultChannel = "push", defaultGoal = "" }: AIMessageGeneratorProps) {
  const [interests, setInterests] = useState("");
  const [recentBehavior, setRecentBehavior] = useState("");
  const [goal, setGoal] = useState(defaultGoal);
  const [tone, setTone] = useState<BrandTone>("friendly");
  const [channel, setChannel] = useState<MessageChannel>(defaultChannel);
  const [maxLength, setMaxLength] = useState(120);
  const [forbidden, setForbidden] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedMessage | null>(null);

  const handleGenerate = async () => {
    if (!interests.trim() || !goal.trim()) {
      toast.error("고객 관심사와 캠페인 목적은 필수입니다");
      return;
    }
    setLoading(true);
    try {
      const msg = await generateAIMessage({
        interests,
        recentBehavior,
        goal,
        tone,
        channel,
        maxLength,
        forbiddenWords: forbidden,
      });
      setResult(msg);
      toast.success("AI 메시지가 생성되었습니다");
    } catch (e) {
      toast.error("메시지 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">AI 메시지 생성</CardTitle>
            <CardDescription>고객 데이터를 기반으로 개인화 메시지를 만들어보세요</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interests">고객 관심사</Label>
            <Input
              id="interests"
              placeholder="예: 러닝화, 아웃도어"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="behavior">최근 행동</Label>
            <Input
              id="behavior"
              placeholder="예: 장바구니에 러닝화 추가"
              value={recentBehavior}
              onChange={(e) => setRecentBehavior(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="goal">캠페인 목적</Label>
            <Input
              id="goal"
              placeholder="예: 장바구니 결제 유도"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>브랜드 톤</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as BrandTone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">친근한</SelectItem>
                <SelectItem value="professional">전문적인</SelectItem>
                <SelectItem value="luxury">고급스러운</SelectItem>
                <SelectItem value="urgent">긴급한</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>채널</Label>
            <Select value={channel} onValueChange={(v) => setChannel(v as MessageChannel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="push">푸시</SelectItem>
                <SelectItem value="email">이메일</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxLength">글자 수 제한</Label>
            <Input
              id="maxLength"
              type="number"
              min={20}
              max={2000}
              value={maxLength}
              onChange={(e) => setMaxLength(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="forbidden">금지 표현</Label>
            <Input
              id="forbidden"
              placeholder="쉼표로 구분 (예: 무료, 당첨)"
              value={forbidden}
              onChange={(e) => setForbidden(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gradient-primary shadow-elevated"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 생성 중...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" /> AI 메시지 생성하기
            </>
          )}
        </Button>

        {result && (
          <div className="rounded-xl border border-primary/30 bg-accent/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                생성된 메시지 (수정 가능)
              </p>
              <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>
                <Wand2 className="mr-1 h-3 w-3" /> 다시 생성
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="r-title" className="text-xs text-muted-foreground">제목</Label>
              <Input
                id="r-title"
                value={result.title}
                onChange={(e) => setResult({ ...result, title: e.target.value })}
                className="bg-card font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-body" className="text-xs text-muted-foreground">본문</Label>
              <Textarea
                id="r-body"
                value={result.body}
                onChange={(e) => setResult({ ...result, body: e.target.value })}
                rows={4}
                className="bg-card resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {result.body.length} / {maxLength}자
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="r-cta" className="text-xs text-muted-foreground">CTA 문구</Label>
                <Input
                  id="r-cta"
                  value={result.cta}
                  onChange={(e) => setResult({ ...result, cta: e.target.value })}
                  className="bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="r-time" className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> 추천 발송 타이밍
                </Label>
                <Input
                  id="r-time"
                  value={result.sendTiming}
                  onChange={(e) => setResult({ ...result, sendTiming: e.target.value })}
                  className="bg-card"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  실시간 미리보기 ({channel === "push" ? "푸시" : channel === "email" ? "이메일" : "SMS"})
                </p>
              </div>
              <MessagePreview
                channel={channel}
                title={result.title}
                body={result.body}
                cta={result.cta}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
