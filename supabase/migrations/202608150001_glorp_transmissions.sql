create extension if not exists pgcrypto with schema extensions;

create table if not exists public.glorp_transmissions (
  id uuid primary key default extensions.gen_random_uuid(),
  wallet text not null,
  twitter_handle text not null,
  created_at timestamptz not null default now(),
  constraint glorp_wallet_format check (wallet ~ '^0x[0-9a-f]{40}$'),
  constraint glorp_twitter_format check (twitter_handle ~ '^[a-z0-9_]{1,15}$'),
  constraint glorp_wallet_unique unique (wallet)
);

alter table public.glorp_transmissions enable row level security;
alter table public.glorp_transmissions force row level security;

revoke all on table public.glorp_transmissions from public, anon, authenticated;

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
begin
  if p_wallet !~ '^0x[0-9a-f]{40}$' then
    raise exception using errcode = '22023', message = 'invalid_wallet';
  end if;

  if p_twitter_handle !~ '^[a-z0-9_]{1,15}$' then
    raise exception using errcode = '22023', message = 'invalid_twitter_handle';
  end if;

  insert into public.glorp_transmissions (wallet, twitter_handle)
  values (p_wallet, p_twitter_handle)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_glorp_transmission(text, text) from public, anon, authenticated;
grant execute on function public.submit_glorp_transmission(text, text) to service_role;

comment on table public.glorp_transmissions is
  'Private GLORP submissions. Wallets are unique and browser roles have no table access.';

