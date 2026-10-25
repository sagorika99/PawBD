-- PawBD schema. Run this whole file in Supabase: SQL Editor -> New query -> Run.

-- 1. Profiles (one row per user)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  city text,
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Posts: give-away, adoption request, rescue alert
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('give_away', 'adopt_request', 'rescue_alert')),
  species text not null check (species in ('cat', 'dog')),
  title text not null check (char_length(title) between 3 and 120),
  description text check (char_length(description) <= 2000),
  age_text text,
  photo_url text,
  latitude double precision,
  longitude double precision,
  division text,
  district text,
  contact text,
  status text not null default 'open' check (status in ('open', 'someone_helping', 'closed')),
  created_by uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists posts_kind_status_idx on public.posts (kind, status, created_at desc);
create index if not exists posts_district_idx on public.posts (district);

-- Rescue alerts auto-expire after 14 days unless renewed
create or replace function public.set_default_expiry()
returns trigger language plpgsql as $$
begin
  if new.kind = 'rescue_alert' and new.expires_at is null then
    new.expires_at := now() + interval '14 days';
  end if;
  return new;
end;
$$;

drop trigger if exists posts_default_expiry on public.posts;
create trigger posts_default_expiry
  before insert on public.posts
  for each row execute function public.set_default_expiry();

-- 3. Reports (flag spam / fake posts)
create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reason text not null,
  reported_by uuid not null references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  unique (post_id, reported_by)
);

-- 4. Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.post_reports enable row level security;

-- profiles: a user can read and edit only their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- posts: everyone can read non-expired posts; only owners can change them
create policy "posts_read_all" on public.posts
  for select using (expires_at is null or expires_at > now());
create policy "posts_insert_own" on public.posts
  for insert to authenticated with check (auth.uid() = created_by);
create policy "posts_update_own" on public.posts
  for update to authenticated using (auth.uid() = created_by);
create policy "posts_delete_own" on public.posts
  for delete to authenticated using (auth.uid() = created_by);

-- Let any signed-in user mark a rescue alert as "someone is helping"
create or replace function public.mark_helping(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.posts
  set status = 'someone_helping'
  where id = p_id and kind = 'rescue_alert' and status = 'open';
$$;
grant execute on function public.mark_helping(uuid) to authenticated;

-- reports: signed-in users can file; nobody reads them from the client
create policy "reports_insert" on public.post_reports
  for insert to authenticated with check (auth.uid() = reported_by);

-- 5. Contact privacy: hide the `contact` column from anonymous visitors
-- (Column-level revoke does nothing when table-level SELECT exists, so revoke the
-- table grant and re-grant every column except `contact`.)
revoke select on public.posts from anon;
grant select (id, kind, species, title, description, age_text, photo_url, latitude,
              longitude, division, district, status, created_by, created_at, expires_at)
  on public.posts to anon;

-- 6. Storage bucket for photos
insert into storage.buckets (id, name, public)
values ('animal-photos', 'animal-photos', true)
on conflict (id) do nothing;

create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'animal-photos');
create policy "photos_upload_signed_in" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'animal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'animal-photos' and (storage.foldername(name))[1] = auth.uid()::text);
