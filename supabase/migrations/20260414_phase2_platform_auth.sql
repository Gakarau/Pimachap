-- Phase 2 platform authorization and workflow foundation
-- Assumes existing public.labs table and Supabase auth.users

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'platform_role'
      and n.nspname = 'public'
  ) then
    create type public.platform_role as enum (
      'owner',
      'ops',
      'compliance',
      'finance',
      'partner_lab'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'application_status'
      and n.nspname = 'public'
  ) then
    create type public.application_status as enum (
      'draft',
      'submitted',
      'under_review',
      'approved',
      'rejected'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'document_status'
      and n.nspname = 'public'
  ) then
    create type public.document_status as enum (
      'uploaded',
      'under_review',
      'approved',
      'rejected'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'approval_decision'
      and n.nspname = 'public'
  ) then
    create type public.approval_decision as enum (
      'approved',
      'rejected',
      'needs_changes'
    );
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'payout_status'
      and n.nspname = 'public'
  ) then
    create type public.payout_status as enum (
      'draft',
      'submitted',
      'approved',
      'paid',
      'rejected'
    );
  end if;
end $$;

create table if not exists public.staff_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  phone text,
  display_name text,
  primary_role public.platform_role not null,
  roles public.platform_role[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lab_id uuid not null references public.labs(id) on delete cascade,
  role public.platform_role not null default 'partner_lab',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lab_id)
);

create table if not exists public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  trading_name text,
  town text,
  contact_name text,
  contact_phone text not null,
  contact_email text,
  status public.application_status not null default 'draft',
  submitted_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partner_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.partner_applications(id) on delete cascade,
  document_type text not null,
  file_path text not null,
  status public.document_status not null default 'uploaded',
  uploaded_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_decisions (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_id uuid not null,
  decision public.approval_decision not null,
  decided_by uuid references auth.users(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role public.platform_role,
  event_type text not null,
  subject_type text not null,
  subject_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  patient_name text not null,
  patient_phone text not null,
  lab_id uuid not null references public.labs(id) on delete restrict,
  status text not null,
  total_amount_kes integer not null default 0,
  platform_fee_kes integer not null default 0,
  lab_payout_kes integer not null default 0,
  booked_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'mpesa',
  provider_reference text,
  amount_kes integer not null,
  status text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payout_batches (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid not null references public.labs(id) on delete restrict,
  status public.payout_status not null default 'draft',
  total_amount_kes integer not null default 0,
  submitted_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payout_line_items (
  id uuid primary key default gen_random_uuid(),
  payout_batch_id uuid not null references public.payout_batches(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  amount_kes integer not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_accounts_primary_role on public.staff_accounts(primary_role);
create index if not exists idx_partner_memberships_user_id on public.partner_memberships(user_id);
create index if not exists idx_partner_memberships_lab_id on public.partner_memberships(lab_id);
create index if not exists idx_partner_applications_status on public.partner_applications(status);
create index if not exists idx_partner_documents_application_id on public.partner_documents(application_id);
create index if not exists idx_orders_lab_id on public.orders(lab_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payout_batches_lab_id on public.payout_batches(lab_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists staff_accounts_set_updated_at on public.staff_accounts;
create trigger staff_accounts_set_updated_at
before update on public.staff_accounts
for each row execute function public.set_updated_at();

drop trigger if exists partner_memberships_set_updated_at on public.partner_memberships;
create trigger partner_memberships_set_updated_at
before update on public.partner_memberships
for each row execute function public.set_updated_at();

drop trigger if exists partner_applications_set_updated_at on public.partner_applications;
create trigger partner_applications_set_updated_at
before update on public.partner_applications
for each row execute function public.set_updated_at();

drop trigger if exists partner_documents_set_updated_at on public.partner_documents;
create trigger partner_documents_set_updated_at
before update on public.partner_documents
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

drop trigger if exists payout_batches_set_updated_at on public.payout_batches;
create trigger payout_batches_set_updated_at
before update on public.payout_batches
for each row execute function public.set_updated_at();

alter table public.staff_accounts enable row level security;
alter table public.partner_memberships enable row level security;
alter table public.partner_applications enable row level security;
alter table public.partner_documents enable row level security;
alter table public.approval_decisions enable row level security;
alter table public.audit_events enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.payout_batches enable row level security;
alter table public.payout_line_items enable row level security;

-- Minimal self-read policies for authenticated users.
-- Department access should be handled through server-side service-role APIs in this phase.
drop policy if exists "staff_accounts_self_read" on public.staff_accounts;
create policy "staff_accounts_self_read"
on public.staff_accounts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "partner_memberships_self_read" on public.partner_memberships;
create policy "partner_memberships_self_read"
on public.partner_memberships
for select
to authenticated
using (auth.uid() = user_id);
