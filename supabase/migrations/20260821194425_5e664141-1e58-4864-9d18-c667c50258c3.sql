revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.block_message_mutation() from public, anon, authenticated;
revoke all on function public.touch_conversation() from public, anon, authenticated;
revoke all on function public.has_role(uuid, public.app_role) from public, anon;
revoke all on function public.has_permission(uuid, text) from public, anon;
revoke all on function public.is_participant(uuid, uuid) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.has_permission(uuid, text) to authenticated;
grant execute on function public.is_participant(uuid, uuid) to authenticated;