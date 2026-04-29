-- 1) Roles enum
create type public.app_role as enum ('admin', 'user');

-- 2) Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 3) User roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- 4) Security definer role checker (avoids RLS recursion)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- 5) RLS for profiles
create policy "Users can view their own profile"
on public.profiles for select to authenticated
using (auth.uid() = id);

create policy "Admins can view all profiles"
on public.profiles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (auth.uid() = id);

create policy "Admins can update any profile"
on public.profiles for update to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- 6) RLS for user_roles
create policy "Users can view their own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

create policy "Admins can view all roles"
on public.user_roles for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can grant roles"
on public.user_roles for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

-- Admins can delete roles, but cannot remove their own admin role (lockout protection)
create policy "Admins can revoke roles (not own admin)"
on public.user_roles for delete to authenticated
using (
  public.has_role(auth.uid(), 'admin')
  and not (user_id = auth.uid() and role = 'admin')
);

-- 7) Trigger: on user signup, create profile + assign role
-- First signed-up user becomes admin, all others become user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_first_user boolean;
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );

  -- Determine if this is the first user (excluding the row we just may have triggered for)
  select not exists (select 1 from public.user_roles) into is_first_user;

  if is_first_user then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 8) updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();