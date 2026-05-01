import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Aurora } from "@/components/Aurora";

const passwordSchema = z
  .string()
  .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  .max(128, { message: "비밀번호는 128자 이하여야 합니다" });

export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase recovery 링크 클릭 시 세션이 자동 설정됨
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parse = passwordSchema.safeParse(password);
    if (!parse.success) return toast.error(parse.error.issues[0].message);
    if (password !== confirm) return toast.error("비밀번호가 일치하지 않습니다");

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: parse.data });
    setSubmitting(false);

    if (error) {
      toast.error("비밀번호 변경 실패", { description: error.message });
      return;
    }
    toast.success("비밀번호가 변경되었습니다");
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Aurora colorStops={["#5227FF", "#7cff67", "#5227FF"]} amplitude={1.0} blend={0.5} speed={0.5} />
      </div>
      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-elevated">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">AI CRM Automation</span>
        </Link>

        <h1 className="sr-only">비밀번호 재설정</h1>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>새 비밀번호 설정</CardTitle>
            <CardDescription>
              {ready
                ? "사용할 새 비밀번호를 입력하세요."
                : "재설정 링크를 확인 중입니다. 이메일의 링크로 접속해 주세요."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="np">새 비밀번호</Label>
                <Input
                  id="np"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="최소 8자"
                  disabled={!ready}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="np2">새 비밀번호 확인</Label>
                <Input
                  id="np2"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={!ready}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || !ready}
                className="w-full bg-gradient-primary shadow-elevated"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                비밀번호 변경
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground">
                  로그인으로 돌아가기
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
