-- In-app notifications: feedback received, worksheet needs review, payment verified.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('feedback_received', 'worksheet_needs_review', 'payment_verified')),
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "read own notifications" on public.notifications for select to authenticated
using (user_id = auth.uid());

create policy "mark own notifications read" on public.notifications for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

-- No insert/delete grant for authenticated — every insert goes through the
-- service-role client from trusted server code, same pattern as class_payments.
revoke insert, delete on public.notifications from authenticated;
