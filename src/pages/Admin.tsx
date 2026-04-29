import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { EmptyState } from "@/components/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Users, UserPlus, ShieldOff, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  isAdmin: boolean;
}

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<UserRow | null>(null);

  const fetch = async () => {
    setLoading(true);
    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabase.from("profiles").select("id, email, display_name, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pErr || rErr) {
      toast.error("사용자 목록을 불러오지 못했습니다");
      setLoading(false);
      return;
    }
    const adminSet = new Set((roles || []).filter((r) => r.role === "admin").map((r) => r.user_id));
    setUsers(
      (profiles || []).map((p) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        created_at: p.created_at,
        isAdmin: adminSet.has(p.id),
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  const grantAdmin = async (u: UserRow) => {
    setPendingId(u.id);
    const { error } = await supabase.from("user_roles").insert({ user_id: u.id, role: "admin" });
    setPendingId(null);
    if (error) {
      toast.error("권한 부여 실패", { description: error.message });
      return;
    }
    toast.success(`${u.email}에게 관리자 권한을 부여했습니다`);
    fetch();
  };

  const revokeAdmin = async (u: UserRow) => {
    setPendingId(u.id);
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", u.id)
      .eq("role", "admin");
    setPendingId(null);
    if (error) {
      toast.error("권한 회수 실패", { description: error.message });
      return;
    }
    toast.success(`${u.email}의 관리자 권한을 회수했습니다`);
    fetch();
  };

  const adminCount = users.filter((u) => u.isAdmin).length;

  return (
    <AppLayout title="관리자" description="사용자와 권한을 관리하세요">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="전체 사용자" value={String(users.length)} icon={Users} />
        <StatCard label="관리자" value={String(adminCount)} icon={Shield} />
        <StatCard
          label="이번 주 신규"
          value={String(
            users.filter((u) => Date.now() - new Date(u.created_at).getTime() < 7 * 24 * 3600 * 1000).length,
          )}
          icon={UserPlus}
        />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">사용자 관리</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="아직 가입한 사용자가 없습니다"
              description="사용자가 가입하면 이곳에 표시됩니다."
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead className="hidden md:table-cell">가입일</TableHead>
                    <TableHead className="text-right">액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.display_name || "—"}
                          {isSelf && (
                            <Badge variant="secondary" className="ml-2 text-[10px] bg-accent text-accent-foreground">
                              나
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                        <TableCell>
                          {u.isAdmin ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 gap-1">
                              <Shield className="h-3 w-3" /> 관리자
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-muted text-muted-foreground">
                              일반 사용자
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                          {new Date(u.created_at).toLocaleDateString("ko-KR")}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.isAdmin ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isSelf || pendingId === u.id}
                              onClick={() => setConfirmRevoke(u)}
                              title={isSelf ? "자기 자신의 관리자 권한은 회수할 수 없습니다" : ""}
                            >
                              <ShieldOff className="mr-1 h-3.5 w-3.5" /> 권한 회수
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={pendingId === u.id}
                              onClick={() => grantAdmin(u)}
                            >
                              <ShieldCheck className="mr-1 h-3.5 w-3.5" /> 관리자 지정
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmRevoke} onOpenChange={(o) => !o && setConfirmRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>관리자 권한 회수</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRevoke?.email}의 관리자 권한을 회수합니다. 이 사용자는 더 이상 관리자 페이지에 접근할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRevoke) revokeAdmin(confirmRevoke);
                setConfirmRevoke(null);
              }}
            >
              회수
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
