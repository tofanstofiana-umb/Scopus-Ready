-- Sprint 15: Publication Roadmap is a derived projection of Action Plan.
-- action_tasks remains the sole editable source; worksheet_answers stores the
-- validated module projection used by dashboards, trainer views, and reports.
update public.worksheet_modules
set is_active = true
where code = 'roadmap';

create or replace function public.sync_publication_roadmap_module(target_project_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  target_module_id uuid;
  task_count integer;
  dated_count integer;
  high_priority_count integer;
  completed_count integer;
  current_status text;
  calculated_completion integer := 0;
  calculated_status text;
begin
  select id into target_module_id
  from public.worksheet_modules
  where code = 'roadmap' and is_active = true;
  if target_module_id is null then return; end if;

  select
    count(*),
    count(*) filter (where due_date is not null),
    count(*) filter (where priority = 'high'),
    count(*) filter (where status = 'completed')
  into task_count, dated_count, high_priority_count, completed_count
  from public.action_tasks
  where project_id = target_project_id;

  calculated_completion :=
    (case when task_count >= 1 then 20 else 0 end) +
    (case when task_count >= 3 then 20 else 0 end) +
    (case when task_count > 0 and dated_count = task_count then 20 else 0 end) +
    (case when high_priority_count >= 1 then 20 else 0 end) +
    (case when task_count > 0 and completed_count = task_count then 20 else 0 end);

  select status into current_status
  from public.worksheet_answers
  where project_id = target_project_id and module_id = target_module_id;

  calculated_status := case
    when current_status = 'needs_revision' then 'needs_revision'
    when calculated_completion = 0 then 'not_started'
    when calculated_completion = 100 then 'completed'
    else 'in_progress'
  end;

  insert into public.worksheet_answers (
    project_id, module_id, content, status, completion_percent, last_saved_at
  ) values (
    target_project_id,
    target_module_id,
    jsonb_build_object(
      'task_count', task_count,
      'dated_count', dated_count,
      'high_priority_count', high_priority_count,
      'completed_count', completed_count
    ),
    calculated_status,
    calculated_completion,
    now()
  )
  on conflict (project_id, module_id) do update set
    content = excluded.content,
    status = excluded.status,
    completion_percent = excluded.completion_percent,
    last_saved_at = now();
end;
$$;

create or replace function public.sync_publication_roadmap_module_trigger()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_publication_roadmap_module(old.project_id);
    return old;
  end if;
  perform public.sync_publication_roadmap_module(new.project_id);
  return new;
end;
$$;

drop trigger if exists action_tasks_sync_roadmap_module on public.action_tasks;
create trigger action_tasks_sync_roadmap_module
after insert or update or delete on public.action_tasks
for each row execute function public.sync_publication_roadmap_module_trigger();

do $$
declare project_row record;
begin
  for project_row in select distinct project_id from public.action_tasks loop
    perform public.sync_publication_roadmap_module(project_row.project_id);
  end loop;
end;
$$;

revoke execute on function public.sync_publication_roadmap_module(uuid) from public, anon, authenticated;
revoke execute on function public.sync_publication_roadmap_module_trigger() from public, anon, authenticated;
