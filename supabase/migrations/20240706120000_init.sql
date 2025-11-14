-- Enable useful extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enumerations
create type public.user_role as enum ('SUPER_ADMIN', 'ADMIN', 'MANAGEMENT', 'SERVICE_WORKER');

create type public.complaint_status as enum (
  'NEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'MANAGEMENT_RESOLVED',
  'PENDING_TENANT_CONFIRMATION',
  'REOPENED',
  'REJECTED',
  'CLOSED'
);

create type public.sender_type as enum ('TENANT', 'STAFF', 'SYSTEM');

-- Buildings / structure
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  floor_number int not null,
  created_at timestamptz not null default now(),
  unique (building_id, floor_number)
);

create table public.units (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  floor_id uuid references public.floors(id) on delete set null,
  unit_number text not null,
  tenant_name text,
  tenant_contact jsonb,
  public_id uuid not null unique default gen_random_uuid(),
  is_blocked boolean not null default false,
  blocked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index units_building_idx on public.units(building_id, unit_number);
create index units_public_id_idx on public.units(public_id);

create table public.complaint_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category_group text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index complaint_categories_name_lower_idx on public.complaint_categories (lower(name));

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text,
  email text not null,
  role public.user_role not null,
  is_active boolean not null default true,
  service_worker_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id)
);

create index users_email_idx on public.users(lower(email));

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  building_id uuid not null references public.buildings(id) on delete cascade,
  status public.complaint_status not null default 'NEW',
  tenant_name text,
  tenant_contact jsonb,
  description text,
  attachments jsonb,
  rejected_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  is_tenant_notified boolean not null default false
);

create index complaints_status_idx on public.complaints(status);
create index complaints_building_idx on public.complaints(building_id);
create index complaints_unit_idx on public.complaints(unit_id);
create unique index unique_active_complaint_per_unit on public.complaints(unit_id)
  where status not in ('REJECTED', 'CLOSED');

create table public.complaint_category_links (
  complaint_id uuid references public.complaints(id) on delete cascade,
  category_id uuid references public.complaint_categories(id) on delete restrict,
  primary key (complaint_id, category_id)
);

create table public.complaint_assignments (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  worker_id uuid not null references public.users(id) on delete cascade,
  assigned_by uuid references public.users(id),
  assigned_at timestamptz not null default now(),
  unique (complaint_id, worker_id)
);

create table public.complaint_status_logs (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  old_status public.complaint_status,
  new_status public.complaint_status not null,
  changed_by uuid references public.users(id),
  changed_at timestamptz not null default now(),
  note text
);

create index complaint_status_logs_complaint_idx on public.complaint_status_logs(complaint_id, changed_at);

create table public.complaint_messages (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references public.complaints(id) on delete cascade,
  sender_id uuid references public.users(id),
  sender_type public.sender_type not null,
  message_text text not null,
  created_at timestamptz not null default now()
);

create index complaint_messages_complaint_idx on public.complaint_messages(complaint_id, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  payload jsonb not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, is_read);

-- Helper functions for RLS
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
as $$
  select coalesce((auth.jwt() ->> 'role')::public.user_role, 'SERVICE_WORKER');
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select current_user_role() in ('SUPER_ADMIN', 'ADMIN', 'MANAGEMENT');
$$;

create or replace function public.is_service_worker()
returns boolean
language sql
stable
as $$
  select current_user_role() = 'SERVICE_WORKER';
$$;

create or replace function public.is_worker_assigned(p_complaint_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.complaint_assignments ca
    join public.users u on u.id = ca.worker_id
    where ca.complaint_id = p_complaint_id
      and u.auth_user_id = auth.uid()
  );
$$;

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger buildings_set_updated_at before update on public.buildings
  for each row execute function public.set_updated_at();

create trigger units_set_updated_at before update on public.units
  for each row execute function public.set_updated_at();

create trigger users_set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

create trigger complaints_set_updated_at before update on public.complaints
  for each row execute function public.set_updated_at();

-- Views for simplified querying
create or replace view public.complaint_overview as
select
  c.id,
  c.status,
  c.description,
  c.created_at,
  c.updated_at,
  b.name as building_name,
  u.unit_number,
  u.public_id,
  coalesce(array_remove(array_agg(distinct cc.name) filter (where cc.name is not null), null), '{}') as categories,
  coalesce(array_remove(array_agg(distinct sw.full_name) filter (where sw.full_name is not null), null), '{}') as worker_names,
  extract(epoch from (now() - c.created_at))::bigint as aging_seconds
from public.complaints c
join public.units u on u.id = c.unit_id
join public.buildings b on b.id = c.building_id
left join public.complaint_category_links ccl on ccl.complaint_id = c.id
left join public.complaint_categories cc on cc.id = ccl.category_id
left join public.complaint_assignments ca on ca.complaint_id = c.id
left join public.users sw on sw.id = ca.worker_id
group by c.id, b.name, u.unit_number, u.public_id;

create or replace view public.worker_dashboard_view as
select
  ca.worker_id,
  c.id as complaint_id,
  c.status,
  c.created_at,
  b.name as building_name,
  u.unit_number,
  coalesce(array_remove(array_agg(distinct cc.name) filter (where cc.name is not null), null), '{}') as categories
from public.complaint_assignments ca
join public.complaints c on c.id = ca.complaint_id
join public.units u on u.id = c.unit_id
join public.buildings b on b.id = c.building_id
left join public.complaint_category_links ccl on ccl.complaint_id = c.id
left join public.complaint_categories cc on cc.id = ccl.category_id
group by ca.worker_id, c.id, c.status, c.created_at, b.name, u.unit_number;

-- Aggregate metrics
create or replace function public.admin_dashboard_metrics()
returns json
language sql
stable
as $$
  with complaints_last_30 as (
    select *
    from public.complaints
    where created_at >= now() - interval '30 days'
  )
  select json_build_object(
    'newComplaints', (select count(*) from public.complaints where status = 'NEW'),
    'averageResolutionHours', (
      select coalesce(avg(extract(epoch from (resolved_at - created_at))) / 3600, 0)
      from public.complaints
      where resolved_at is not null
    ),
    'blockedUnits', (select count(*) from public.units where is_blocked),
    'reopenRate', (
      select case when count(*) = 0 then 0
        else sum(case when status = 'REOPENED' then 1 else 0 end)::numeric / count(*)
      end
      from complaints_last_30
    )
  );
$$;

create or replace function public.get_worker_dashboard(p_worker_id uuid)
returns setof public.worker_dashboard_view
language sql
stable
as $$
  select * from public.worker_dashboard_view where worker_id = p_worker_id;
$$;

-- Enable RLS
alter table public.buildings enable row level security;
alter table public.floors enable row level security;
alter table public.units enable row level security;
alter table public.complaint_categories enable row level security;
alter table public.complaints enable row level security;
alter table public.complaint_category_links enable row level security;
alter table public.users enable row level security;
alter table public.complaint_assignments enable row level security;
alter table public.complaint_status_logs enable row level security;
alter table public.complaint_messages enable row level security;
alter table public.notifications enable row level security;

-- Policies
create policy "staff manage buildings" on public.buildings
  for all using (public.is_staff()) with check (public.is_staff());

create policy "staff manage floors" on public.floors
  for all using (public.is_staff()) with check (public.is_staff());

create policy "staff manage units" on public.units
  for all using (public.is_staff()) with check (public.is_staff());

create policy "staff manage categories" on public.complaint_categories
  for all using (public.is_staff()) with check (public.is_staff());

create policy "staff manage complaints" on public.complaints
  using (public.is_staff()) with check (public.is_staff());

create policy "workers read assigned complaints" on public.complaints
  for select using (public.is_worker_assigned(id));

create policy "workers update assigned complaints" on public.complaints
  for update using (public.is_worker_assigned(id)) with check (public.is_worker_assigned(id));

create policy "staff manage complaint categories link" on public.complaint_category_links
  for all using (public.is_staff()) with check (public.is_staff());

create policy "staff manage complaint assignments" on public.complaint_assignments
  for all using (public.is_staff()) with check (public.is_staff());

create policy "workers view assignments" on public.complaint_assignments
  for select using (public.is_worker_assigned(complaint_id));

create policy "staff manage status logs" on public.complaint_status_logs
  for all using (public.is_staff()) with check (public.is_staff());

create policy "workers read status logs" on public.complaint_status_logs
  for select using (public.is_worker_assigned(complaint_id));

create policy "staff manage messages" on public.complaint_messages
  for all using (public.is_staff()) with check (public.is_staff());

create policy "workers read messages" on public.complaint_messages
  for select using (public.is_worker_assigned(complaint_id));

create policy "staff manage users" on public.users
  for all using (public.is_staff()) with check (public.is_staff());

create policy "users read themselves" on public.users
  for select using (auth.uid() = auth_user_id);

create policy "notifications owner access" on public.notifications
  using (
    exists (
      select 1 from public.users u where u.id = user_id and u.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.users u where u.id = user_id and u.auth_user_id = auth.uid()
    )
  );
