# Skema Database — bolaID Football OS

Dokumen arsitektur. Siap dijalankan sebagai migrasi saat Lovable Cloud diaktifkan.
Mengikuti aturan Lovable Cloud: setiap `CREATE TABLE public.*` diikuti `GRANT`,
`ENABLE ROW LEVEL SECURITY`, dan `CREATE POLICY` dalam satu migrasi yang sama.

## Enum

```sql
create type public.player_position as enum ('GK', 'DF', 'MF', 'FW');
create type public.player_status as enum ('aktif', 'cadangan', 'cedera');
create type public.match_venue as enum ('kandang', 'tandang');
create type public.tx_type as enum ('masuk', 'keluar');
create type public.staff_role as enum ('kepala', 'asisten', 'pelatih_kiper', 'fisio', 'manager');
create type public.app_role as enum ('admin', 'pelatih', 'manager', 'pemain');
```

## Tabel

```sql
-- Peran pengguna (terpisah dari profil, mencegah eskalasi privilege)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

-- Klub
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  short text not null default '',
  kota text,
  founded_year int,
  season text not null default '2026/2027',
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clubs to authenticated;
grant all on public.clubs to service_role;
alter table public.clubs enable row level security;
create policy "Owner manages club" on public.clubs
  for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Pemain
create table public.players (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade not null,
  football_id text unique,
  nama text not null,
  posisi player_position not null,
  nomor int,
  tgl_lahir date,
  status player_status not null default 'aktif',
  tinggi int, berat int,
  kaki text check (kaki in ('Kiri','Kanan')),
  foto_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.players to authenticated;
grant all on public.players to service_role;
alter table public.players enable row level security;
create policy "Club staff manage players" on public.players
  for all to authenticated
  using (exists (select 1 from public.clubs c where c.id = club_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from public.clubs c where c.id = club_id and c.owner_id = auth.uid()));

-- Statistik per musim
create table public.player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade not null,
  season text not null,
  apps int not null default 0,
  goals int not null default 0,
  assists int not null default 0,
  minutes int not null default 0,
  unique (player_id, season)
);
grant select, insert, update, delete on public.player_stats to authenticated;
grant all on public.player_stats to service_role;
alter table public.player_stats enable row level security;
create policy "Club staff manage stats" on public.player_stats
  for all to authenticated
  using (exists (select 1 from public.players p
    join public.clubs c on c.id = p.club_id where p.id = player_id and c.owner_id = auth.uid()));

-- Staf
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade not null,
  nama text not null,
  role staff_role not null,
  user_id uuid references auth.users(id) on delete set null
);
grant select, insert, update, delete on public.staff to authenticated;
grant all on public.staff to service_role;
alter table public.staff enable row level security;
create policy "Club staff manage staff" on public.staff
  for all to authenticated
  using (exists (select 1 from public.clubs c where c.id = club_id and c.owner_id = auth.uid()));

-- Sesi latihan
create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade not null,
  title text not null,
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  location text,
  fokus text
);
grant select, insert, update, delete on public.training_sessions to authenticated;
grant all on public.training_sessions to service_role;
alter table public.training_sessions enable row level security;
create policy "Club staff manage training" on public.training_sessions
  for all to authenticated
  using (exists (select 1 from public.clubs c where c.id = club_id and c.owner_id = auth.uid()));

-- Kehadiran latihan
create table public.attendances (
  id uuid primary key default gen_random_uuid(),
  training_id uuid references public.training_sessions(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  status text not null default 'hadir',
  date date not null
);
grant select, insert, update, delete on public.attendances to authenticated;
grant all on public.attendances to service_role;
alter table public.attendances enable row level security;

-- Kompetisi
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  season text not null,
  level text
);
grant select on public.competitions to authenticated;
grant all on public.competitions to service_role;
alter table public.competitions enable row level security;
create policy "Authenticated read competitions" on public.competitions
  for select to authenticated using (true);

-- Pertandingan
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade not null,
  competition_id uuid references public.competitions(id) on delete set null,
  lawan text not null,
  tanggal date not null,
  skor_home int, skor_away int,
  venue match_venue not null default 'kandang'
);
grant select, insert, update, delete on public.matches to authenticated;
grant all on public.matches to service_role;
alter table public.matches enable row level security;
create policy "Club staff manage matches" on public.matches
  for all to authenticated
  using (exists (select 1 from public.clubs c where c.id = club_id and c.owner_id = auth.uid()));

-- Transaksi keuangan
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references public.clubs(id) on delete cascade not null,
  tanggal date not null,
  tipe tx_type not null,
  jumlah numeric(14,2) not null,
  kategori text,
  keterangan text
);
grant select, insert, update, delete on public.transactions to authenticated;
grant all on public.transactions to service_role;
alter table public.transactions enable row level security;
create policy "Club staff manage transactions" on public.transactions
  for all to authenticated
  using (exists (select 1 from public.clubs c where c.id = club_id and c.owner_id = auth.uid()));
```

## Catatan

- Semua policy per-klub di-scope via `clubs.owner_id = auth.uid()`. Saat ada multi-staf,
  ganti pengecekan ke `public.has_role(auth.uid(), 'pelatih')` atau tabel keanggotaan klub.
- `football_id` unik — akan menghubungkan ke modul Football ID (tahap berikutnya).
- Saat Lovable Cloud diaktifkan: jalankan sebagai satu migrasi, lalu ganti `src/lib/demo-data.ts`
  dengan fetcher `createServerFn` + TanStack Query sesuai pola TanStack Start.
