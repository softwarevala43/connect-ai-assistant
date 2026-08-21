import { useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  FileText,
  Globe2,
  Image as ImageIcon,
  Languages,
  Mail,
  MapPin,
  Phone,
  Pin,
  Star,
  BellOff,
  Bell,
  ShieldCheck,
  Sparkles,
  X,
  ChevronRight,
  Camera,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Conversation } from "@/lib/chat-data";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/70 px-3 py-2.5 shadow-3d">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="truncate text-[13px] font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function ClientProfilePanel({
  conversation,
  onClose,
  onToggleFavorite,
  onEditProfile,
}: {
  conversation: Conversation;
  onClose: () => void;
  onToggleFavorite: () => void;
  onEditProfile: () => void;
}) {
  const p = conversation.profile;
  const [muted, setMuted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [tab, setTab] = useState<"docs" | "media">("docs");

  const files = useMemo(
    () => conversation.messages.filter((m) => m.kind === "file" && m.file).map((m) => m.file!),
    [conversation.messages],
  );
  const media = files.filter((f) => /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name));
  const docs = files.filter((f) => !/\.(png|jpe?g|gif|webp|svg)$/i.test(f.name));
  const list = tab === "docs" ? docs : media;

  return (
    <aside className="no-scrollbar relative z-10 flex w-[320px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-border/60 bg-sidebar/70 px-4 py-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold tracking-tight">Client Profile</p>
        <button
          type="button"
          aria-label="Close profile panel"
          onClick={onClose}
          className="press grid size-8 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-3d hover:text-brand"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="glass flex flex-col items-center gap-2 rounded-3xl p-4 text-center shadow-float">
        <div className="relative">
          <img
            src={conversation.avatar}
            alt={p.name}
            width={84}
            height={84}
            className="size-20 rounded-3xl bg-card object-cover shadow-3d ring-1 ring-border/60"
          />
          {conversation.online && (
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-online ring-2 ring-background" />
          )}
          <button
            type="button"
            aria-label="Change client photo"
            onClick={onEditProfile}
            className="press absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full bg-brand-gradient text-brand-foreground shadow-glow"
          >
            <Camera className="size-4" />
          </button>
        </div>
        <div>
          <p className="font-display text-base font-bold">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.role}</p>
        </div>
        <span className="rounded-full bg-brand-gradient px-3 py-0.5 text-[10px] font-bold text-brand-foreground shadow-glow">
          {p.plan}
        </span>

        <button
          type="button"
          onClick={onEditProfile}
          className="press mt-1 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-semibold text-brand shadow-3d"
        >
          <Pencil className="size-3" /> Edit profile
        </button>

        <div className="mt-1 flex items-center gap-2">
          {[
            {
              key: "fav",
              icon: Star,
              label: conversation.favorite ? "Remove favorite" : "Mark favorite",
              on: conversation.favorite,
              run: () => {
                onToggleFavorite();
                toast.success(conversation.favorite ? "Removed from favorites" : "Added to favorites");
              },
            },
            {
              key: "mute",
              icon: muted ? BellOff : Bell,
              label: muted ? "Unmute chat" : "Mute chat",
              on: muted,
              run: () => {
                setMuted((v) => !v);
                toast.success(muted ? "Notifications on" : "Chat muted");
              },
            },
            {
              key: "pin",
              icon: Pin,
              label: pinned ? "Unpin chat" : "Pin chat",
              on: pinned,
              run: () => {
                setPinned((v) => !v);
                toast.success(pinned ? "Chat unpinned" : "Chat pinned to top");
              },
            },
          ].map((a) => (
            <Tooltip key={a.key}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={a.label}
                  aria-pressed={a.on}
                  onClick={a.run}
                  className={cn(
                    "press grid size-10 place-items-center rounded-2xl border border-border/60 shadow-3d",
                    a.on ? "bg-gold-gradient text-gold-foreground" : "bg-card text-muted-foreground hover:text-brand",
                  )}
                >
                  <a.icon className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{a.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Tickets", value: String(p.stats.openTickets) },
          { label: "Projects", value: String(p.stats.projects) },
          { label: "CSAT", value: p.stats.satisfaction },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border/60 bg-card/70 px-2 py-2.5 text-center shadow-3d"
          >
            <p className="font-display text-base font-bold text-brand">{s.value}</p>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Row icon={Building2} label="Company" value={p.company} />
        <Row icon={Mail} label="Email" value={p.email} />
        <Row icon={Phone} label="Phone" value={p.phone} />
        <Row icon={MapPin} label="Location" value={p.location} />
        <Row icon={Languages} label="Preferred language" value={p.language} />
        <Row icon={CalendarClock} label="Client since" value={p.since} />
        <Row icon={Globe2} label="Channel" value={conversation.channel} />
      </div>

      <div>
        <p className="mb-2 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          Labels
        </p>
        <div className="flex flex-wrap gap-1.5">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-3d">
        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
          <Sparkles className="size-3 text-gold" /> Account note
        </p>
        <p className="text-[13px] leading-relaxed">{p.notes}</p>
      </div>

      <div>
        <div className="mb-2 flex gap-1.5">
          {(["docs", "media"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "press rounded-full px-3 py-1 text-[11px] font-semibold",
                tab === t ? "bg-brand text-brand-foreground shadow-glow" : "bg-muted text-muted-foreground",
              )}
            >
              {t === "docs" ? "Documents" : "Photos"}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/70 px-3 py-4 text-center text-[12px] text-muted-foreground">
            No shared {tab === "docs" ? "documents" : "photos"} yet.
          </p>
        ) : (
          <div className="space-y-1.5">
            {list.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => toast.success(`Opening ${f.name}`)}
                className="press flex w-full items-center gap-2.5 rounded-2xl border border-border/60 bg-card/70 px-3 py-2 text-left shadow-3d hover:text-brand"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  {tab === "docs" ? <FileText className="size-4" /> : <ImageIcon className="size-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold">{f.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{f.meta}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-auto flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5 text-online" /> Verified business client
      </p>
    </aside>
  );
}
