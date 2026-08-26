-- Sprint 8: persistent journal targeting and action planning. Reports are
-- derived at read time from these tables and the existing project domain.

create table if not exists public.journal_targets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  journal_name text not null,
  publisher text,
  website_url text,
  quartile text not null default 'unknown'
    check (quartile in ('q1', 'q2', 'q3', 'q4', 'unranked', 'unknown')),
  scope_match integer not null default 0 check (scope_match between 0 and 5),
  article_type_match integer not null default 0 check (article_type_match between 0 and 5),
  audience_match integer not null default 0 check (audience_match between 0 and 5),
  requirements_match integer not null default 0 check (requirements_match between 0 and 5),
  status text not null default 'candidate'
    check (status in ('candidate', 'primary', 'backup', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(journal_name)) between 2 and 300),
  check (publisher is null or char_length(publisher) <= 300),
  check (website_url is null or (char_length(website_url) <= 2048 and website_url ~* '^https?://')),
  check (notes is null or char_length(notes) <= 5000)
);

create unique index if not exists journal_targets_project_name_unique
  on public.journal_targets (project_id, lower(journal_name));
create index if not exists journal_targets_project_idx
  on public.journal_targets (project_id, status, updated_at desc);

create table if not exists public.action_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(title)) between 3 and 300),
  check (description is null or char_length(description) <= 2000),
  check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  )
);

create index if not exists action_tasks_project_idx
  on public.action_tasks (project_id, status, due_date, created_at);

drop trigger if exists journal_targets_set_updated_at on public.journal_targets;
create trigger journal_targets_set_updated_at
before update on public.journal_targets
for each row execute function public.set_updated_at();

drop trigger if exists action_tasks_set_updated_at on public.action_tasks;
create trigger action_tasks_set_updated_at
before update on public.action_tasks
for each row execute function public.set_updated_at();

alter table public.journal_targets enable row level security;
alter table public.action_tasks enable row level security;

create policy "journal targets read permitted"
on public.journal_targets for select to authenticated
using (public.can_access_project(project_id));

create policy "action tasks read permitted"
on public.action_tasks for select to authenticated
using (public.can_access_project(project_id));

create or replace function public.save_journal_target(
  target_id uuid,
  target_project_id uuid,
  target_journal_name text,
  target_publisher text,
  target_website_url text,
  target_quartile text,
  target_scope_match integer,
  target_article_type_match integer,
  target_audience_match integer,
  target_requirements_match integer,
  target_status text,
  target_notes text
)
returns public.journal_targets
language plpgsql
security definer set search_path = ''
as $$
declare result_target public.journal_targets;
begin
  if public.current_user_role() <> 'participant'
    or not exists (
      select 1 from public.projects p
      where p.id = target_project_id and p.owner_id = auth.uid()
    ) then
    raise exception 'ACCESS_DENIED';
  end if;

  if char_length(trim(coalesce(target_journal_name, ''))) not between 2 and 300
    or target_quartile not in ('q1', 'q2', 'q3', 'q4', 'unranked', 'unknown')
    or target_status not in ('candidate', 'primary', 'backup', 'rejected')
    or target_scope_match not between 0 and 5
    or target_article_type_match not between 0 and 5
    or target_audience_match not between 0 and 5
    or target_requirements_match not between 0 and 5
    or char_length(coalesce(target_publisher, '')) > 300
    or char_length(coalesce(target_website_url, '')) > 2048
    or (nullif(trim(coalesce(target_website_url, '')), '') is not null and target_website_url !~* '^https?://')
    or char_length(coalesce(target_notes, '')) > 5000 then
    raise exception 'INVALID_JOURNAL_TARGET' using errcode = '22023';
  end if;

  if target_id is null then
    insert into public.journal_targets (
      project_id, journal_name, publisher, website_url, quartile,
      scope_match, article_type_match, audience_match, requirements_match,
      status, notes
    ) values (
      target_project_id,
      trim(target_journal_name),
      nullif(trim(coalesce(target_publisher, '')), ''),
      nullif(trim(coalesce(target_website_url, '')), ''),
      target_quartile,
      target_scope_match,
      target_article_type_match,
      target_audience_match,
      target_requirements_match,
      target_status,
      nullif(trim(coalesce(target_notes, '')), '')
    ) returning * into result_target;
  else
    update public.journal_targets jt set
      journal_name = trim(target_journal_name),
      publisher = nullif(trim(coalesce(target_publisher, '')), ''),
      website_url = nullif(trim(coalesce(target_website_url, '')), ''),
      quartile = target_quartile,
      scope_match = target_scope_match,
      article_type_match = target_article_type_match,
      audience_match = target_audience_match,
      requirements_match = target_requirements_match,
      status = target_status,
      notes = nullif(trim(coalesce(target_notes, '')), '')
    where jt.id = target_id and jt.project_id = target_project_id
    returning * into result_target;

    if result_target.id is null then raise exception 'TARGET_NOT_FOUND'; end if;
  end if;

  return result_target;
exception
  when unique_violation then raise exception 'DUPLICATE_JOURNAL_TARGET' using errcode = '23505';
end;
$$;

create or replace function public.delete_journal_target(target_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from public.journal_targets jt
  using public.projects p
  where jt.id = target_id
    and p.id = jt.project_id
    and p.owner_id = auth.uid()
    and public.current_user_role() = 'participant';
  if not found then raise exception 'TARGET_NOT_FOUND_OR_ACCESS_DENIED'; end if;
end;
$$;

create or replace function public.create_action_task(
  target_project_id uuid,
  target_title text,
  target_description text,
  target_due_date date,
  target_priority text
)
returns public.action_tasks
language plpgsql
security definer set search_path = ''
as $$
declare result_task public.action_tasks;
begin
  if public.current_user_role() <> 'participant'
    or not exists (
      select 1 from public.projects p
      where p.id = target_project_id and p.owner_id = auth.uid()
    ) then
    raise exception 'ACCESS_DENIED';
  end if;

  if char_length(trim(coalesce(target_title, ''))) not between 3 and 300
    or char_length(coalesce(target_description, '')) > 2000
    or target_priority not in ('low', 'medium', 'high') then
    raise exception 'INVALID_ACTION_TASK' using errcode = '22023';
  end if;

  insert into public.action_tasks (
    project_id, title, description, due_date, priority, status
  ) values (
    target_project_id,
    trim(target_title),
    nullif(trim(coalesce(target_description, '')), ''),
    target_due_date,
    target_priority,
    'not_started'
  ) returning * into result_task;

  return result_task;
end;
$$;

create or replace function public.set_action_task_status(
  target_task_id uuid,
  target_status text
)
returns public.action_tasks
language plpgsql
security definer set search_path = ''
as $$
declare result_task public.action_tasks;
begin
  if target_status not in ('not_started', 'in_progress', 'completed') then
    raise exception 'INVALID_ACTION_TASK_STATUS' using errcode = '22023';
  end if;

  update public.action_tasks task set
    status = target_status,
    completed_at = case when target_status = 'completed' then now() else null end
  from public.projects p
  where task.id = target_task_id
    and p.id = task.project_id
    and p.owner_id = auth.uid()
    and public.current_user_role() = 'participant'
  returning task.* into result_task;

  if result_task.id is null then raise exception 'TASK_NOT_FOUND_OR_ACCESS_DENIED'; end if;
  return result_task;
end;
$$;

create or replace function public.delete_action_task(target_task_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  delete from public.action_tasks task
  using public.projects p
  where task.id = target_task_id
    and p.id = task.project_id
    and p.owner_id = auth.uid()
    and public.current_user_role() = 'participant';
  if not found then raise exception 'TASK_NOT_FOUND_OR_ACCESS_DENIED'; end if;
end;
$$;

-- Reads are exposed through RLS. All writes use the validated RPC boundary.
revoke insert, update, delete on public.journal_targets from authenticated;
revoke insert, update, delete on public.action_tasks from authenticated;

revoke execute on function public.save_journal_target(uuid, uuid, text, text, text, text, integer, integer, integer, integer, text, text) from public, anon;
revoke execute on function public.delete_journal_target(uuid) from public, anon;
revoke execute on function public.create_action_task(uuid, text, text, date, text) from public, anon;
revoke execute on function public.set_action_task_status(uuid, text) from public, anon;
revoke execute on function public.delete_action_task(uuid) from public, anon;

grant execute on function public.save_journal_target(uuid, uuid, text, text, text, text, integer, integer, integer, integer, text, text) to authenticated;
grant execute on function public.delete_journal_target(uuid) to authenticated;
grant execute on function public.create_action_task(uuid, text, text, date, text) to authenticated;
grant execute on function public.set_action_task_status(uuid, text) to authenticated;
grant execute on function public.delete_action_task(uuid) to authenticated;
