-- Sprint 6: keep worksheet status and assessment scope deterministic so
-- progress and score can be derived safely from primary domain data.

create or replace function public.resolve_trainer_feedback(target_feedback_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  target_answer_id uuid;
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
    when length(trim(coalesce(wa.content ->> 'topic', ''))) > 0
      and length(trim(coalesce(wa.content ->> 'phenomenon', ''))) > 0
      and length(trim(coalesce(wa.content ->> 'problem', ''))) > 0
      and length(trim(coalesce(wa.content ->> 'evidence', ''))) > 0
      and length(trim(coalesce(wa.content ->> 'importance', ''))) > 0 then 'completed'
    when wa.completion_percent = 0 then 'not_started'
    else 'in_progress'
  end
  where wa.id = target_answer_id;
end;
$$;

-- Assessment rows must point to the worksheet answer of the same project.
-- The score engine additionally ignores dimensions whose maximum differs
-- from the official rubric.
drop policy if exists "trainers create assessments" on public.assessments;
create policy "trainers create assessments" on public.assessments for insert to authenticated
with check (
  assessor_id = auth.uid()
  and exists (
    select 1
    from public.projects p
    join public.worksheet_answers wa on wa.project_id = p.id
    where p.id = assessments.project_id
      and wa.id = assessments.worksheet_answer_id
      and p.class_id is not null
      and public.is_class_trainer(p.class_id)
  )
);

drop policy if exists "trainers update own assessments" on public.assessments;
create policy "trainers update own assessments" on public.assessments for update to authenticated
using (
  assessor_id = auth.uid()
  and exists (
    select 1 from public.projects p
    where p.id = assessments.project_id
      and p.class_id is not null
      and public.is_class_trainer(p.class_id)
  )
)
with check (
  assessor_id = auth.uid()
  and exists (
    select 1
    from public.projects p
    join public.worksheet_answers wa on wa.project_id = p.id
    where p.id = assessments.project_id
      and wa.id = assessments.worksheet_answer_id
      and p.class_id is not null
      and public.is_class_trainer(p.class_id)
  )
);
