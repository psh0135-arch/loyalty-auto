import { Link, Navigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Aurora } from "@/components/Aurora";
import { useAuth } from "@/contexts/AuthContext";

export default function Welcome() {
  const { user, loading } = useAuth();

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Aurora colorStops={["#5227FF", "#7cff67", "#5227FF"]} amplitude={1.0} blend={0.5} speed={0.5} />
      </div>

      <div className="relative z-10 w-full max-w-2xl text-center animate-fade-in">
        <div className="inline-flex items-center justify-center gap-2 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-elevated">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">AI CRM Automation</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          환영합니다
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-lg mx-auto font-medium">
          AI 기반 개인화 CRM 자동화 플랫폼
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button asChild size="lg" className="bg-gradient-primary shadow-elevated min-w-[180px]">
            <Link to="/auth">
              시작하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="min-w-[180px] backdrop-blur-sm bg-background/40">
            <Link to="/auth?tab=signin">로그인</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
