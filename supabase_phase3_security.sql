-- Equitask Phase 3 Task 1 security migration
-- Adds encrypted comment storage while preserving existing legacy plaintext rows.

alter table public.comments
add column if not exists ciphertext text,
add column if not exists iv text,
add column if not exists encryption_version text,
add column if not exists encryption_algorithm text,
add column if not exists key_id text;

alter table public.comments
alter column body drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'comments_encryption_state_check'
      and conrelid = 'public.comments'::regclass
  ) then
    alter table public.comments
    add constraint comments_encryption_state_check
    check (
      (
        ciphertext is null
        and iv is null
        and encryption_version is null
        and encryption_algorithm is null
      )
      or
      (
        ciphertext is not null
        and iv is not null
        and encryption_version = 'e2ee-v1'
        and encryption_algorithm = 'AES-GCM-256'
      )
    );
  end if;
end $$;

comment on column public.comments.body is
'Legacy plaintext comment body. New Supabase comments should leave this null and use ciphertext instead.';

comment on column public.comments.ciphertext is
'AES-GCM encrypted comment text produced in the browser before storage.';

comment on column public.comments.iv is
'Base64 encoded 96-bit AES-GCM initialization vector generated with crypto.getRandomValues.';

comment on column public.comments.encryption_version is
'Client-side encryption format version, currently e2ee-v1.';

comment on column public.comments.encryption_algorithm is
'Encryption algorithm identifier, currently AES-GCM-256.';

comment on column public.comments.key_id is
'Non-secret client key identifier used to match encrypted comments with the local team key.';
