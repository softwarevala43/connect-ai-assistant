import { ArrowLeft, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConnectionState, PendingMessage } from "@/hooks/use-chat";
import type { ChatMessage, DraftAttachment, Participant, Profile } from "@/services/chat/types";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

interface ThreadPanelProps {
  root: ChatMessage;
  replies: ChatMessage[];
  pending: PendingMessage[];
  userId: string;
  profilesById: Map<string, Profile>;
  participants: Participant[];
  typingUsers: string[];
  connection: ConnectionState;
  uploads: DraftAttachment[];
  sending: boolean;
  canSend: boolean;
  canUpload: boolean;
  canMention: boolean;
  canReact: boolean;
  canBookmark: boolean;
  enterToSend: boolean;
  translateTarget: string;
  density: "comfortable" | "compact";
  onClose: () => void;
  onSend: (body: string, mentions: string[]) => Promise<unknown>;
  onQueueFiles: (files: File[]) => void;
  onCancelUpload: (id: string) => void;
  onTyping: (typing: boolean) => void;
  onReact: (messageId: string, emoji: string, active: boolean) => void;
  onBookmark: (messageId: string, pinned: boolean, active: boolean) => void;
  onRetry: (clientRef: string) => void;
  onDiscard: (clientRef: string) => void;
}

export function ThreadPanel(props: ThreadPanelProps) {
  const { root, replies } = props;
  return (
    <aside className="flex h-full min-w-0 flex-col bg-card/40" aria-label="Message thread">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-3">
        <Button type="button" size="icon" variant="ghost" className="size-8 lg:hidden" onClick={props.onClose} aria-label="Back to conversation">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">Thread</h2>
          <p className="text-[11px] text-muted-foreground">{replies.length} {replies.length === 1 ? "reply" : "replies"}</p>
        </div>
        <Button type="button" size="icon" variant="ghost" className="size-8" onClick={props.onClose} aria-label="Close thread">
          <X className="size-4" />
        </Button>
      </header>
      <div className="border-b border-border/60 bg-secondary/20 px-3 py-2">
        <div className="flex items-start gap-2 text-xs">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="line-clamp-3 whitespace-pre-wrap text-muted-foreground">{root.body || "Attachment"}</p>
        </div>
      </div>
      <MessageList
        messages={replies}
        pending={props.pending.filter((message) => message.parent_id === root.id)}
        userId={props.userId}
        profilesById={props.profilesById}
        typingUsers={props.typingUsers}
        connection={props.connection}
        canReact={props.canReact}
        canReply={false}
        canBookmark={props.canBookmark}
        translateTarget={props.translateTarget}
        density={props.density}
        onReact={props.onReact}
        onBookmark={props.onBookmark}
        onReply={() => undefined}
        onOpenThread={() => undefined}
        onRetry={props.onRetry}
        onDiscard={props.onDiscard}
      />
      <Composer
        canSend={props.canSend}
        canUpload={props.canUpload}
        canMention={props.canMention}
        participants={props.participants}
        profilesById={props.profilesById}
        uploads={props.uploads}
        replyTo={root}
        sending={props.sending}
        enterToSend={props.enterToSend}
        onQueueFiles={props.onQueueFiles}
        onCancelUpload={props.onCancelUpload}
        onCancelReply={props.onClose}
        onSend={props.onSend}
        onTyping={props.onTyping}
      />
    </aside>
  );
}