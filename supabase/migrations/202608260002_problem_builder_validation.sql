-- Harden the public Problem Builder RPC so direct callers cannot bypass the
-- application schema or store arbitrary JSON keys and oversized values.
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
  if auth.uid() is null then raise exception 'ACCESS_DENIED'; end if;

  if not exists (
    select 1 from public.projects p
    where p.id = target_project_id and p.owner_id = auth.uid()
  ) then
    raise exception 'ACCESS_DENIED';
  end if;

  if jsonb_typeof(target_content) <> 'object'
    or jsonb_typeof(target_content -> 'topic') is distinct from 'string'
    or jsonb_typeof(target_content -> 'phenomenon') is distinct from 'string'
    or jsonb_typeof(target_content -> 'problem') is distinct from 'string'
    or jsonb_typeof(target_content -> 'evidence') is distinct from 'string'
    or jsonb_typeof(target_content -> 'importance') is distinct from 'string'
    or target_content - array['topic', 'phenomenon', 'problem', 'evidence', 'importance']::text[] <> '{}'::jsonb
    or char_length(target_content ->> 'topic') > 500
    or char_length(target_content ->> 'phenomenon') > 1500
    or char_length(target_content ->> 'problem') > 1500
    or char_length(target_content ->> 'evidence') > 2000
    or char_length(target_content ->> 'importance') > 1500
  then
    raise exception 'INVALID_CONTENT' using errcode = '22023';
  end if;

  select id into target_module_id
  from public.worksheet_modules
  where code = 'problem' and is_active = true;
  if target_module_id is null then raise exception 'PROBLEM_MODULE_INACTIVE'; end if;

  select * into current_answer
  from public.worksheet_answers
  where project_id = target_project_id and module_id = target_module_id;
  if current_answer.id is not null
    and last_known_updated_at is not null
    and current_answer.updated_at <> last_known_updated_at
  then
    raise exception 'VERSION_CONFLICT';
  end if;

  filled_count :=
    (case when length(trim(target_content ->> 'topic')) > 0 then 1 else 0 end) +
    (case when length(trim(target_content ->> 'phenomenon')) > 0 then 1 else 0 end) +
    (case when length(trim(target_content ->> 'problem')) > 0 then 1 else 0 end) +
    (case when length(trim(target_content ->> 'evidence')) > 0 then 1 else 0 end) +
    (case when length(trim(target_content ->> 'importance')) > 0 then 1 else 0 end);
  calculated_completion := filled_count * 20;
  calculated_status := case
    when current_answer.status = 'needs_revision' then 'needs_revision'
    when calculated_completion = 0 then 'not_started'
    else 'in_progress'
  end;

  insert into public.worksheet_answers (
    project_id,
    module_id,
    content,
    status,
    completion_percent,
    last_saved_at
  )
  values (
    target_project_id,
    target_module_id,
    target_content,
    calculated_status,
    calculated_completion,
    now()
  )
  on conflict (project_id, module_id) do update set
    content = excluded.content,
    status = calculated_status,
    completion_percent = calculated_completion,
    last_saved_at = now()
  returning * into result_answer;

  return result_answer;
end;
$$;

revoke execute on function public.save_problem_builder(uuid, jsonb, timestamptz) from public, anon;
grant execute on function public.save_problem_builder(uuid, jsonb, timestamptz) to authenticated;
