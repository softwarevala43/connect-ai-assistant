create type public.app_role as enum ('admin','developer','sales','support','reseller','franchise','influencer','affiliate','author','vendor','creator','member');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique,
  display_name text not null,
  job_title text,
  avatar_path text,
  presence text not null default 'offline',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.role_permissions (
  role public.app_role not null,
  permission text not null,
  primary key (role, permission)
);
grant select on public.role_permissions to authenticated;
grant all on public.role_permissions to service_role;
alter table public.role_permissions enable row level security;
create policy "permissions readable" on public.role_permissions for select to authenticated using (true);
create policy "admins manage permissions" on public.role_permissions for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.role_permissions (role, permission)
select r, p from unnest(enum_range(null::public.app_role)) r
cross join unnest(array['message.send','message.react','message.reply','message.bookmark','attachment.upload','attachment.download','conversation.create','mention.use','search.messages']) p;
insert into public.role_permissions (role, permission) values
  ('admin','conversation.manage'),
  ('support','conversation.manage'),
  ('developer','conversation.manage'),
  ('admin','profile.manage_others');

create or replace function public.has_permission(_user_id uuid, _permission text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.role_permissions rp on rp.role = ur.role
    where ur.user_id = _user_id and rp.permission = _permission
  )
$$;

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  kind text not null default 'direct',
  reference_code text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);
grant select, insert, update on public.conversations to authenticated;
grant all on public.conversations to service_role;
alter table public.conversations enable row level security;

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_label text,
  favorite boolean not null default false,
  muted boolean not null default false,
  last_read_at timestamptz not null default 'epoch',
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
grant select, insert, update on public.conversation_participants to authenticated;
grant all on public.conversation_participants to service_role;
alter table public.conversation_participants enable row level security;

create or replace function public.is_participant(_conversation_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = _conversation_id and user_id = _user_id
  )
$$;

create policy "participants read conversations" on public.conversations for select to authenticated
  using (public.is_participant(id, auth.uid()));
create policy "members create conversations" on public.conversations for insert to authenticated
  with check (created_by = auth.uid() and public.has_permission(auth.uid(),'conversation.create'));
create policy "managers update conversations" on public.conversations for update to authenticated
  using (public.is_participant(id, auth.uid()) and public.has_permission(auth.uid(),'conversation.manage'))
  with check (public.is_participant(id, auth.uid()));

create policy "read own conversation memberships" on public.conversation_participants for select to authenticated
  using (public.is_participant(conversation_id, auth.uid()));
create policy "add participants to own conversations" on public.conversation_participants for insert to authenticated
  with check (
    user_id = auth.uid()
    or public.is_participant(conversation_id, auth.uid())
    or exists (select 1 from public.conversations c where c.id = conversation_id and c.created_by = auth.uid())
  );
create policy "update own membership" on public.conversation_participants for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.messages(id) on delete restrict,
  kind text not null default 'text',
  body text not null default '',
  client_ref text,
  created_at timestamptz not null default now()
);
create index messages_conversation_idx on public.messages(conversation_id, created_at);
create index messages_parent_idx on public.messages(parent_id);
create index messages_body_search_idx on public.messages using gin (to_tsvector('simple', body));
grant select, insert on public.messages to authenticated;
grant select, insert on public.messages to service_role;
alter table public.messages enable row level security;
create policy "participants read messages" on public.messages for select to authenticated
  using (public.is_participant(conversation_id, auth.uid()));
create policy "participants send messages" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.is_participant(conversation_id, auth.uid()) and public.has_permission(auth.uid(),'message.send'));

create or replace function public.block_message_mutation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  raise exception 'Messages are immutable enterprise records and cannot be modified or removed';
end;
$$;
create trigger messages_immutable_update before update on public.messages for each row execute function public.block_message_mutation();
create trigger messages_immutable_delete before delete on public.messages for each row execute function public.block_message_mutation();

create or replace function public.touch_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;
create trigger messages_touch_conversation after insert on public.messages for each row execute function public.touch_conversation();

create table public.message_mentions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
grant select, insert on public.message_mentions to authenticated;
grant all on public.message_mentions to service_role;
alter table public.message_mentions enable row level security;
create policy "read mentions in own conversations" on public.message_mentions for select to authenticated
  using (exists (select 1 from public.messages m where m.id = message_id and public.is_participant(m.conversation_id, auth.uid())));
create policy "create mentions on own messages" on public.message_mentions for insert to authenticated
  with check (exists (select 1 from public.messages m where m.id = message_id and m.sender_id = auth.uid()));

create table public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null,
  media_kind text not null default 'file',
  duration_seconds numeric,
  created_at timestamptz not null default now()
);
create index message_attachments_conversation_idx on public.message_attachments(conversation_id, created_at desc);
grant select, insert on public.message_attachments to authenticated;
grant all on public.message_attachments to service_role;
alter table public.message_attachments enable row level security;
create policy "participants read attachments" on public.message_attachments for select to authenticated
  using (public.is_participant(conversation_id, auth.uid()));
create policy "participants create attachments" on public.message_attachments for insert to authenticated
  with check (
    public.is_participant(conversation_id, auth.uid())
    and public.has_permission(auth.uid(),'attachment.upload')
    and exists (select 1 from public.messages m where m.id = message_id and m.sender_id = auth.uid())
  );

create table public.message_reactions (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);
grant select, insert, delete on public.message_reactions to authenticated;
grant all on public.message_reactions to service_role;
alter table public.message_reactions enable row level security;
create policy "participants read reactions" on public.message_reactions for select to authenticated
  using (exists (select 1 from public.messages m where m.id = message_id and public.is_participant(m.conversation_id, auth.uid())));
create policy "participants add own reactions" on public.message_reactions for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id and public.is_participant(m.conversation_id, auth.uid())));
create policy "remove own reactions" on public.message_reactions for delete to authenticated using (user_id = auth.uid());

create table public.message_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  delivered_at timestamptz not null default now(),
  read_at timestamptz,
  primary key (message_id, user_id)
);
grant select, insert, update on public.message_receipts to authenticated;
grant all on public.message_receipts to service_role;
alter table public.message_receipts enable row level security;
create policy "participants read receipts" on public.message_receipts for select to authenticated
  using (exists (select 1 from public.messages m where m.id = message_id and public.is_participant(m.conversation_id, auth.uid())));
create policy "own receipts insert" on public.message_receipts for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id and public.is_participant(m.conversation_id, auth.uid())));
create policy "own receipts update" on public.message_receipts for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create table public.message_bookmarks (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
grant select, insert, update, delete on public.message_bookmarks to authenticated;
grant all on public.message_bookmarks to service_role;
alter table public.message_bookmarks enable row level security;
create policy "own bookmarks" on public.message_bookmarks for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.messages m where m.id = message_id and public.is_participant(m.conversation_id, auth.uid())));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_handle text;
begin
  base_handle := coalesce(new.raw_user_meta_data->>'handle', 'user-' || substr(new.id::text, 1, 8));
  insert into public.profiles (id, handle, display_name, job_title)
  values (
    new.id,
    base_handle,
    coalesce(new.raw_user_meta_data->>'display_name', base_handle),
    new.raw_user_meta_data->>'job_title'
  )
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'member'))
  on conflict do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.message_reactions;
alter publication supabase_realtime add table public.message_receipts;
alter publication supabase_realtime add table public.message_attachments;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.conversation_participants;
alter publication supabase_realtime add table public.profiles;

create policy "participants read chat files" on storage.objects for select to authenticated
  using (bucket_id = 'chat-files' and public.is_participant(((storage.foldername(name))[1])::uuid, auth.uid()));
create policy "participants upload chat files" on storage.objects for insert to authenticated
  with check (bucket_id = 'chat-files' and public.is_participant(((storage.foldername(name))[1])::uuid, auth.uid()) and public.has_permission(auth.uid(),'attachment.upload'));

create policy "avatars readable by authenticated" on storage.objects for select to authenticated
  using (bucket_id = 'avatars');
create policy "own avatar upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own avatar update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);