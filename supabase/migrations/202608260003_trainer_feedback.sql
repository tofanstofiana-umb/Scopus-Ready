-- Sprint 5: write feedback through narrowly scoped RPCs. This keeps the
-- project, worksheet answer, trainer, and class relationship consistent even
-- when callers bypass the application UI.

create or replace function public.create_trainer_feedback(
  target_project_id uuid,
  target_worksheet_answer_id uuid,
  target_comment text,
  target_priority text default 'medium'
)
returns public.feedback
language plpgsql
security definer set search_path = ''
as $$
declare
  result_feedback public.feedback;
begin
  if public.current_user_role() <> 'trainer' then
    raise exception 'ACCESS_DENIED';
  end if;

  if target_priority not in ('low', 'medium', 'high')
    or length(trim(coalesce(target_comment, ''))) < 10
    or length(target_comment) > 5000 then
    raise exception 'INVALID_FEEDBACK';
  end if;

  if not exists (
    select 1
    from public.projects p
    join public.worksheet_answers wa on wa.project_id = p.id
    where p.id = target_project_id
      and wa.id = target_worksheet_answer_id
      and p.class_id is not null
      and public.is_class_trainer(p.class_id)
  ) then
    raise exception 'INVALID_FEEDBACK_TARGET';
  end if;

  insert into public.feedback (
    project_id,
    worksheet_answer_id,
    trainer_id,
    comment,
    priority,
    status
  ) values (
    target_project_id,
    target_worksheet_answer_id,
    auth.uid(),
    trim(target_comment),
    target_priority,
    'open'
  )
  returning * into result_feedback;

  return result_feedback;
end;
$$;

create or replace function public.resolve_trainer_feedback(target_feedback_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.feedback f
  set status = 'resolved', resolved_at = now(), updated_at = now()
  from public.projects p
  where f.id = target_feedback_id
    and p.id = f.project_id
    and f.trainer_id = auth.uid()
    and f.status = 'addressed'
    and p.class_id is not null
    and public.is_class_trainer(p.class_id);

  if not found then
    raise exception 'FEEDBACK_NOT_FOUND_OR_ACCESS_DENIED';
  end if;
end;
$$;

-- Authenticated clients can read feedback through RLS, but all writes go
-- through the validated RPCs above (or mark_feedback_addressed for owners).
revoke insert, update, delete on public.feedback from authenticated;

revoke execute on function public.create_trainer_feedback(uuid, uuid, text, text) from public, anon;
revoke execute on function public.resolve_trainer_feedback(uuid) from public, anon;
grant execute on function public.create_trainer_feedback(uuid, uuid, text, text) to authenticated;
grant execute on function public.resolve_trainer_feedback(uuid) to authenticated;
