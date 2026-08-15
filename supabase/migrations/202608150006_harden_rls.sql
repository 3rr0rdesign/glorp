-- Keep wallet and X-handle submissions private.
-- Browser roles get no direct table access; the Edge Function uses service_role.

alter table public.glorp_transmissions enable row level security;
alter table public.glorp_transmissions force row level security;

revoke all on table public.glorp_transmissions
  from public, anon, authenticated;

grant select, insert on table public.glorp_transmissions
  to service_role;

revoke all on function public.submit_glorp_transmission(text, text)
  from public, anon, authenticated;

grant execute on function public.submit_glorp_transmission(text, text)
  to service_role;

comment on table public.glorp_transmissions is
  'RLS-protected GLORP submissions. Direct browser access is denied; writes go through the Edge Function.';
