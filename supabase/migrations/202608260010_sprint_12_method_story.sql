-- Sprint 12: activate Method Fit and Scientific Story and include both in the
-- same validated, owner-only structured worksheet persistence boundary.
update public.worksheet_modules
set is_active = true
where code in ('method', 'scientific_story');

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
    'literature', 'gap', 'novelty', 'blueprint', 'method', 'scientific_story'
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

revoke execute on function public.save_structured_worksheet(uuid, text, jsonb, timestamptz) from public, anon;
grant execute on function public.save_structured_worksheet(uuid, text, jsonb, timestamptz) to authenticated;
