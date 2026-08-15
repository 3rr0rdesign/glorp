create or replace function public.submit_glorp_transmission(
  p_wallet text,
  p_twitter_handle text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_existing_handle text;
begin
  if p_wallet !~ '^0x[0-9a-f]{40}$' then
    raise exception using errcode = '22023', message = 'invalid_wallet';
  end if;

  if p_twitter_handle !~ '^[a-z0-9_]{1,15}$' then
    raise exception using errcode = '22023', message = 'invalid_twitter_handle';
  end if;

  select id, twitter_handle
  into v_id, v_existing_handle
  from public.glorp_transmissions
  where wallet = p_wallet;

  if found then
    if v_existing_handle = p_twitter_handle then
      return v_id;
    end if;

    raise exception using
      errcode = '23505',
      message = 'wallet_exists',
      constraint = 'glorp_wallet_unique_idx';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('glorp-twitter:' || p_twitter_handle, 0)
  );

  if exists (
    select 1
    from public.glorp_transmissions
    where twitter_handle = p_twitter_handle
  ) then
    raise exception using
      errcode = '23505',
      message = 'twitter_exists',
      constraint = 'glorp_twitter_unique_idx';
  end if;

  insert into public.glorp_transmissions (wallet, twitter_handle)
  values (p_wallet, p_twitter_handle)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_glorp_transmission(text, text)
  from public, anon, authenticated;
grant execute on function public.submit_glorp_transmission(text, text)
  to service_role;

do $$
begin
  if not exists (
    select 1
    from public.glorp_transmissions
    group by twitter_handle
    having count(*) > 1
  ) then
    execute 'create unique index if not exists glorp_twitter_unique_idx on public.glorp_transmissions (twitter_handle)';
  end if;
end;
$$;

