import { Bell, Mail, MessageSquare } from "lucide-react";
import { MessageChannel } from "@/services/aiMessage";
import { cn } from "@/lib/utils";

interface MessagePreviewProps {
  channel: MessageChannel;
  title: string;
  body: string;
  cta?: string;
  brandName?: string;
}

export function MessagePreview({
  channel,
  title,
  body,
  cta,
  brandName = "AI CRM",
}: MessagePreviewProps) {
  if (channel === "push") {
    return (
      <div className="rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 p-4 shadow-elevated">
        <div className="rounded-xl bg-white/95 backdrop-blur p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary">
              <Bell className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-900 truncate">{brandName}</p>
                <span className="text-[10px] text-slate-500 shrink-0">방금</span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mt-0.5 line-clamp-1">
                {title || "제목을 입력하세요"}
              </p>
              <p className="text-xs text-slate-700 mt-1 line-clamp-2 leading-relaxed">
                {body || "본문 미리보기"}
              </p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">푸시 알림 미리보기</p>
      </div>
    );
  }

  if (channel === "email") {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary/50">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">받은 편지함</span>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold">
              {brandName.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{brandName}</p>
              <p className="text-xs text-muted-foreground">no-reply@aicrm.app</p>
            </div>
          </div>
          <h3 className="text-base font-semibold mb-2">{title || "제목을 입력하세요"}</h3>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
            {body || "본문 미리보기"}
          </p>
          {cta && (
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground text-sm font-medium px-5 py-2.5 shadow-elevated"
            >
              {cta}
            </button>
          )}
        </div>
      </div>
    );
  }

  // SMS
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <div className="flex items-start gap-2 mb-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] text-slate-500 mb-1">{brandName}</p>
          <div
            className={cn(
              "inline-block max-w-full rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 shadow-sm",
            )}
          >
            {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
            <p className="text-sm text-slate-800 whitespace-pre-line break-words">
              {body || "본문 미리보기"}
            </p>
            {cta && <p className="text-xs text-primary mt-1.5 font-medium">▶ {cta}</p>}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">방금 · SMS</p>
        </div>
      </div>
    </div>
  );
}
