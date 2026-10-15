-- =====================================================================
--  Quản lý phòng trọ — schema khởi tạo + RLS
--  Chạy trong Supabase Studio > SQL Editor (hoặc supabase db push)
-- =====================================================================

-- ---------- ENUM ----------
create type user_role as enum ('admin', 'tenant');
create type room_status as enum ('vacant', 'occupied');
create type invoice_status as enum ('unpaid', 'paid');

-- ---------- profiles (gắn với auth.users) ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  phone       text,
  role        user_role not null default 'tenant',
  created_at  timestamptz not null default now()
);

-- ---------- rooms ----------
create table public.rooms (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,            -- số/mã phòng: "101"
  name        text,
  price       numeric(12, 0) not null default 0, -- tiền thuê / tháng (VND)
  area        numeric(6, 1),                   -- m2
  status      room_status not null default 'vacant',
  note        text,
  created_at  timestamptz not null default now()
);

-- ---------- tenants (bản ghi người thuê ở 1 phòng) ----------
create table public.tenants (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles (id) on delete set null, -- account đăng nhập (nếu có)
  room_id       uuid references public.rooms (id) on delete set null,
  full_name     text not null,
  phone         text,
  id_number     text,                          -- CCCD
  move_in_date  date,
  move_out_date date,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
create index on public.tenants (room_id);
create index on public.tenants (profile_id);

-- ---------- settings (singleton) ----------
create table public.settings (
  id                 int primary key default 1 check (id = 1),
  electricity_price  numeric(12, 0) not null default 0, -- đ/kWh
  water_price        numeric(12, 0) not null default 0, -- đ/m3
  management_fee     numeric(12, 0) not null default 0, -- đ/tháng
  updated_at         timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ---------- meter_readings (chỉ số điện nước theo kỳ) ----------
create table public.meter_readings (
  id            uuid primary key default gen_random_uuid(),
  room_id       uuid not null references public.rooms (id) on delete cascade,
  period_year   int not null,
  period_month  int not null check (period_month between 1 and 12),
  elec_old      numeric(12, 1) not null default 0,
  elec_new      numeric(12, 1) not null default 0,
  water_old     numeric(12, 1) not null default 0,
  water_new     numeric(12, 1) not null default 0,
  recorded_by   uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now(),
  unique (room_id, period_year, period_month)
);
create index on public.meter_readings (room_id);

-- ---------- invoices (hóa đơn theo kỳ) ----------
create table public.invoices (
  id              uuid primary key default gen_random_uuid(),
  room_id         uuid not null references public.rooms (id) on delete cascade,
  period_year     int not null,
  period_month    int not null check (period_month between 1 and 12),
  room_price      numeric(12, 0) not null default 0,
  elec_amount     numeric(12, 0) not null default 0,
  water_amount    numeric(12, 0) not null default 0,
  management_fee  numeric(12, 0) not null default 0,
  extra_charges   jsonb not null default '[]'::jsonb, -- [{ "name": "...", "amount": 0 }]
  total           numeric(12, 0) not null default 0,
  status          invoice_status not null default 'unpaid',
  paid_at         timestamptz,
  created_at      timestamptz not null default now(),
  unique (room_id, period_year, period_month)
);
create index on public.invoices (room_id);
create index on public.invoices (status);

-- =====================================================================
--  Helper: kiểm tra admin (SECURITY DEFINER để tránh đệ quy RLS)
-- =====================================================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- phòng mà user hiện tại đang thuê (dùng cho RLS tenant)
create or replace function public.my_room_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select room_id from public.tenants
  where profile_id = auth.uid() and active and room_id is not null;
$$;

-- =====================================================================
--  Trigger: tự tạo profile khi có user mới
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'tenant')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
--  RLS
-- =====================================================================
alter table public.profiles       enable row level security;
alter table public.rooms          enable row level security;
alter table public.tenants        enable row level security;
alter table public.settings       enable row level security;
alter table public.meter_readings enable row level security;
alter table public.invoices       enable row level security;

-- profiles: xem của mình hoặc admin xem tất cả; admin toàn quyền
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
create policy profiles_admin_write on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- rooms: admin toàn quyền; tenant chỉ xem phòng mình
create policy rooms_admin_all on public.rooms for all
  using (public.is_admin()) with check (public.is_admin());
create policy rooms_tenant_select on public.rooms for select
  using (id in (select public.my_room_ids()));

-- tenants: admin toàn quyền; tenant xem bản ghi của mình
create policy tenants_admin_all on public.tenants for all
  using (public.is_admin()) with check (public.is_admin());
create policy tenants_self_select on public.tenants for select
  using (profile_id = auth.uid());

-- settings: mọi user đăng nhập đều xem được (để tính tiền); chỉ admin sửa
create policy settings_select on public.settings for select
  to authenticated using (true);
create policy settings_admin_write on public.settings for all
  using (public.is_admin()) with check (public.is_admin());

-- meter_readings: admin toàn quyền; tenant xem + nhập cho phòng mình
create policy meter_admin_all on public.meter_readings for all
  using (public.is_admin()) with check (public.is_admin());
create policy meter_tenant_select on public.meter_readings for select
  using (room_id in (select public.my_room_ids()));
create policy meter_tenant_insert on public.meter_readings for insert
  with check (room_id in (select public.my_room_ids()));
create policy meter_tenant_update on public.meter_readings for update
  using (room_id in (select public.my_room_ids()))
  with check (room_id in (select public.my_room_ids()));

-- invoices: admin toàn quyền; tenant chỉ xem của phòng mình
create policy invoices_admin_all on public.invoices for all
  using (public.is_admin()) with check (public.is_admin());
create policy invoices_tenant_select on public.invoices for select
  using (room_id in (select public.my_room_ids()));
