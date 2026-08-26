-- Sprint 13: Journal Target progress is derived from the existing journal
-- matrix, while Internal Review is a trainer-approved structured worksheet.
update public.worksheet_modules
set is_active = true
where code in ('journal_target', 'internal_review');

create or replace function public.save_structured_worksheet(
  target_project_id uuid,
  target_module_code text,
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
  expected_keys text[];
  field_key text;
  max_length integer;
  filled_count integer := 0;
  calculated_completion integer;
  calculated_status text;
begin
  if auth.uid() is null then raise exception 'ACCESS_DENIED'; end if;

  if target_module_code not in (
    'literature', 'gap', 'novelty', 'blueprint', 'method',
    'scientific_story', 'internal_review'
  ) then
    raise exception 'UNSUPPORTED_MODULE' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.projects p
    where p.id = target_project_id and p.owner_id = auth.uid()
  ) then
    raise exception 'ACCESS_DENIED';
  end if;

  expected_keys := case target_module_code
    when 'literature' then array['key_findings', 'theories', 'methods', 'contexts', 'limitations']::text[]
    when 'gap' then array['established_knowledge', 'inconsistency', 'underexplored_area', 'consequence', 'research_gap']::text[]
    when 'novelty' then array['gap_basis', 'difference', 'new_contribution', 'originality_evidence', 'novelty_statement']::text[]
    when 'blueprint' then array['working_title', 'research_objective', 'article_structure', 'key_argument', 'evidence_plan']::text[]
    when 'method' then array['research_design', 'population_sample', 'variables_data', 'instruments_procedure', 'analysis_plan']::text[]
    when 'scientific_story' then array['central_message', 'story_flow', 'key_results', 'interpretation', 'take_home_message']::text[]
    when 'internal_review' then array['scope_alignment', 'argument_coherence', 'evidence_quality', 'method_reporting', 'submission_readiness']::text[]
  end;

  if jsonb_typeof(target_content) <> 'object'
    or target_content - expected_keys <> '{}'::jsonb
    or (select count(*) from jsonb_object_keys(target_content)) <> 5
  then
    raise exception 'INVALID_CONTENT' using errcode = '22023';
  end if;

  foreach field_key in array expected_keys loop
    max_length := case
      when target_module_code = 'blueprint' and field_key = 'working_title' then 500
      when target_module_code = 'blueprint' and field_key = 'research_objective' then 1500
      when target_module_code = 'novelty' and field_key = 'novelty_statement' then 1500
      when target_module_code = 'method' and field_key = 'research_design' then 1500
      when target_module_code = 'scientific_story' and field_key = 'central_message' then 1500
      when target_module_code = 'scientific_story' and field_key = 'take_home_message' then 1000
      when target_module_code = 'internal_review' and field_key = 'submission_readiness' then 1500
      else 2000
    end;

    if jsonb_typeof(target_content -> field_key) is distinct from 'string'
      or char_length(target_content ->> field_key) > max_length
    then
      raise exception 'INVALID_CONTENT' using errcode = '22023';
    end if;
    if length(trim(target_content ->> field_key)) > 0 then
      filled_count := filled_count + 1;
    end if;
  end loop;

  select id into target_module_id
  from public.worksheet_modules
  where code = target_module_code and is_active = true;
  if target_module_id is null then raise exception 'MODULE_INACTIVE'; end if;

  select * into current_answer
  from public.worksheet_answers
  where project_id = target_project_id and module_id = target_module_id;

  if current_answer.id is not null
    and last_known_updated_at is not null
    and current_answer.updated_at <> last_known_updated_at
  then
    raise exception 'VERSION_CONFLICT';
  end if;

  calculated_completion := filled_count * 20;
  calculated_status := case
    when current_answer.status = 'needs_revision' then 'needs_revision'
    when calculated_completion = 0 then 'not_started'
    else 'in_progress'
  end;

  insert into public.worksheet_answers (
    project_id, module_id, content, status, completion_percent, last_saved_at
  ) values (
    target_project_id, target_module_id, target_content,
    calculated_status, calculated_completion, now()
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

create or replace function public.sync_journal_target_module(target_project_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  target_module_id uuid;
  active_count integer;
  primary_count integer;
  backup_count integer;
  primary_assessed boolean;
  best_fit integer;
  calculated_completion integer := 0;
  calculated_status text;
begin
  select id into target_module_id
  from public.worksheet_modules
  where code = 'journal_target' and is_active = true;
  if target_module_id is null then return; end if;

  select
    count(*) filter (where status <> 'rejected'),
    count(*) filter (where status = 'primary'),
    count(*) filter (where status = 'backup'),
    coalesce(bool_or(
      status = 'primary'
      and scope_match > 0
      and article_type_match > 0
      and audience_match > 0
      and requirements_match > 0
    ), false),
    coalesce(max((scope_match + article_type_match + audience_match + requirements_match) * 5), 0)
  into active_count, primary_count, backup_count, primary_assessed, best_fit
  from public.journal_targets
  where project_id = target_project_id;

  calculated_completion :=
    (case when active_count >= 1 then 20 else 0 end) +
    (case when active_count >= 2 then 20 else 0 end) +
    (case when primary_count >= 1 then 20 else 0 end) +
    (case when primary_assessed then 20 else 0 end) +
    (case when backup_count >= 1 then 20 else 0 end);
  calculated_status := case
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
      'active_count', active_count,
      'primary_count', primary_count,
      'backup_count', backup_count,
      'primary_assessed', primary_assessed,
      'best_fit', best_fit
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

create or replace function public.sync_journal_target_module_trigger()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_journal_target_module(old.project_id);
    return old;
  end if;
  perform public.sync_journal_target_module(new.project_id);
  return new;
end;
$$;

drop trigger if exists journal_targets_sync_module on public.journal_targets;
create trigger journal_targets_sync_module
after insert or update or delete on public.journal_targets
for each row execute function public.sync_journal_target_module_trigger();

do $$
declare project_row record;
begin
  for project_row in select distinct project_id from public.journal_targets loop
    perform public.sync_journal_target_module(project_row.project_id);
  end loop;
end;
$$;

create or replace function public.complete_internal_review(target_project_id uuid)
returns public.worksheet_answers
language plpgsql
security definer set search_path = ''
as $$
declare result_answer public.worksheet_answers;
begin
  if public.current_user_role() not in ('trainer', 'admin') then
    raise exception 'ACCESS_DENIED';
  end if;

  select wa.* into result_answer
  from public.worksheet_answers wa
  join public.worksheet_modules wm on wm.id = wa.module_id
  join public.projects p on p.id = wa.project_id
  where wa.project_id = target_project_id
    and wm.code = 'internal_review'
    and wm.is_active = true
    and wa.completion_percent = 100
    and (
      public.current_user_role() = 'admin'
      or (p.class_id is not null and public.is_class_trainer(p.class_id))
    )
    and not exists (
      select 1 from public.feedback f
      where f.worksheet_answer_id = wa.id and f.status <> 'resolved'
    );

  if result_answer.id is null then
    raise exception 'REVIEW_NOT_READY_OR_ACCESS_DENIED';
  end if;

  update public.worksheet_answers
  set status = 'completed'
  where id = result_answer.id
  returning * into result_answer;
  return result_answer;
end;
$$;

-- Completion after feedback resolution is based on the persisted completion
-- percentage, so it works for every validated worksheet rather than only the
-- original Problem Builder JSON keys.
create or replace function public.resolve_trainer_feedback(target_feedback_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare target_answer_id uuid;
begin
  update public.feedback f
  set status = 'resolved', resolved_at = now(), updated_at = now()
  from public.projects p
  where f.id = target_feedback_id
    and p.id = f.project_id
    and f.trainer_id = auth.uid()
    and f.status = 'addressed'
    and p.class_id is not null
    and public.is_class_trainer(p.class_id)
  returning f.worksheet_answer_id into target_answer_id;

  if target_answer_id is null then
    raise exception 'FEEDBACK_NOT_FOUND_OR_ACCESS_DENIED';
  end if;

  update public.worksheet_answers wa
  set status = case
    when exists (
      select 1 from public.feedback f
      where f.worksheet_answer_id = wa.id and f.status <> 'resolved'
    ) then 'needs_revision'
    when wa.completion_percent = 100 then 'completed'
    when wa.completion_percent = 0 then 'not_started'
    else 'in_progress'
  end
  where wa.id = target_answer_id;
end;
$$;

revoke execute on function public.save_structured_worksheet(uuid, text, jsonb, timestamptz) from public, anon;
revoke execute on function public.sync_journal_target_module(uuid) from public, anon, authenticated;
revoke execute on function public.sync_journal_target_module_trigger() from public, anon, authenticated;
revoke execute on function public.complete_internal_review(uuid) from public, anon;
revoke execute on function public.resolve_trainer_feedback(uuid) from public, anon;

grant execute on function public.save_structured_worksheet(uuid, text, jsonb, timestamptz) to authenticated;
grant execute on function public.complete_internal_review(uuid) to authenticated;
grant execute on function public.resolve_trainer_feedback(uuid) to authenticated;
