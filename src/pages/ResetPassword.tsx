import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Mail, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Aurora } from "@/components/Aurora";

const emailSchema = z.string().trim().email({ message: "올바른 이메일 형식이 아닙니다" }).max(255);
const passwordSchema = z
  .string()
  .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  .max(128, { message: "비밀번호는 128자 이하여야 합니다" });

type Mode = "checking" | "request" | "update" | "error";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("checking");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // 새 비밀번호 변경 폼 상태
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 재설정 메일 요청 폼 상태
  const [reqEmail, setReqEmail] = useState("");
  const [reqSubmitting, setReqSubmitting] = useState(false);

  useEffect(() => {
    // URL hash나 query에 에러가 있는지 확인 (만료/잘못된 토큰 등)
    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(window.location.search);

    const errCode =
      hashParams.get("error_code") ||
      hashParams.get("error") ||
      queryParams.get("error_code") ||
      queryParams.get("error");
    const errDesc =
      hashParams.get("error_description") || queryParams.get("error_description");

    if (errCode) {
      setMode("error");
      setErrorMsg(
        errDesc?.replace(/\+/g, " ") ||
          "재설정 링크가 만료되었거나 유효하지 않습니다. 다시 요청해 주세요.",
      );
      return;
    }

    let resolved = false;
    const resolve = (next: Mode) => {
      if (resolved) return;
      resolved = true;
      setMode(next);
    };

    // PASSWORD_RECOVERY 이벤트를 우선 청취
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        resolve("update");
      }
    });

    // 기존 세션 확인 (이메일 링크가 이미 처리된 경우)
    supabase.auth.getSession().then(({ data: { session } }) => {
      // recovery 링크가 있는 경우 hash에 access_token이 들어옴
      const hasRecoveryToken =
        hashParams.get("type") === "recovery" || !!hashParams.get("access_token");

      if (session && hasRecoveryToken) {
        resolve("update");
      } else if (session) {
        // 로그인된 상태에서 비밀번호 변경 페이지로 진입 → 변경 모드 허용
        resolve("update");
      } else {
        // 토큰도 세션도 없음 → 재설정 메일 요청 모드
        // (잠깐 기다려서 onAuthStateChange가 PASSWORD_RECOVERY를 발화할 기회를 줌)
        setTimeout(() => resolve("request"), 600);
      }
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
      const isWeak =
        (error as any)?.code === "weak_password" || /weak|pwned/i.test(error.message);
      toast.error("비밀번호 변경 실패", {
        description: isWeak
          ? "유출된 약한 비밀번호입니다. 더 안전한 비밀번호를 사용하세요."
          : error.message,
      });
      return;
    }
    toast.success("비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해 주세요.");
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const parse = emailSchema.safeParse(reqEmail);
    if (!parse.success) return toast.error(parse.error.issues[0].message);

    setReqSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parse.data, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setReqSubmitting(false);
    if (error) {
      toast.error("재설정 메일 발송 실패", { description: error.message });
      return;
    }
    toast.success("재설정 링크를 이메일로 보냈습니다", {
      description: "메일함을 확인하세요. (스팸함 포함)",
    });
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

        {mode === "checking" && (
          <Card className="shadow-elevated">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        )}

        {mode === "update" && (
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" /> 새 비밀번호 설정
              </CardTitle>
              <CardDescription>사용할 새 비밀번호를 입력하세요.</CardDescription>
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
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
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
        )}

        {mode === "request" && (
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> 비밀번호 재설정 요청
              </CardTitle>
              <CardDescription>
                가입한 이메일을 입력하면 재설정 링크를 보내드립니다. 메일의 링크를 클릭하면 새
                비밀번호를 설정할 수 있어요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="req-email">이메일</Label>
                  <Input
                    id="req-email"
                    type="email"
                    autoComplete="email"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={reqSubmitting}
                  className="w-full bg-gradient-primary shadow-elevated"
                >
                  {reqSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  재설정 링크 보내기
                </Button>
                <div className="text-center">
                  <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground">
                    로그인으로 돌아가기
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {mode === "error" && (
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle>링크가 유효하지 않습니다</CardTitle>
              <CardDescription>{errorMsg}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => {
                  setMode("request");
                  setErrorMsg("");
                  // hash 제거
                  window.history.replaceState(null, "", window.location.pathname);
                }}
                className="w-full bg-gradient-primary shadow-elevated"
              >
                재설정 메일 다시 받기
              </Button>
              <div className="text-center">
                <Link to="/auth" className="text-xs text-muted-foreground hover:text-foreground">
                  로그인으로 돌아가기
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
