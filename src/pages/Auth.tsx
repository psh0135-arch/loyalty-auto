import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const emailSchema = z.string().trim().email({ message: "올바른 이메일 형식이 아닙니다" }).max(255);
const passwordSchema = z
  .string()
  .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다" })
  .max(128, { message: "비밀번호는 128자 이하여야 합니다" });
const displayNameSchema = z.string().trim().min(1, { message: "이름을 입력하세요" }).max(60);

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/";

  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to={from} replace />;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailParse = emailSchema.safeParse(email);
    if (!emailParse.success) return toast.error(emailParse.error.issues[0].message);
    if (!password) return toast.error("비밀번호를 입력하세요");

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailParse.data,
      password,
    });
    setSubmitting(false);
    if (error) {
      toast.error("로그인 실패", { description: error.message });
      return;
    }
    toast.success("로그인되었습니다");
    navigate(from, { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailParse = emailSchema.safeParse(email);
    if (!emailParse.success) return toast.error(emailParse.error.issues[0].message);
    const pwdParse = passwordSchema.safeParse(password);
    if (!pwdParse.success) return toast.error(pwdParse.error.issues[0].message);
    const nameParse = displayNameSchema.safeParse(displayName);
    if (!nameParse.success) return toast.error(nameParse.error.issues[0].message);

    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: emailParse.data,
      password: pwdParse.data,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { display_name: nameParse.data },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error("가입 실패", { description: error.message });
      return;
    }
    toast.success("가입이 완료되었습니다", {
      description: "첫 가입자는 자동으로 관리자 권한을 받습니다.",
    });
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-elevated">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold">AI CRM Automation</span>
        </Link>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle>환영합니다</CardTitle>
            <CardDescription>로그인하거나 새 계정을 만드세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">로그인</TabsTrigger>
                <TabsTrigger value="signup">가입</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="si-email">이메일</Label>
                    <Input
                      id="si-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="si-pwd">비밀번호</Label>
                    <Input
                      id="si-pwd"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-primary shadow-elevated"
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    로그인
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="su-name">표시 이름</Label>
                    <Input
                      id="su-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="홍길동"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">이메일</Label>
                    <Input
                      id="su-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-pwd">비밀번호</Label>
                    <Input
                      id="su-pwd"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="최소 8자"
                    />
                    <p className="text-xs text-muted-foreground">
                      유출된 비밀번호는 사용할 수 없습니다 (HIBP 검사).
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-primary shadow-elevated"
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    계정 만들기
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    💡 첫 번째 가입자가 자동으로 관리자(admin)가 됩니다.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
