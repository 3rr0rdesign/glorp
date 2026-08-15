create or replace function public.reject_duplicate_glorp_twitter()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('glorp-twitter:' || new.twitter_handle, 0)
  );

  if exists (
    select 1
    from public.glorp_transmissions
    where twitter_handle = new.twitter_handle
  ) then
    raise exception using
      errcode = '23505',
      message = 'twitter_exists',
      constraint = 'glorp_twitter_unique_idx';
  end if;

  return new;
end;
$$;

revoke all on function public.reject_duplicate_glorp_twitter()
  from public, anon, authenticated;

drop trigger if exists reject_duplicate_glorp_twitter
  on public.glorp_transmissions;

create trigger reject_duplicate_glorp_twitter
before insert on public.glorp_transmissions
for each row
execute function public.reject_duplicate_glorp_twitter();

comment on function public.reject_duplicate_glorp_twitter() is
  'Rejects every new GLORP submission whose X handle already exists.';

