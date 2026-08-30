-- Phase 1: class enrollment payments (Midtrans)

alter table public.classes add column if not exists price integer not null default 0 check (price >= 0);

create table if not exists public.class_payments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  participant_id uuid not null references public.profiles(id) on delete cascade,
  order_id text not null unique,
  amount integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'cancelled')),
  snap_token text,
  midtrans_transaction_id text,
  raw_notification jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one 'paid' row per (class, participant); repeated payment attempts may still
-- leave many 'pending'/'expired' rows behind.
create unique index if not exists class_payments_one_paid_per_enrollment
  on public.class_payments (class_id, participant_id) where status = 'paid';

create index if not exists class_payments_participant_idx on public.class_payments(participant_id);
create index if not exists class_payments_class_idx on public.class_payments(class_id);

drop trigger if exists class_payments_set_updated_at on public.class_payments;
create trigger class_payments_set_updated_at before update on public.class_payments for each row execute function public.set_updated_at();

alter table public.class_payments enable row level security;

create policy "read own or staff" on public.class_payments for select to authenticated
using (
  participant_id = auth.uid()
  or public.current_user_role() = 'admin'
  or public.is_class_trainer(class_id)
);

-- No insert/update/delete grant for authenticated. Every write goes through the
-- service-role client (webhook + payment-intent creation), mirroring the
-- `revoke update on profiles` pattern already used for the role column.
revoke insert, update, delete on public.class_payments from authenticated;
