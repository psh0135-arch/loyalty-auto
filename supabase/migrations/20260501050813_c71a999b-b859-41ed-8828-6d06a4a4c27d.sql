-- 1. notifications 테이블
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT는 SECURITY DEFINER 함수/트리거를 통해서만 (정책 미부여 = 차단)

-- 2. Realtime 활성화
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3. 헬퍼: 모든 관리자에게 알림 발송
CREATE OR REPLACE FUNCTION public.notify_admins(
  _title TEXT,
  _message TEXT,
  _type TEXT DEFAULT 'info',
  _link TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT ur.user_id, _title, _message, _type, _link
  FROM public.user_roles ur
  WHERE ur.role = 'admin';
END;
$$;

-- 4. campaigns 테이블이 존재하는지 확인 후, 있다면 트리거 부착
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'campaigns'
  ) THEN
    -- 새 캠페인 생성 알림
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.notify_on_new_campaign()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $body$
      BEGIN
        PERFORM public.notify_admins(
          '새 캠페인이 생성되었습니다',
          COALESCE(NEW.name, '제목 없음') || ' 캠페인이 등록되었습니다.',
          'campaign_created',
          '/campaigns'
        );
        RETURN NEW;
      END;
      $body$;
    $f$;

    DROP TRIGGER IF EXISTS trg_notify_on_new_campaign ON public.campaigns;
    CREATE TRIGGER trg_notify_on_new_campaign
      AFTER INSERT ON public.campaigns
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_on_new_campaign();

    -- 캠페인 상태 변경 알림 (status 컬럼 존재 시)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'campaigns' AND column_name = 'status'
    ) THEN
      EXECUTE $f$
        CREATE OR REPLACE FUNCTION public.notify_on_campaign_status_change()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SECURITY DEFINER
        SET search_path = public
        AS $body$
        BEGIN
          IF NEW.status IS DISTINCT FROM OLD.status THEN
            PERFORM public.notify_admins(
              '캠페인 상태 변경',
              COALESCE(NEW.name, '캠페인') || ' 상태가 ' || NEW.status || '(으)로 변경되었습니다.',
              'campaign_status',
              '/campaigns'
            );
          END IF;
          RETURN NEW;
        END;
        $body$;
      $f$;

      DROP TRIGGER IF EXISTS trg_notify_on_campaign_status_change ON public.campaigns;
      CREATE TRIGGER trg_notify_on_campaign_status_change
        AFTER UPDATE ON public.campaigns
        FOR EACH ROW
        EXECUTE FUNCTION public.notify_on_campaign_status_change();
    END IF;
  END IF;
END $$;

-- 5. events 테이블이 존재하는지 확인 후, 있다면 트리거 부착
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'events'
  ) THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION public.notify_on_new_event()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public
      AS $body$
      BEGIN
        PERFORM public.notify_admins(
          '새 이벤트 트리거 발생',
          '새로운 이벤트가 감지되었습니다.',
          'event_triggered',
          '/events'
        );
        RETURN NEW;
      END;
      $body$;
    $f$;

    DROP TRIGGER IF EXISTS trg_notify_on_new_event ON public.events;
    CREATE TRIGGER trg_notify_on_new_event
      AFTER INSERT ON public.events
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_on_new_event();
  END IF;
END $$;

-- 6. 신규 회원가입 알림: 기존 handle_new_user 함수에 알림 추가
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  is_first_user boolean;
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );

  select not exists (select 1 from public.user_roles) into is_first_user;

  if is_first_user then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
    -- 신규 가입 알림은 첫 사용자(=관리자가 없는 상태)일 때는 의미 없으므로 제외
    perform public.notify_admins(
      '신규 회원가입',
      coalesce(new.email, '새 사용자') || ' 님이 가입했습니다.',
      'user_signup',
      '/admin'
    );
  end if;

  return new;
end;
$function$;