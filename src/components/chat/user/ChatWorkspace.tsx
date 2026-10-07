import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, ChevronDown, ChevronUp, Info, Languages, Loader2, Menu,
  MessageSquare, Search, Settings, UserRound, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useConversationRealtime, useConversations, useMessageActions, useMessages,
  useReadReceipts, useSendMessage,
} from "@/hooks/use-chat";
import { playCue, usePreferences } from "@/hooks/use-preferences";
import { useMyPermissions, useMyProfile, useSupabaseSession } from "@/hooks/use-session";
import { setFavorite, setMuted, updatePresence } from "@/services/chat/chat-service";
import type { ChatMessage, Profile } from "@/services/chat/types";
import { cn } from "@/lib/utils";
import { Composer } from "./Composer";
import { ContextPanel } from "./ContextPanel";
import { ConversationSidebar } from "./ConversationSidebar";
import { MessageList } from "./MessageList";
import { NewConversationDialog } from "./NewConversationDialog";
import { PreferencesDialog } from "./PreferencesDialog";
import { ProfileDialog } from "./ProfileDialog";
import { ThreadPanel } from "./ThreadPanel";
import { UserAvatar } from "./media";

function ChatLoading() {
  return (
    <div className="grid h-dvh place-items-center bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Opening your workspace…
      </div>
    </div>
  );
}

function SignedOutState() {
  return (
    <main className="grid h-dvh place-items-center bg-background px-5">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-md border border-border bg-card">
          <MessageSquare className="size-5 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your Software Vala account to open your conversations and files.
        </p>
        <Button asChild className="mt-5"><a href="/">Return to Software Vala</a></Button>
      </div>
    </main>
  );
}

export function ChatWorkspace() {
  const queryClient = useQueryClient();
  const { session, userId, loading: sessionLoading } = useSupabaseSession();
  const profileQuery = useMyProfile(userId);
  const permissionQuery = useMyPermissions(userId);
  const conversationQuery = useConversations(userId);
  const { prefs, update } = usePreferences();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileList, setMobileList] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [threadRoot, setThreadRoot] = useState<ChatMessage | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const [newOpen, setNewOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const conversations = conversationQuery.data ?? [];
  useEffect(() => {
    if (!activeId && conversations.length > 0) setActiveId(conversations[0]?.id ?? null);
    if (activeId && conversations.length > 0 && !conversations.some((item) => item.id === activeId)) {
      setActiveId(conversations[0]?.id ?? null);
    }
  }, [activeId, conversations]);

  const active = conversations.find((item) => item.id === activeId) ?? null;
  const messagesQuery = useMessages(activeId, userId);
  const messages = messagesQuery.data ?? [];
  const mainMessages = useMemo(() => messages.filter((message) => !message.parent_id), [messages]);
  const profilesById = useMemo(() => {
    const map = new Map<string, Profile>();
    for (const participant of active?.participants ?? []) {
      if (participant.profile) map.set(participant.user_id, participant.profile);
    }
    if (userId && profileQuery.data) map.set(userId, profileQuery.data);
    return map;
  }, [active, profileQuery.data, userId]);

  const handleIncoming = useCallback(() => playCue("incoming", prefs.sound && !(active?.membership?.muted ?? false)), [prefs.sound, active?.membership?.muted]);
  const realtime = useConversationRealtime({
    conversationId: activeId,
    userId,
    displayName: profileQuery.data?.display_name ?? "Workspace member",
    onIncomingMessage: handleIncoming,
  });
  const sender = useSendMessage(activeId, userId);
  const actions = useMessageActions(activeId, userId);
  useReadReceipts(activeId, userId, messages);

  useEffect(() => {
    if (!userId) return;
    void updatePresence(userId, "online");
    const heartbeat = window.setInterval(() => void updatePresence(userId, document.hidden ? "away" : "online"), 45_000);
    const visibility = () => void updatePresence(userId, document.hidden ? "away" : "online");
    const leave = () => void updatePresence(userId, "offline");
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("beforeunload", leave);
    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("beforeunload", leave);
      void updatePresence(userId, "offline");
    };
  }, [userId]);

  const searchResults = useMemo(() => {
    const clean = searchTerm.trim().toLowerCase();
    return clean ? messages.filter((message) => message.body.toLowerCase().includes(clean)) : [];
  }, [messages, searchTerm]);
  useEffect(() => setSearchIndex(0), [searchTerm]);
  const highlightedId = searchResults[searchIndex]?.id ?? null;

  const send = async (body: string, mentions: string[], parentId?: string | null) => {
    setSending(true);
    try {
      const result = await sender.send({ body, mentions, parentId: parentId ?? replyTo?.id ?? null });
      setReplyTo(null);
      playCue("sent", prefs.sound);
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Message could not be sent");
      return undefined;
    } finally {
      setSending(false);
    }
  };

  const mutateMembership = async (kind: "favorite" | "muted") => {
    if (!active || !userId) return;
    const current = kind === "favorite" ? active.membership?.favorite ?? false : active.membership?.muted ?? false;
    try {
      if (kind === "favorite") await setFavorite(active.id, userId, !current);
      else await setMuted(active.id, userId, !current);
      await queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Conversation preference could not be updated");
    }
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    setMobileList(false);
    setDetailsOpen(false);
    setThreadRoot(null);
    setReplyTo(null);
    setSearchOpen(false);
  };

  if (sessionLoading) return <ChatLoading />;
  if (!session || !userId) return <SignedOutState />;

  const can = permissionQuery.can;
  const profileButton = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setProfileOpen(true)} aria-label="Open my profile">
          <UserAvatar name={profileQuery.data?.display_name ?? "Me"} avatarPath={profileQuery.data?.avatar_path} className="size-7" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>My profile</TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <main className="h-dvh overflow-hidden bg-background text-foreground">
        <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[292px_minmax(0,1fr)]">
          <div className={cn("min-h-0 md:block", !mobileList && "hidden")}>
            <ConversationSidebar
              conversations={conversations}
              loading={conversationQuery.isLoading}
              activeId={activeId}
              userId={userId}
              onSelect={selectConversation}
              onNew={() => setNewOpen(true)}
              canCreate={can("conversation.create")}
              profileAction={profileButton}
            />
          </div>

          <section className={cn("relative min-h-0 min-w-0", mobileList ? "hidden md:block" : "block")} aria-label="Active conversation">
            {!active ? (
              <div className="grid h-full place-items-center px-6 text-center">
                <div>
                  <div className="mx-auto grid size-11 place-items-center rounded-md border border-border bg-card"><MessageSquare className="size-5 text-primary" /></div>
                  <h1 className="mt-4 text-base font-semibold">{conversationQuery.isError ? "Conversations unavailable" : "No conversation selected"}</h1>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {conversationQuery.isError ? "Refresh the page and try again." : "Select a conversation or start a new one."}
                  </p>
                  {can("conversation.create") ? <Button size="sm" className="mt-4" onClick={() => setNewOpen(true)}>New conversation</Button> : null}
                </div>
              </div>
            ) : (
              <div className={cn("grid h-full min-h-0", detailsOpen || threadRoot ? "xl:grid-cols-[minmax(0,1fr)_340px]" : "grid-cols-1")}>
                <div className={cn("flex min-h-0 min-w-0 flex-col", threadRoot && "hidden lg:flex")}>
                  <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-card/40 px-2 sm:px-3">
                    <Button type="button" size="icon" variant="ghost" className="size-8 md:hidden" onClick={() => setMobileList(true)} aria-label="Back to conversations">
                      <ArrowLeft className="size-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h1 className="truncate text-sm font-semibold">{active.subject}</h1>
                        {active.reference_code ? <span className="shrink-0 rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{active.reference_code}</span> : null}
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {realtime.onlineUsers.length > 0 ? `${realtime.onlineUsers.length} online` : `${active.participants.length} members`} · {realtime.connection}
                      </p>
                    </div>
                    {searchOpen ? (
                      <div className="absolute inset-x-1 top-1 z-20 flex h-12 items-center gap-1 rounded-md border border-border bg-popover px-2 shadow-sm sm:static sm:h-auto sm:w-72 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                        <Search className="size-3.5 shrink-0 text-muted-foreground" />
                        <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search this conversation" aria-label="Search this conversation" className="h-8 min-w-0 flex-1" autoFocus />
                        <span className="whitespace-nowrap text-[10px] text-muted-foreground">{searchResults.length ? `${searchIndex + 1}/${searchResults.length}` : "0"}</span>
                        <Button type="button" size="icon" variant="ghost" className="size-7" disabled={searchResults.length === 0} onClick={() => setSearchIndex((index) => (index - 1 + searchResults.length) % searchResults.length)} aria-label="Previous result"><ChevronUp className="size-3.5" /></Button>
                        <Button type="button" size="icon" variant="ghost" className="size-7" disabled={searchResults.length === 0} onClick={() => setSearchIndex((index) => (index + 1) % searchResults.length)} aria-label="Next result"><ChevronDown className="size-3.5" /></Button>
                        <Button type="button" size="icon" variant="ghost" className="size-7" onClick={() => { setSearchOpen(false); setSearchTerm(""); }} aria-label="Close search"><X className="size-3.5" /></Button>
                      </div>
                    ) : (
                      <Button type="button" size="icon" variant="ghost" className="size-8" onClick={() => setSearchOpen(true)} aria-label="Search conversation"><Search className="size-4" /></Button>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" size="icon" variant={prefs.autoTranslate ? "secondary" : "ghost"} className="size-8" onClick={() => update({ autoTranslate: !prefs.autoTranslate })} aria-label="Toggle real-time translation" aria-pressed={prefs.autoTranslate}>
                          <Languages className="size-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{prefs.autoTranslate ? "Real-time translation on" : "Turn on real-time translation"}</TooltipContent>
                    </Tooltip>
                    <Button type="button" size="icon" variant="ghost" className="size-8" onClick={() => { setThreadRoot(null); setDetailsOpen((open) => !open); }} aria-label="Conversation details" aria-pressed={detailsOpen}>
                      <Info className="size-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="size-8" onClick={() => setPreferencesOpen(true)} aria-label="Preferences">
                      <Settings className="size-4" />
                    </Button>
                  </header>

                  {messagesQuery.isLoading ? (
                    <div className="grid min-h-0 flex-1 place-items-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
                  ) : messagesQuery.isError ? (
                    <div className="grid min-h-0 flex-1 place-items-center px-5 text-center"><p className="text-sm text-destructive">Messages could not be loaded. Refresh and try again.</p></div>
                  ) : (
                    <MessageList
                      messages={mainMessages}
                      pending={sender.pending.filter((message) => !message.parent_id)}
                      userId={userId}
                      profilesById={profilesById}
                      typingUsers={realtime.typingUsers}
                      connection={realtime.connection}
                      canReact={can("message.react")}
                      canReply={can("message.reply")}
                      canBookmark={can("message.bookmark")}
                      translateTarget={prefs.language}
                      autoTranslate={prefs.autoTranslate}
                      density={prefs.density}
                      highlightId={highlightedId}
                      onReact={(id, emoji, activeState) => void actions.react(id, emoji, activeState).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Reaction failed"))}
                      onBookmark={(id, pinned, activeState) => void actions.bookmark(id, pinned, activeState).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Bookmark failed"))}
                      onReply={setReplyTo}
                      onOpenThread={(message) => { setDetailsOpen(false); setThreadRoot(message); }}
                      onRetry={(clientRef) => void sender.retry(clientRef).catch(() => undefined)}
                      onDiscard={sender.discard}
                    />
                  )}
                  <Composer
                    canSend={can("message.send")}
                    canUpload={can("attachment.upload")}
                    canMention={can("mention.use")}
                    participants={active.participants}
                    profilesById={profilesById}
                    uploads={sender.uploads}
                    replyTo={replyTo}
                    sending={sending}
                    enterToSend={prefs.enterToSend}
                    onQueueFiles={sender.queueFiles}
                    onCancelUpload={sender.cancelUpload}
                    onCancelReply={() => setReplyTo(null)}
                    onSend={(body, mentions) => send(body, mentions)}
                    onTyping={realtime.broadcastTyping}
                  />
                </div>

                {detailsOpen ? (
                  <div className="absolute inset-0 z-30 border-l border-border/60 bg-background lg:left-auto lg:w-[340px] xl:static xl:w-auto">
                    <ContextPanel conversation={active} userId={userId} onClose={() => setDetailsOpen(false)} onToggleFavorite={() => void mutateMembership("favorite")} onToggleMuted={() => void mutateMembership("muted")} />
                  </div>
                ) : null}
                {threadRoot ? (
                  <div className="absolute inset-0 z-30 border-l border-border/60 bg-background lg:static">
                    <ThreadPanel
                      root={threadRoot}
                      replies={messages.filter((message) => message.parent_id === threadRoot.id)}
                      pending={sender.pending}
                      userId={userId}
                      profilesById={profilesById}
                      participants={active.participants}
                      typingUsers={realtime.typingUsers}
                      connection={realtime.connection}
                      uploads={sender.uploads}
                      sending={sending}
                      canSend={can("message.send") && can("message.reply")}
                      canUpload={can("attachment.upload")}
                      canMention={can("mention.use")}
                      canReact={can("message.react")}
                      canBookmark={can("message.bookmark")}
                      enterToSend={prefs.enterToSend}
                      translateTarget={prefs.language}
                      density={prefs.density}
                      onClose={() => setThreadRoot(null)}
                      onSend={(body, mentions) => send(body, mentions, threadRoot.id)}
                      onQueueFiles={sender.queueFiles}
                      onCancelUpload={sender.cancelUpload}
                      onTyping={realtime.broadcastTyping}
                      onReact={(id, emoji, activeState) => void actions.react(id, emoji, activeState)}
                      onBookmark={(id, pinned, activeState) => void actions.bookmark(id, pinned, activeState)}
                      onRetry={(clientRef) => void sender.retry(clientRef)}
                      onDiscard={sender.discard}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>

        <NewConversationDialog open={newOpen} onOpenChange={setNewOpen} userId={userId} onCreated={(id) => { void queryClient.invalidateQueries({ queryKey: ["conversations", userId] }); selectConversation(id); }} />
        <PreferencesDialog open={preferencesOpen} onOpenChange={setPreferencesOpen} prefs={prefs} update={update} />
        <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} userId={userId} profile={profileQuery.data ?? null} />
      </main>
    </TooltipProvider>
  );
}