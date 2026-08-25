-- Allow INSERT ... RETURNING to evaluate project ownership from the new row.
-- The previous helper queried projects again and could not see the row being
-- returned within the same statement snapshot.
drop policy if exists "projects read permitted" on public.projects;

create policy "projects read permitted"
on public.projects
for select
to authenticated
using (
  owner_id = auth.uid()
  or public.current_user_role() = 'admin'
  or (class_id is not null and public.is_class_trainer(class_id))
);
