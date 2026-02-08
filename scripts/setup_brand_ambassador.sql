-- Enable RLS
-- alter table auth.users enable row level security; -- Often already enabled and requires high privileges

-- Create Storage Bucket for private assets
-- Create Storage Bucket for private assets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vv-private', 'vv-private', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']) -- 10MB limit
on conflict (id) do update set public = false;

-- 1. Create vv_brand_ambassador_assets table
create table if not exists public.vv_brand_ambassador_assets (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default now() not null,
    created_by_user_id uuid references public.vv_users(id),
    reference_image_urls text[] not null,
    location text not null,
    clothing text not null,
    aspect_ratio text not null,
    avatar_image_url text,
    avatar_prompt text,
    consent_confirmed boolean default false,
    status text default 'draft', -- draft | processing | ready | failed
    last_error text
);

-- Fix FK if table already exists (for re-running script)
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'vv_brand_ambassador_assets_created_by_user_id_fkey') then
    alter table public.vv_brand_ambassador_assets drop constraint vv_brand_ambassador_assets_created_by_user_id_fkey;
  end if;
  
  alter table public.vv_brand_ambassador_assets 
  add constraint vv_brand_ambassador_assets_created_by_user_id_fkey 
  foreign key (created_by_user_id) references public.vv_users(id);
end $$;

-- 2. Create vv_brand_ambassador_scripts table
create table if not exists public.vv_brand_ambassador_scripts (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default now() not null,
    asset_id uuid references public.vv_brand_ambassador_assets(id) on delete cascade not null,
    service text not null,
    tone text default 'Warm & Elegant',
    script_text text not null,
    script_word_count int,
    gemini_prompt text,
    status text default 'ready', -- ready | failed
    last_error text
);

-- enable RLS
alter table public.vv_brand_ambassador_assets enable row level security;
alter table public.vv_brand_ambassador_scripts enable row level security;

-- Policies for Assets
-- NOTE: We are using CUSTOM AUTH (vv_users), so Supabase auth.uid() is null.
-- We rely on the application UI protection and allow public RLS for these specific tables.

drop policy if exists "Allow public insert assets" on public.vv_brand_ambassador_assets;
create policy "Allow public insert assets"
on public.vv_brand_ambassador_assets for insert
to public
with check (true);

drop policy if exists "Allow public view assets" on public.vv_brand_ambassador_assets;
create policy "Allow public view assets"
on public.vv_brand_ambassador_assets for select
to public
using (true);

drop policy if exists "Allow public update assets" on public.vv_brand_ambassador_assets;
create policy "Allow public update assets"
on public.vv_brand_ambassador_assets for update
to public
using (true);

drop policy if exists "Allow public delete assets" on public.vv_brand_ambassador_assets;
create policy "Allow public delete assets"
on public.vv_brand_ambassador_assets for delete
to public
using (true);

-- Policies for Scripts
drop policy if exists "Allow public insert scripts" on public.vv_brand_ambassador_scripts;
create policy "Allow public insert scripts"
on public.vv_brand_ambassador_scripts for insert
to public
with check (true);

drop policy if exists "Allow public view scripts" on public.vv_brand_ambassador_scripts;
create policy "Allow public view scripts"
on public.vv_brand_ambassador_scripts for select
to public
using (true);

drop policy if exists "Allow public delete scripts" on public.vv_brand_ambassador_scripts;
create policy "Allow public delete scripts"
on public.vv_brand_ambassador_scripts for delete
to public
using (true);

-- Storage Policies for 'vv-private'
-- Since auth.uid() is null with custom auth, we must allow public uploads to this bucket.
-- Application logic ensures only logged-in users reach this point.
drop policy if exists "Allow public uploads" on storage.objects;
create policy "Allow public uploads"
on storage.objects for insert
to public
with check ( bucket_id = 'vv-private' );

drop policy if exists "Allow public finds" on storage.objects;
create policy "Allow public finds"
on storage.objects for select
to public
using ( bucket_id = 'vv-private' );

drop policy if exists "Allow public deletes" on storage.objects;
create policy "Allow public deletes"
on storage.objects for delete
to public
using ( bucket_id = 'vv-private' );

drop policy if exists "Allow public updates" on storage.objects;
create policy "Allow public updates"
on storage.objects for update
to public
using ( bucket_id = 'vv-private' );

-- Allow public access to read bucket info (often needed by SDK)
drop policy if exists "Allow public bucket reads" on storage.buckets;
create policy "Allow public bucket reads"
on storage.buckets for select
to public
using ( true );
