-- SCOPUS READY MVP 0.1
-- Run with `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'participant' check (role in ('participant', 'trainer', 'admin')),
  institution text,
  field_of_study text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  trainer_id uuid references public.profiles(id) on delete set null,
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role text not null check (member_role in ('participant', 'trainer')),
  joined_at timestamptz not null default now(),
  unique (class_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  title text not null,
  field text,
  research_stage text not null default 'idea' check (research_stage in ('idea', 'proposal', 'data_available', 'draft_manuscript', 'journal_targeting', 'review_revision')),
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worksheet_modules (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  sequence integer not null unique,
  weight numeric,
  is_active boolean not null default false
);

create table if not exists public.worksheet_answers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  module_id uuid not null references public.worksheet_modules(id) on delete restrict,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'needs_revision', 'completed')),
  completion_percent integer not null default 0 check (completion_percent between 0 and 100),
  last_saved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, module_id)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  worksheet_answer_id uuid not null references public.worksheet_answers(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete restrict,
  comment text not null,
  status text not null default 'open' check (status in ('open', 'addressed', 'resolved')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  worksheet_answer_id uuid not null references public.worksheet_answers(id) on delete cascade,
  assessor_id uuid not null references public.profiles(id) on delete restrict,
  dimension text not null,
  score numeric not null,
  max_score numeric not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (score >= 0 and max_score > 0 and score <= max_score)
);

create index if not exists projects_owner_idx on public.projects(owner_id);
create index if not exists projects_class_idx on public.projects(class_id);
create index if not exists answers_project_idx on public.worksheet_answers(project_id);
create index if not exists feedback_answer_idx on public.feedback(worksheet_answer_id);
create index if not exists class_members_user_idx on public.class_members(user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at before update on public.classes for each row execute function public.set_updated_at();
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists answers_set_updated_at on public.worksheet_answers;
create trigger answers_set_updated_at before update on public.worksheet_answers for each row execute function public.set_updated_at();
drop trigger if exists feedback_set_updated_at on public.feedback;
create trigger feedback_set_updated_at before update on public.feedback for each row execute function public.set_updated_at();
drop trigger if exists assessments_set_updated_at on public.assessments;
create trigger assessments_set_updated_at before update on public.assessments for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'participant')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns text
language sql
stable
security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_class_trainer(target_class_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.classes c
    where c.id = target_class_id and c.trainer_id = auth.uid()
  ) or exists (
    select 1 from public.class_members cm
    where cm.class_id = target_class_id and cm.user_id = auth.uid() and cm.member_role = 'trainer'
  );
$$;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = target_project_id
      and (
        p.owner_id = auth.uid()
        or public.current_user_role() = 'admin'
        or (p.class_id is not null and public.is_class_trainer(p.class_id))
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.projects enable row level security;
alter table public.worksheet_modules enable row level security;
alter table public.worksheet_answers enable row level security;
alter table public.feedback enable row level security;
alter table public.assessments enable row level security;

create policy "profiles read permitted" on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.current_user_role() = 'admin'
  or exists (
    select 1 from public.class_members mine
    join public.class_members theirs on theirs.class_id = mine.class_id
    where mine.user_id = auth.uid() and mine.member_role = 'trainer' and theirs.user_id = profiles.id
  )
);
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (full_name, institution, field_of_study, updated_at) on public.profiles to authenticated;

create policy "classes read members" on public.classes for select to authenticated
using (public.current_user_role() = 'admin' or trainer_id = auth.uid() or exists (select 1 from public.class_members cm where cm.class_id = classes.id and cm.user_id = auth.uid()));
create policy "classes admin manage" on public.classes for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "members read permitted" on public.class_members for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin' or public.is_class_trainer(class_id));
create policy "members admin manage" on public.class_members for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "projects read permitted" on public.projects for select to authenticated using (public.can_access_project(id));
create policy "participants create own projects" on public.projects for insert to authenticated
with check (
  owner_id = auth.uid()
  and public.current_user_role() = 'participant'
  and (class_id is null or exists (select 1 from public.class_members cm where cm.class_id = projects.class_id and cm.user_id = auth.uid() and cm.member_role = 'participant'))
);
create policy "participants update own projects" on public.projects for update to authenticated
using (owner_id = auth.uid() and public.current_user_role() = 'participant')
with check (
  owner_id = auth.uid()
  and public.current_user_role() = 'participant'
  and (
    class_id is null
    or exists (
      select 1 from public.class_members cm
      where cm.class_id = projects.class_id
        and cm.user_id = auth.uid()
        and cm.member_role = 'participant'
    )
  )
);

create policy "authenticated read modules" on public.worksheet_modules for select to authenticated using (true);
create policy "admin manage modules" on public.worksheet_modules for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "answers read permitted" on public.worksheet_answers for select to authenticated using (public.can_access_project(project_id));
create policy "participants create own answers" on public.worksheet_answers for insert to authenticated
with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));
create policy "participants update own answers" on public.worksheet_answers for update to authenticated
using (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
with check (exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

revoke insert, update, delete on public.worksheet_answers from authenticated;

create policy "feedback read permitted" on public.feedback for select to authenticated using (public.can_access_project(project_id));
create policy "trainers create feedback" on public.feedback for insert to authenticated
with check (trainer_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.class_id is not null and public.is_class_trainer(p.class_id)));
create policy "trainers update own feedback" on public.feedback for update to authenticated
using (trainer_id = auth.uid() or public.current_user_role() = 'admin')
with check (trainer_id = auth.uid() or public.current_user_role() = 'admin');

create or replace function public.feedback_marks_revision()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.worksheet_answers set status = 'needs_revision' where id = new.worksheet_answer_id;
  return new;
end;
$$;

drop trigger if exists feedback_marks_revision_trigger on public.feedback;
create trigger feedback_marks_revision_trigger after insert on public.feedback for each row execute function public.feedback_marks_revision();

create policy "assessments read permitted" on public.assessments for select to authenticated using (public.can_access_project(project_id));
create policy "trainers create assessments" on public.assessments for insert to authenticated
with check (assessor_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.class_id is not null and public.is_class_trainer(p.class_id)));
create policy "trainers update own assessments" on public.assessments for update to authenticated
using (assessor_id = auth.uid() or public.current_user_role() = 'admin')
with check (assessor_id = auth.uid() or public.current_user_role() = 'admin');

create or replace function public.mark_feedback_addressed(target_feedback_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.feedback f
  set status = 'addressed', updated_at = now()
  from public.projects p
  where f.id = target_feedback_id and p.id = f.project_id and p.owner_id = auth.uid() and f.status = 'open';
  if not found then raise exception 'Feedback not found or access denied'; end if;
end;
$$;

create or replace function public.join_class_by_code(target_code text)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare target_class_id uuid;
begin
  if public.current_user_role() <> 'participant' then raise exception 'Only participants can join a class'; end if;
  select id into target_class_id from public.classes where upper(code) = upper(trim(target_code)) and status = 'active';
  if target_class_id is null then raise exception 'Class not found or inactive'; end if;
  insert into public.class_members (class_id, user_id, member_role)
  values (target_class_id, auth.uid(), 'participant')
  on conflict (class_id, user_id) do nothing;
  return target_class_id;
end;
$$;

create or replace function public.save_problem_builder(
  target_project_id uuid,
  target_content jsonb,
  last_known_updated_at timestamptz default null
)
returns public.worksheet_answers
language plpgsql
security definer set search_path = ''
as $$
declare
  target_module_id uuid;
  current_answer public.worksheet_answers;
  result_answer public.worksheet_answers;
  filled_count integer := 0;
  calculated_completion integer;
  calculated_status text;
begin
  if not exists (select 1 from public.projects p where p.id = target_project_id and p.owner_id = auth.uid()) then
    raise exception 'ACCESS_DENIED';
  end if;

  select id into target_module_id from public.worksheet_modules where code = 'problem' and is_active = true;
  if target_module_id is null then raise exception 'PROBLEM_MODULE_INACTIVE'; end if;

  select * into current_answer from public.worksheet_answers where project_id = target_project_id and module_id = target_module_id;
  if current_answer.id is not null and last_known_updated_at is not null and current_answer.updated_at <> last_known_updated_at then
    raise exception 'VERSION_CONFLICT';
  end if;

  filled_count :=
    (case when length(trim(coalesce(target_content ->> 'topic', ''))) > 0 then 1 else 0 end) +
    (case when length(trim(coalesce(target_content ->> 'phenomenon', ''))) > 0 then 1 else 0 end) +
    (case when length(trim(coalesce(target_content ->> 'problem', ''))) > 0 then 1 else 0 end) +
    (case when length(trim(coalesce(target_content ->> 'evidence', ''))) > 0 then 1 else 0 end) +
    (case when length(trim(coalesce(target_content ->> 'importance', ''))) > 0 then 1 else 0 end);
  calculated_completion := filled_count * 20;
  calculated_status := case
    when current_answer.status = 'needs_revision' then 'needs_revision'
    when calculated_completion = 0 then 'not_started'
    else 'in_progress'
  end;

  insert into public.worksheet_answers (project_id, module_id, content, status, completion_percent, last_saved_at)
  values (target_project_id, target_module_id, target_content, calculated_status, calculated_completion, now())
  on conflict (project_id, module_id) do update set
    content = excluded.content,
    status = calculated_status,
    completion_percent = calculated_completion,
    last_saved_at = now()
  returning * into result_answer;
  return result_answer;
end;
$$;

insert into public.worksheet_modules (code, name, sequence, weight, is_active)
values
  ('problem', 'Problem Builder', 1, 8, true),
  ('literature', 'Literature Map', 2, 12, false),
  ('gap', 'Gap Detector', 3, 12, false),
  ('novelty', 'Novelty Builder', 4, 12, false),
  ('blueprint', 'Article Blueprint', 5, 10, false),
  ('method', 'Method Fit', 6, 12, false),
  ('scientific_story', 'Scientific Story', 7, 12, false),
  ('journal_target', 'Journal Target', 8, 8, false),
  ('internal_review', 'Internal Review', 9, 8, false),
  ('journal_adaptation', 'Journal Adaptation', 10, 6, false),
  ('submission', 'Submission Checklist', 11, 6, false),
  ('roadmap', 'Publication Roadmap', 12, 6, false)
on conflict (code) do update set name = excluded.name, sequence = excluded.sequence, weight = excluded.weight;

-- SECURITY DEFINER functions are denied by default and exposed only where the
-- application needs an authenticated RPC. Trigger functions remain private.
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.feedback_marks_revision() from public, anon, authenticated;

revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.is_class_trainer(uuid) from public, anon;
revoke execute on function public.can_access_project(uuid) from public, anon;
revoke execute on function public.join_class_by_code(text) from public, anon;
revoke execute on function public.mark_feedback_addressed(uuid) from public, anon;
revoke execute on function public.save_problem_builder(uuid, jsonb, timestamptz) from public, anon;

grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_class_trainer(uuid) to authenticated;
grant execute on function public.can_access_project(uuid) to authenticated;
grant execute on function public.join_class_by_code(text) to authenticated;
grant execute on function public.mark_feedback_addressed(uuid) to authenticated;
grant execute on function public.save_problem_builder(uuid, jsonb, timestamptz) to authenticated;
