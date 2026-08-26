-- Sprint 9: publish trainer assessments only through one validated, atomic RPC.
-- Direct table writes remain closed. The application derives score and gates
-- from these official project/dimension rows.

do $$
begin
  if exists (
    select 1
    from public.assessments
    group by project_id, dimension
    having count(*) > 1
  ) then
    raise exception 'ASSESSMENT_DUPLICATES_REQUIRE_REVIEW';
  end if;
end;
$$;

create unique index if not exists assessments_project_dimension_unique
  on public.assessments(project_id, dimension);

alter table public.assessments
  add constraint assessments_notes_length_check
  check (notes is null or char_length(notes) <= 3000) not valid;

create or replace function public.save_project_assessments(
  target_project_id uuid,
  target_worksheet_answer_id uuid,
  target_assessments jsonb
)
returns setof public.assessments
language plpgsql
security definer set search_path = ''
as $$
declare
  item jsonb;
  requested_dimension text;
  requested_score numeric;
  requested_notes text;
  expected_max_score numeric;
  requested_dimensions text[] := array[]::text[];
  caller_role text;
begin
  if auth.uid() is null then
    raise exception 'AUTHENTICATION_REQUIRED';
  end if;

  caller_role := public.current_user_role();
  if caller_role is null or caller_role not in ('trainer', 'admin') then
    raise exception 'ACCESS_DENIED';
  end if;

  if not exists (
    select 1
    from public.projects p
    join public.worksheet_answers wa
      on wa.id = target_worksheet_answer_id
      and wa.project_id = p.id
    where p.id = target_project_id
      and p.status = 'active'
      and (
        caller_role = 'admin'
        or (p.class_id is not null and public.is_class_trainer(p.class_id))
      )
  ) then
    raise exception 'INVALID_ASSESSMENT_TARGET';
  end if;

  if jsonb_typeof(target_assessments) <> 'array'
    or jsonb_array_length(target_assessments) < 1
    or jsonb_array_length(target_assessments) > 10 then
    raise exception 'INVALID_ASSESSMENTS';
  end if;

  for item in select value from jsonb_array_elements(target_assessments)
  loop
    requested_dimension := item ->> 'dimension';
    if requested_dimension is null or requested_dimension = any(requested_dimensions) then
      raise exception 'INVALID_OR_DUPLICATE_DIMENSION';
    end if;

    expected_max_score := case requested_dimension
      when 'problem' then 8
      when 'research_gap' then 12
      when 'novelty' then 12
      when 'contribution' then 10
      when 'theory_literature' then 10
      when 'method' then 12
      when 'evidence' then 10
      when 'discussion' then 12
      when 'journal_fit' then 8
      when 'language_technical' then 6
      else null
    end;
    if expected_max_score is null or jsonb_typeof(item -> 'score') <> 'number' then
      raise exception 'INVALID_ASSESSMENT_DIMENSION';
    end if;

    begin
      requested_score := (item ->> 'score')::numeric;
    exception when others then
      raise exception 'INVALID_ASSESSMENT_SCORE';
    end;
    if requested_score < 0
      or requested_score > expected_max_score
      or requested_score <> trunc(requested_score) then
      raise exception 'INVALID_ASSESSMENT_SCORE';
    end if;

    requested_notes := nullif(trim(coalesce(item ->> 'notes', '')), '');
    if requested_notes is not null and char_length(requested_notes) > 3000 then
      raise exception 'ASSESSMENT_NOTES_TOO_LONG';
    end if;

    insert into public.assessments (
      project_id,
      worksheet_answer_id,
      assessor_id,
      dimension,
      score,
      max_score,
      notes
    ) values (
      target_project_id,
      target_worksheet_answer_id,
      auth.uid(),
      requested_dimension,
      requested_score,
      expected_max_score,
      requested_notes
    )
    on conflict (project_id, dimension) do update set
      worksheet_answer_id = excluded.worksheet_answer_id,
      assessor_id = auth.uid(),
      score = excluded.score,
      max_score = excluded.max_score,
      notes = excluded.notes,
      updated_at = now();

    requested_dimensions := array_append(requested_dimensions, requested_dimension);
  end loop;

  return query
    select a.*
    from public.assessments a
    where a.project_id = target_project_id
      and a.dimension = any(requested_dimensions)
    order by a.dimension;
end;
$$;

revoke insert, update, delete on public.assessments from authenticated;
revoke execute on function public.save_project_assessments(uuid, uuid, jsonb) from public, anon;
grant execute on function public.save_project_assessments(uuid, uuid, jsonb) to authenticated;
