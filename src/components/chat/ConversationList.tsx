import { useMemo, useState } from "react";
import { Plus, Search, Sparkles, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/lib/chat-data";
import logoAsset from "@/assets/software-vala-logo.jpg";

const filters = ["All Chats", "Unread", "Favorites"] as const;

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onToggleFavorite,
  avatar,
}: {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onToggleFavorite: (id: string) => void;
  avatar: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All Chats");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      const matches =
        !q || c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q);
      const passes =
        filter === "All Chats" ||
        (filter === "Unread" && c.unread > 0) ||
        (filter === "Favorites" && c.favorite);
      return matches && passes;
    });
  }, [conversations, query, filter]);

  return (
    <section className="flex w-full shrink-0 flex-col border-r border-border/60 bg-sidebar/60 backdrop-blur-xl md:w-[330px]">
      <header className="flex items-center gap-3 px-6 pt-6">
        <img
          src={logoAsset}
          alt="Software Vala logo"
          width={44}
          height={44}
          className="size-11 shrink-0 rounded-full bg-card object-contain shadow-float ring-1 ring-border/60"
        />
        <div>
          <p className="font-display text-[15px] leading-tight font-bold tracking-tight">SOFTWARE VALA</p>
          <p className="text-xs text-muted-foreground">Enterprise AI Platform</p>
        </div>
      </header>

      <div className="space-y-3 px-5 pt-5">
        <Button
          onClick={onNewChat}
          className="press h-12 w-full justify-between rounded-2xl bg-brand-gradient text-brand-foreground shadow-glow hover:opacity-95"
        >
          <span className="flex items-center gap-2 font-semibold">
            <Plus className="size-4" /> New Chat
          </span>
          <Sparkles className="size-4" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="h-11 rounded-2xl border-border/70 bg-card pl-9 shadow-3d"
            />
          </div>
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="press grid size-11 shrink-0 place-items-center rounded-2xl border border-border/70 bg-card text-muted-foreground shadow-3d hover:text-brand"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "press rounded-full px-4 py-1.5 text-xs font-semibold",
                filter === f
                  ? "bg-brand text-brand-foreground shadow-glow"
                  : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar mt-4 flex-1 space-y-2 overflow-y-auto px-4 pb-3">
        {visible.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">No conversations found.</p>
        )}
        {visible.map((c) => {
          const isActive = c.id === activeId;
          return (
            <div
              key={c.id}
              className={cn(
                "group relative flex cursor-pointer items-center gap-3 rounded-2xl p-3 transition-all",
                isActive
                  ? "glass shadow-float ring-1 ring-brand/40"
                  : "hover:bg-accent/60",
              )}
              onClick={() => onSelect(c.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(c.id)}
            >
              <div className="relative">
                <img
                  src={c.avatar}
                  alt={c.title}
                  loading="lazy"
                  width={44}
                  height={44}
                  className="size-11 shrink-0 rounded-2xl bg-card object-cover shadow-3d ring-1 ring-border/60"
                />
                {c.online && (
                  <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full bg-online ring-2 ring-sidebar" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{c.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{c.when}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.subtitle}</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                {c.unread > 0 && (
                  <span className="grid size-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
                    {c.unread}
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Toggle favorite"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(c.id);
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-100 data-[on=true]:opacity-100"
                  data-on={c.favorite}
                >
                  <Star
                    className={cn("size-4", c.favorite ? "fill-gold text-gold" : "text-muted-foreground")}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="flex items-center gap-3 border-t border-border/60 px-5 py-4">
        <img
          src={avatar}
          alt="Amit Sharma"
          loading="lazy"
          width={40}
          height={40}
          className="size-10 rounded-xl object-cover ring-2 ring-brand/30"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold">Amit Sharma</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            Admin
          </span>
        </div>
      </footer>
    </section>
  );
}
