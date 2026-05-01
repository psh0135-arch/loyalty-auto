# AI CRM Automation

고객 행동 트리거 기반의 **개인화 캠페인 자동화** 웹 애플리케이션입니다. 푸시·이메일·SMS 채널로 캠페인을 발송하고, AI로 메시지를 생성하며, 핵심 KPI(CTR/CVR)를 한눈에 측정할 수 있습니다.

- **배포 URL**: https://loyalty-auto.lovable.app
- **언어/지역**: 한국어 (ko-KR)

## 주요 기능

- 🔐 **인증 시스템** — 이메일/비밀번호 가입·로그인, HIBP 약한 비밀번호 검증, 첫 가입자 자동 관리자(admin) 권한 부여
- 📊 **대시보드** — 캠페인 수·발송량·CTR·CVR 등 핵심 KPI와 최근 캠페인 성과 카드
- 📣 **캠페인 관리** — 캠페인 목록, 신규 캠페인 생성, 채널별(푸시/이메일/SMS) 설정
- 🤖 **AI 메시지 생성기** — 관심사·최근 행동·목표·브랜드 톤 기반 개인화 메시지 자동 생성
- 🔔 **이벤트 로그** — 고객 행동 트리거 이벤트 추적
- 📈 **애널리틱스** — 캠페인 성과 차트 및 AI 인사이트
- 👑 **관리자 페이지** — 사용자 역할(`user_roles`) 기반 접근 제어
- 🌐 **SEO 최적화** — H1~H3 시맨틱 구조, 사이트맵 자동 생성(`/sitemap.xml`), Google·Naver 사이트 인증 파일

## 기술 스택

- **프론트엔드**: React 18, Vite 5, TypeScript 5, React Router 6, TanStack Query
- **UI**: Tailwind CSS 3, shadcn/ui (Radix UI), Lucide Icons, Sonner(토스트)
- **3D/비주얼**: OGL 기반 Aurora 배경 효과
- **폼/검증**: React Hook Form, Zod
- **백엔드**: Lovable Cloud (Supabase) — 인증, 데이터베이스, RLS, Edge Functions
- **테스트**: Vitest, Testing Library

## 프로젝트 구조

```
src/
├── pages/              # Welcome, Auth, Dashboard, Campaigns, NewCampaign,
│                       # Events, Analytics, Admin, NotFound
├── components/         # AppLayout, AppSidebar, Aurora, StatCard,
│                       # AIMessageGenerator, MessagePreview, ProtectedRoute, ui/
├── contexts/           # AuthContext (세션·관리자 권한)
├── services/           # aiMessage.ts (AI 메시지 생성 서비스)
├── integrations/       # supabase/ (자동 생성 client·types)
└── index.css           # 디자인 토큰 (HSL 시맨틱 컬러, 그라데이션)

public/                 # robots.txt, sitemap.xml, 사이트 인증 파일
scripts/                # generate-sitemap.ts
supabase/               # config.toml, 마이그레이션
```

## 라우트

| 경로 | 페이지 | 보호 |
|------|--------|------|
| `/` | Welcome (랜딩) | 공개 |
| `/auth` | 로그인 / 회원가입 | 공개 |
| `/dashboard` | 대시보드 | 인증 필요 |
| `/campaigns` | 캠페인 목록 | 인증 필요 |
| `/campaigns/new` | 신규 캠페인 | 인증 필요 |
| `/events` | 이벤트 로그 | 인증 필요 |
| `/analytics` | 애널리틱스 | 인증 필요 |
| `/admin` | 관리자 | admin 권한 필요 |

## 보안 모델

- 역할은 별도 `user_roles` 테이블에 저장 (프로필 테이블에 저장하지 않음)
- `has_role()` SECURITY DEFINER 함수로 RLS 재귀 방지
- 모든 보호 라우트는 `<ProtectedRoute>`에서 세션·역할 검증
- 비밀번호: 최소 8자 + Supabase HIBP 유출 검사

## 개발 시작하기

```sh
npm install
npm run dev          # http://localhost:8080
npm run build        # 프로덕션 빌드 (sitemap.xml 자동 생성)
npm run test         # Vitest 실행
npm run lint
```

## 디자인 시스템

- 모든 색상은 `src/index.css`와 `tailwind.config.ts`의 **HSL 시맨틱 토큰**으로 관리
- 주요 토큰: `--primary`, `--background`, `--foreground`, `--muted`, `--accent`, `--gradient-primary`, `--shadow-elevated`
- H1 헤딩에는 `bg-gradient-primary bg-clip-text text-transparent` 그라데이션 적용
