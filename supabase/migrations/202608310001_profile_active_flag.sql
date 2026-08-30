-- Admin can deactivate a participant/trainer account. Enforced at the app
-- layer (getCurrentIdentity treats an inactive profile as "not logged in"),
-- not via Supabase Auth's own ban mechanism, so it fits the existing
-- profiles-table-is-the-source-of-truth pattern this app already uses.
alter table public.profiles add column if not exists is_active boolean not null default true;

-- No new grant needed: writes to is_active go through the service-role
-- client (see setUserActive in class.service.ts), the same pattern already
-- used for class_payments/notifications — the existing column-level grant
-- on profiles (full_name, institution, field_of_study, updated_at only)
-- is untouched, so no authenticated user can self-toggle this column.
