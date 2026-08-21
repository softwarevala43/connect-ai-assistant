import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Paperclip,
  SendHorizontal,
  Smile,
  Languages,
  Check,
  CheckCheck,
  Download,
  FileText,
  Image as ImageIcon,
  X,
  Sparkles,
  Loader2,
  PanelRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  emojiGroups,
  languages,
  quickMessages,
  type Conversation,
  type LangCode,
  type Message,
} from "@/lib/chat-data";
import { translateText } from "@/lib/translate";

function Ticks({ read }: { read?: boolean | undefined }) {
  return read ? (
    <CheckCheck className="size-3.5 opacity-80" />
  ) : (
    <Check className="size-3.5 opacity-60" />
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 rounded-full bg-brand"
          style={{ animation: `blink 1.2s ${i * 0.15}s infinite ease-in-out` }}
        />
      ))}
    </span>
  );
}

function Bubble({
  msg,
  lang,
  autoTranslate,
  onReact,
  avatar,
  name,
  myAvatar,
  onLangChange,
}: {
  msg: Message;
  lang: LangCode;
  autoTranslate: boolean;
  onReact: (id: string, emoji: string) => void;
  avatar: string;
  name: string;
  myAvatar: string;
  onLangChange: (l: LangCode) => void;
}) {
  const [translated, setTranslated] = useState(false);
  const mine = msg.from === "me";
  const wantTranslated = translated || (autoTranslate && lang !== "en");

  // Smooth real-time translation status: keep old text visible while "translating".
  const [showTranslated, setShowTranslated] = useState(wantTranslated);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (wantTranslated === showTranslated) return;
    setBusy(true);
    const t = setTimeout(() => {
      setShowTranslated(wantTranslated);
      setBusy(false);
    }, 420);
    return () => clearTimeout(t);
  }, [wantTranslated, showTranslated]);

  const show = (t?: string) => (t && showTranslated ? translateText(t, lang) : t);

  return (
    <div className={cn("animate-pop flex items-end gap-3", mine && "flex-row-reverse")}>
      <img
        src={mine ? myAvatar : avatar}
        alt={mine ? "You" : name}
        loading="lazy"
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-2xl bg-card object-cover shadow-3d ring-1 ring-border/60"
      />


      <div className={cn("group max-w-[min(78%,560px)] space-y-1", mine && "items-end text-right")}>
        <div
          className={cn(
            "relative rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-3d",
            mine
              ? "bg-brand-gradient text-brand-foreground rounded-br-lg"
              : "glass rounded-bl-lg text-card-foreground",
          )}
        >
          {msg.kind === "file" && msg.file ? (
            <div className="flex items-center gap-3 text-left">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                {/\.(png|jpe?g|gif|webp|svg)$/i.test(msg.file.name) ? (
                  <ImageIcon className="size-5" />
                ) : (
                  <FileText className="size-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{msg.file.name}</p>
                <p className="text-xs opacity-70">{msg.file.meta}</p>
              </div>
              <button
                type="button"
                aria-label={`Download ${msg.file.name}`}
                onClick={() => toast.success(`Downloading ${msg.file!.name}`)}
                className="press ml-2 grid size-9 shrink-0 place-items-center rounded-full border border-border/60 bg-card text-brand"
              >
                <Download className="size-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2 text-left">
              {msg.text && <p className="whitespace-pre-wrap">{show(msg.text)}</p>}
              {msg.items && (
                <ul className="space-y-1.5">
                  {msg.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      <span className="font-medium">{show(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div
            className={cn(
              "mt-1.5 flex items-center gap-1 text-[11px] opacity-70",
              mine ? "justify-end" : "justify-start",
            )}
          >
            {(busy || showTranslated) && msg.kind !== "file" && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-1.5 py-px text-[10px] font-semibold",
                  mine ? "bg-brand-foreground/15" : "bg-brand-soft text-brand",
                )}
              >
                {busy ? (
                  <>
                    <Loader2 className="size-2.5 animate-spin" />
                    Translating
                  </>
                ) : (
                  <>
                    <Languages className="size-2.5" />
                    Translated
                  </>
                )}
              </span>
            )}
            {msg.time}
            {mine && <Ticks read={msg.read} />}
          </div>

          {msg.reactions && msg.reactions.length > 0 && (
            <div className="absolute -bottom-3 left-3 flex gap-1 rounded-full border border-border/60 bg-card px-2 py-0.5 text-xs shadow-float">
              {msg.reactions.map((r, i) => (
                <span key={`${r}-${i}`} className="emoji-3d">
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100",
            mine && "justify-end",
          )}
        >
          {["👍", "🙏", "🎉"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onReact(msg.id, r)}
              className="press emoji-3d rounded-full border border-border/60 bg-card px-1.5 text-xs shadow-3d"
            >
              {r}
            </button>
          ))}
          {msg.kind !== "file" && (
            <button
              type="button"
              onClick={() => {
                if (lang === "en") onLangChange("hi");
                setTranslated((v) => !v);
              }}
              disabled={busy}
              className="press flex items-center gap-1 rounded-full border border-border/60 bg-card px-2 py-0.5 text-[11px] font-semibold text-brand shadow-3d"
            >
              {busy ? <Loader2 className="size-3 animate-spin" /> : <Languages className="size-3" />}
              {busy ? "Translating…" : showTranslated ? "Original" : "Translate"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({
  conversation,
  lang,
  onLangChange,
  autoTranslate,
  onToggleAutoTranslate,
  typing,
  onSend,
  onAttach,
  onReact,
  myAvatar,
  profileOpen,
  onToggleProfile,
}: {
  conversation: Conversation;
  lang: LangCode;
  onLangChange: (l: LangCode) => void;
  autoTranslate: boolean;
  onToggleAutoTranslate: () => void;
  typing: boolean;
  onSend: (text: string) => void;
  onAttach: (name: string, meta: string) => void;
  onReact: (id: string, emoji: string) => void;
  myAvatar: string;
  profileOpen: boolean;
  onToggleProfile: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [sendTranslated, setSendTranslated] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [langBusy, setLangBusy] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const activeLang = useMemo(() => languages.find((l) => l.code === lang)!, [lang]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversation.messages;
    return conversation.messages.filter((m) =>
      [m.text, m.file?.name, ...(m.items ?? [])].join(" ").toLowerCase().includes(q),
    );
  }, [conversation.messages, query]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [conversation.messages.length, typing]);

  useEffect(() => {
    if (lang === "en" && !autoTranslate) return;
    setLangBusy(true);
    const t = setTimeout(() => setLangBusy(false), 520);
    return () => clearTimeout(t);
  }, [lang, autoTranslate]);

  useEffect(() => {
    inputRef.current?.focus();
    setQuery("");
    setSearchOpen(false);
  }, [conversation.id]);

  const preview =
    sendTranslated && lang !== "en" && draft.trim() ? translateText(draft, lang) : "";

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(sendTranslated && lang !== "en" ? translateText(text, lang) : text);
    setDraft("");
    inputRef.current?.focus();
  };

  const pickFile = (f: File) => {
    const kb = f.size / 1024;
    onAttach(
      f.name,
      `${(f.type.split("/")[1] || "FILE").toUpperCase()} • ${
        kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`
      }`,
    );
  };

  return (
    <section className="relative flex min-w-0 flex-1 flex-col">
      {/* 3D aurora backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-aurora absolute -top-24 right-0 size-[420px] rounded-full bg-brand/25 blur-[110px]" />
        <div className="animate-aurora absolute bottom-0 left-10 size-[320px] rounded-full bg-gold/25 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center gap-3 border-b border-border/60 bg-surface/70 px-5 py-3 backdrop-blur-xl">
        <div className="relative">
          <img
            src={conversation.avatar}
            alt={conversation.title}
            width={44}
            height={44}
            className="size-11 rounded-2xl bg-card object-cover shadow-3d ring-1 ring-border/60"
          />
          {conversation.online && (
            <span className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full bg-online ring-2 ring-background" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-base leading-tight font-bold">
            {conversation.title}
          </h1>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-online" />
            {typing ? "Typing…" : `Online · ${conversation.channel}`}
          </p>
        </div>

        {searchOpen && (
          <div className="relative w-40 sm:w-56">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in chat..."
              className="h-9 rounded-full border-border/70 bg-card pl-8 text-xs shadow-3d"
            />
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={searchOpen ? "Close search" : "Search in chat"}
              onClick={() => {
                setSearchOpen((v) => !v);
                setQuery("");
              }}
              className="press grid size-9 shrink-0 place-items-center rounded-full border border-border/70 bg-card text-muted-foreground shadow-3d hover:text-brand"
            >
              {searchOpen ? <X className="size-4" /> : <Search className="size-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>{searchOpen ? "Close search" : "Search in chat"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Client profile"
              aria-pressed={profileOpen}
              onClick={onToggleProfile}
              className={cn(
                "press hidden size-9 shrink-0 place-items-center rounded-full border border-border/70 shadow-3d xl:grid",
                profileOpen ? "bg-brand-gradient text-brand-foreground" : "bg-card text-muted-foreground hover:text-brand",
              )}
            >
              <PanelRight className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>{profileOpen ? "Hide client profile" : "Show client profile"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Real-time translation"
              aria-pressed={autoTranslate}
              onClick={onToggleAutoTranslate}
              className={cn(
                "press grid size-9 shrink-0 place-items-center rounded-full border border-border/70 shadow-3d",
                autoTranslate
                  ? "bg-brand-gradient text-brand-foreground shadow-glow"
                  : "bg-card text-muted-foreground hover:text-brand",
              )}
            >
              <Languages className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            {autoTranslate ? "Real-time translation ON" : "Real-time translation OFF"}
          </TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="press h-9 gap-2 rounded-full border-border/70 bg-card px-3 shadow-3d"
            >
              <Languages className="size-4 text-brand" />
              <span className="text-xs font-semibold">
                <span className="emoji-3d">{activeLang.flag}</span> {activeLang.label}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl">
            <DropdownMenuLabel>Chat translation language</DropdownMenuLabel>
            {languages.map((l) => (
              <DropdownMenuItem key={l.code} onClick={() => onLangChange(l.code)} className="gap-2">
                <span className="emoji-3d">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {l.code === lang && <Check className="size-4 text-brand" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={onToggleAutoTranslate} className="gap-2">
              <Sparkles className="size-4 text-gold" />
              <span className="flex-1">Real-time auto translate</span>
              {autoTranslate && <Check className="size-4 text-brand" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="no-scrollbar relative z-10 flex-1 space-y-6 overflow-y-auto px-5 py-6 md:px-8">
        <div className="flex justify-center">
          <span className="glass rounded-full px-4 py-1 text-xs font-semibold text-muted-foreground shadow-3d">
            Today
          </span>
        </div>
        {visible.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">No messages match your search.</p>
        )}
        {visible.map((m) => (
          <Bubble
            key={m.id}
            msg={m}
            lang={lang}
            autoTranslate={autoTranslate}
            onReact={onReact}
            avatar={conversation.avatar}
            name={conversation.title}
            myAvatar={myAvatar}
            onLangChange={onLangChange}
          />

        ))}
        {typing && (
          <div className="flex items-end gap-3">
            <img
              src={conversation.avatar}
              alt={conversation.title}
              loading="lazy"
              width={40}
              height={40}
              className="size-10 rounded-2xl bg-card object-cover shadow-3d ring-1 ring-border/60"
            />
            <div className="glass rounded-3xl rounded-bl-lg px-5 py-4 shadow-3d">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <footer className="relative z-10 space-y-2 px-5 pb-4 md:px-8">
        {/* Quick business messages */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
          {quickMessages.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setDraft(q);
                inputRef.current?.focus();
              }}
              className="press shrink-0 rounded-full border border-border/60 bg-card px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-3d hover:text-brand"
            >
              <span className="emoji-3d">{q}</span>
            </button>
          ))}
        </div>

        {/* Translation bar — kept outside the chat bubbles, slim on every screen */}
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto rounded-full border border-border/60 bg-card/80 px-2.5 py-1 shadow-3d backdrop-blur-xl sm:gap-2 sm:px-3">
          <Languages className="size-3.5 shrink-0 text-brand" />
          <span className="hidden shrink-0 text-[11px] font-semibold text-muted-foreground sm:inline">
            Translate
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="press shrink-0 rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand"
              >
                <span className="emoji-3d">{activeLang.flag}</span> {activeLang.label}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 rounded-2xl">
              {languages.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => onLangChange(l.code)} className="gap-2">
                  <span className="emoji-3d">{l.flag}</span>
                  <span className="flex-1">{l.label}</span>
                  {l.code === lang && <Check className="size-4 text-brand" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={onToggleAutoTranslate}
            aria-pressed={autoTranslate}
            className={cn(
              "press shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
              autoTranslate
                ? "bg-brand-gradient text-brand-foreground shadow-glow"
                : "bg-muted text-muted-foreground",
            )}
          >
            Auto chat {autoTranslate ? "ON" : "OFF"}
          </button>

          <button
            type="button"
            onClick={() => setSendTranslated((v) => !v)}
            aria-pressed={sendTranslated}
            className={cn(
              "press shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
              sendTranslated
                ? "bg-gold-gradient text-gold-foreground shadow-glow"
                : "bg-muted text-muted-foreground",
            )}
          >
            My message {sendTranslated ? "ON" : "OFF"}
          </button>

          {langBusy && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
              <Loader2 className="size-3 animate-spin" /> Syncing…
            </span>
          )}

          {!langBusy && preview && (
            <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
              → {preview}
            </span>
          )}
        </div>

        {/* Slim composer — only the chat text lives inside */}
        <div className="glass flex items-center gap-1.5 rounded-full px-2 py-1.5 shadow-float">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
              e.target.value = "";
            }}
          />
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
              e.target.value = "";
            }}
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Send photo"
                onClick={() => photoRef.current?.click()}
                className="press grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-brand"
              >
                <ImageIcon className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Photo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Attach document"
                onClick={() => fileRef.current?.click()}
                className="press grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-brand"
              >
                <Paperclip className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Document / file</TooltipContent>
          </Tooltip>

          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={`Type your message in ${activeLang.label}...`}
            className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Emoji picker"
                className="press grid size-9 shrink-0 place-items-center rounded-full text-gold hover:bg-accent"
              >
                <Smile className="size-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 rounded-3xl p-3">
              <div className="no-scrollbar max-h-72 space-y-3 overflow-y-auto">
                {emojiGroups.map((g) => (
                  <div key={g.label}>
                    <p className="mb-1 text-[11px] font-semibold text-muted-foreground uppercase">
                      {g.label}
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                      {g.emojis.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => {
                            setDraft((d) => d + e);
                            inputRef.current?.focus();
                          }}
                          className="press emoji-3d rounded-lg py-1 text-lg hover:bg-accent"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <button
            type="button"
            aria-label="Send message"
            onClick={submit}
            className="press grid size-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-gold-foreground shadow-glow"
          >
            <SendHorizontal className="size-4" />
          </button>
        </div>

        <p className="px-2 text-center text-[11px] text-muted-foreground">
          Software Vala · end-to-end encrypted · live translation {autoTranslate ? "on" : "off"}
        </p>
      </footer>
    </section>
  );
}
