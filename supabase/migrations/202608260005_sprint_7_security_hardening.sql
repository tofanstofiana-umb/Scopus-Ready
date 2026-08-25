-- Sprint 7: enforce the same validation and write boundaries even when a
-- caller bypasses the Next.js UI and talks directly to PostgREST.

alter table public.projects
  add constraint projects_title_length_check
  check (char_length(trim(title)) between 5 and 500) not valid;

alter table public.projects
  add constraint projects_field_length_check
  check (field is null or char_length(field) <= 200) not valid;

drop policy if exists "participants create own projects" on public.projects;
create policy "participants create own projects" on public.projects for insert to authenticated
with check (
  owner_id = auth.uid()
  and public.current_user_role() = 'participant'
  and (
    class_id is null
    or exists (
      select 1
      from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.class_id = projects.class_id
        and cm.user_id = auth.uid()
        and cm.member_role = 'participant'
        and c.status = 'active'
    )
  )
);

drop policy if exists "participants update own projects" on public.projects;
create policy "participants update own projects" on public.projects for update to authenticated
using (owner_id = auth.uid() and public.current_user_role() = 'participant')
with check (
  owner_id = auth.uid()
  and public.current_user_role() = 'participant'
  and (
    class_id is null
    or exists (
      select 1
      from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.class_id = projects.class_id
        and cm.user_id = auth.uid()
        and cm.member_role = 'participant'
        and c.status = 'active'
    )
  )
);

alter table public.assessments
  add constraint assessments_official_rubric_check
  check (
    (dimension = 'problem' and max_score = 8)
    or (dimension = 'research_gap' and max_score = 12)
    or (dimension = 'novelty' and max_score = 12)
    or (dimension = 'contribution' and max_score = 10)
    or (dimension = 'theory_literature' and max_score = 10)
    or (dimension = 'method' and max_score = 12)
    or (dimension = 'evidence' and max_score = 10)
    or (dimension = 'discussion' and max_score = 12)
    or (dimension = 'journal_fit' and max_score = 8)
    or (dimension = 'language_technical' and max_score = 6)
  ) not valid;

-- Assessment editing is not part of MVP 0.1. Keep reads available for the
-- score engine, but close direct writes until a narrowly scoped assessment
-- RPC and trainer rubric UI are introduced in MVP 0.2.
revoke insert, update, delete on public.assessments from authenticated;

-- Direct feedback writes were already closed in Sprint 5. Reassert the
-- boundary so a clean migration history documents the production posture.
revoke insert, update, delete on public.feedback from authenticated;
