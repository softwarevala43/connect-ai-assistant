import { useQuery } from "@tanstack/react-query";
import { Bell, BellOff, FileText, Loader2, Star, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { fetchSharedMedia } from "@/services/chat/chat-service";
import type { ConversationSummary } from "@/services/chat/types";
import { AttachmentCard, UserAvatar } from "./media";

interface ContextPanelProps {
  conversation: ConversationSummary;
  userId: string;
  onClose: () => void;
  onToggleFavorite: () => void;
  onToggleMuted: () => void;
}

export function ContextPanel({
  conversation,
  userId,
  onClose,
  onToggleFavorite,
  onToggleMuted,
}: ContextPanelProps) {
  const media = useQuery({
    queryKey: ["shared-media", conversation.id],
    queryFn: () => fetchSharedMedia(conversation.id),
  });
  const members = conversation.participants.filter((participant) => participant.user_id !== userId);
  const favorite = conversation.membership?.favorite ?? false;
  const muted = conversation.membership?.muted ?? false;

  return (
    <aside className="flex h-full min-w-0 flex-col bg-card/30" aria-label="Conversation details">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-3">
        <div>
          <h2 className="text-sm font-semibold">Details</h2>
          <p className="text-[11px] text-muted-foreground">People and shared files</p>
        </div>
        <Button type="button" size="icon" variant="ghost" className="size-8" onClick={onClose} aria-label="Close details">
          <X className="size-4" />
        </Button>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-3">
          <div className="flex items-center gap-3 py-2">
            <div className="grid size-10 place-items-center rounded-md bg-secondary">
              <Users className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{conversation.subject}</p>
              <p className="text-xs text-muted-foreground">
                {conversation.participants.length} {conversation.participants.length === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" size="sm" className="h-8 justify-start gap-2" onClick={onToggleFavorite}>
              <Star className={favorite ? "size-3.5 fill-current text-primary" : "size-3.5"} />
              {favorite ? "Starred" : "Star"}
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-8 justify-start gap-2" onClick={onToggleMuted}>
              {muted ? <BellOff className="size-3.5" /> : <Bell className="size-3.5" />}
              {muted ? "Muted" : "Mute"}
            </Button>
          </div>

          <Separator className="my-4" />
          <section aria-labelledby="members-heading">
            <h3 id="members-heading" className="mb-2 text-xs font-semibold uppercase text-muted-foreground">People</h3>
            <ul className="space-y-1">
              {conversation.participants.map((participant) => {
                const profile = participant.profile;
                const name = profile?.display_name ?? "Workspace member";
                return (
                  <li key={participant.user_id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
                    <UserAvatar name={name} avatarPath={profile?.avatar_path} presence={profile?.presence} className="size-8" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {name}{participant.user_id === userId ? " (you)" : ""}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {profile?.job_title || (participant.role_label ?? "Member")}
                      </span>
                    </span>
                  </li>
                );
              })}
              {members.length === 0 ? <li className="text-xs text-muted-foreground">Only you are in this conversation.</li> : null}
            </ul>
          </section>

          <Separator className="my-4" />
          <section aria-labelledby="files-heading">
            <h3 id="files-heading" className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Shared files</h3>
            {media.isLoading ? (
              <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Loading files…</div>
            ) : media.isError ? (
              <p className="py-3 text-xs text-destructive">Shared files could not be loaded.</p>
            ) : media.data?.length ? (
              <div className="space-y-2">{media.data.map((item) => <AttachmentCard key={item.id} attachment={item} />)}</div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-dashed border-border/70 p-3 text-xs text-muted-foreground">
                <FileText className="size-4" /> No files shared yet
              </div>
            )}
          </section>
        </div>
      </ScrollArea>
    </aside>
  );
}