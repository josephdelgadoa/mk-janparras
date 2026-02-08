-- Enable pgcrypto for UUID generation (if not already enabled)
create extension if not exists "pgcrypto";

-- 1. Create Users Table
create table if not exists public.vv_users (
  id uuid not null default gen_random_uuid(),
  username text not null,
  email text,
  first_name text,
  last_name text,
  avatar_url text default '',
  role text not null check (role in ('admin', 'editor', 'viewer')),
  password_hash text not null,
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  constraint vv_users_pkey primary key (id),
  constraint vv_users_username_key unique (username),
  constraint vv_users_email_key unique (email)
);

-- 2. Indexes
create index if not exists idx_vv_users_username on public.vv_users(username);
create index if not exists idx_vv_users_email on public.vv_users(email);
create index if not exists idx_vv_users_role on public.vv_users(role);

-- 3. Updated At Trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_auth_user_updated on public.vv_users;
create trigger on_auth_user_updated
  before update on public.vv_users
  for each row execute procedure public.handle_updated_at();

-- 4. Secure Login Function (Optional but recommended to keep logic on server)
-- This allows us to fetch the user by username OR email in one go
create or replace function public.get_user_by_identity(identity text)
returns setof public.vv_users
language sql
security definer
stable
as $$
  select * from public.vv_users 
  where (username = identity or email = identity)
  limit 1;
$$;
