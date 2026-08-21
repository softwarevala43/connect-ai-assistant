import { useCallback, useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { IconRail } from "./IconRail";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { ClientProfilePanel } from "./ClientProfilePanel";
import {
  aiReplies,
  conversations as seed,
  now,
  valaLogo,
  type Conversation,
  type LangCode,
} from "@/lib/chat-data";
import { translateText } from "@/lib/translate";
import { ProfileEditDialog, type ProfileDraft } from "./ProfileEditDialog";
import { SettingsDialog } from "./SettingsDialog";
import avatarAsset from "@/assets/avatar-amit.jpg";

export function ChatPlatform() {
  const [items, setItems] = useState<Conversation[]>(() =>
    seed.map((c, i) => (i === 0 ? { ...c, unread: 0 } : c)),
  );
  const [activeId, setActiveId] = useState(seed[0]!.id);
  const [lang, setLang] = useState<LangCode>("en");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [typing, setTyping] = useState(false);
  const [dark, setDark] = useState(true);
  const [profileOpen, setProfileOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [meOpen, setMeOpen] = useState(false);
  const [clientOpen, setClientOpen] = useState(false);
  const [me, setMe] = useState<ProfileDraft>({
    avatar: avatarAsset,
    name: "Amit Sharma",
    role: "Workspace Admin",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const active = items.find((c) => c.id === activeId) ?? items[0]!;

  const patch = useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setItems((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const select = (id: string) => {
    setActiveId(id);
    patch(id, (c) => ({ ...c, unread: 0 }));
  };

  const newChat = () => {
    const id = `chat-${Date.now()}`;
    const fresh: Conversation = {
      id,
      title: "New Conversation",
      subtitle: "Start chatting with Vala AI",
      emoji: "✨",
      avatar: valaLogo,
      tint: "from-[oklch(0.78_0.15_275)] to-[oklch(0.62_0.2_300)]",
      when: now(),
      unread: 0,
      favorite: false,
      online: true,
      channel: "AI Assistant",
      profile: {
        name: "New Client",
        company: "—",
        role: "Prospect",
        email: "—",
        phone: "—",
        location: "—",
        since: "Today",
        plan: "Trial",
        language: "English",
        tags: ["New Lead"],
        notes: "Fresh conversation started from the Software Vala console.",
        stats: { openTickets: 0, projects: 0, satisfaction: "—" },
      },
      messages: [
        {
          id: `m-${Date.now()}`,
          from: "ai",
          kind: "text",
          text: "Hi Amit! 👋 I'm Vala AI. Ask me anything about your workspace, reports or automations.",
          time: now(),
        },
      ],
    };
    setItems((prev) => [fresh, ...prev]);
    setActiveId(id);
  };

  const send = (text: string) => {
    const id = active.id;
    const stamp = now();
    patch(id, (c) => ({
      ...c,
      subtitle: text,
      when: stamp,
      title: c.title === "New Conversation" ? text.slice(0, 26) : c.title,
      messages: [
        ...c.messages,
        { id: `u-${Date.now()}`, from: "me", kind: "text", text, time: stamp, read: false },
      ],
    }));

    setTimeout(() => {
      patch(id, (c) => ({
        ...c,
        messages: c.messages.map((m) => (m.from === "me" ? { ...m, read: true } : m)),
      }));
      setTyping(true);
    }, 500);

    setTimeout(() => {
      const base = aiReplies[Math.floor(Math.random() * aiReplies.length)]!;
      const reply = autoTranslate ? translateText(base, lang) : base;
      setTyping(false);
      patch(id, (c) => ({
        ...c,
        subtitle: reply,
        when: now(),
        messages: [...c.messages, { id: `a-${Date.now()}`, from: "ai", kind: "text", text: reply, time: now() }],
      }));
    }, 1900);
  };

  const attach = (name: string, meta: string) => {
    patch(active.id, (c) => ({
      ...c,
      subtitle: `📎 ${name}`,
      when: now(),
      messages: [
        ...c.messages,
        { id: `f-${Date.now()}`, from: "me", kind: "file", file: { name, meta }, time: now(), read: false },
      ],
    }));
  };

  const react = (msgId: string, emoji: string) => {
    patch(active.id, (c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.id === msgId
          ? {
              ...m,
              reactions: m.reactions?.includes(emoji)
                ? m.reactions.filter((r) => r !== emoji)
                : [...(m.reactions ?? []), emoji],
            }
          : m,
      ),
    }));
  };

  return (
    <TooltipProvider delayDuration={200}>
      <main className="flex h-screen w-full overflow-hidden bg-background p-0 lg:p-4">
        <div className="glass flex h-full w-full overflow-hidden rounded-none shadow-float lg:rounded-[32px]">
          <IconRail
            avatar={me.avatar}
            dark={dark}
            onToggleTheme={() => setDark((v) => !v)}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenProfile={() => setMeOpen(true)}
          />
          <div className="hidden md:flex">
            <ConversationList
              conversations={items}
              activeId={active.id}
              onSelect={select}
              onNewChat={newChat}
              onToggleFavorite={(id) => patch(id, (c) => ({ ...c, favorite: !c.favorite }))}
              avatar={me.avatar}
            />
          </div>
          <ChatWindow
            conversation={active}
            lang={lang}
            onLangChange={setLang}
            autoTranslate={autoTranslate}
            onToggleAutoTranslate={() => setAutoTranslate((v) => !v)}
            typing={typing}
            onSend={send}
            onAttach={attach}
            onReact={react}
            myAvatar={me.avatar}
            profileOpen={profileOpen}
            onToggleProfile={() => setProfileOpen((v) => !v)}
          />
          {profileOpen && (
            <div className="hidden xl:flex">
              <ClientProfilePanel
                conversation={active}
                onClose={() => setProfileOpen(false)}
                onToggleFavorite={() => patch(active.id, (c) => ({ ...c, favorite: !c.favorite }))}
                onEditProfile={() => setClientOpen(true)}
              />
            </div>
          )}
        </div>

        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          dark={dark}
          onToggleTheme={() => setDark((v) => !v)}
          lang={lang}
          onLangChange={setLang}
          autoTranslate={autoTranslate}
          onToggleAutoTranslate={() => setAutoTranslate((v) => !v)}
          onOpenProfile={() => setMeOpen(true)}
        />

        <ProfileEditDialog
          open={meOpen}
          onOpenChange={setMeOpen}
          mode="me"
          value={me}
          onSave={setMe}
        />

        <ProfileEditDialog
          open={clientOpen}
          onOpenChange={setClientOpen}
          mode="client"
          value={{
            avatar: active.avatar,
            name: active.profile.name,
            role: active.profile.role,
            company: active.profile.company,
            email: active.profile.email,
            phone: active.profile.phone,
            location: active.profile.location,
            language: active.profile.language,
            tags: active.profile.tags.join(", "),
            notes: active.profile.notes,
          }}
          onSave={(next) =>
            patch(active.id, (c) => ({
              ...c,
              avatar: next.avatar,
              title: next.name,
              profile: {
                ...c.profile,
                name: next.name,
                role: next.role,
                company: next.company || c.profile.company,
                email: next.email || c.profile.email,
                phone: next.phone || c.profile.phone,
                location: next.location || c.profile.location,
                language: next.language || c.profile.language,
                tags: (next.tags ?? "")
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
                notes: next.notes ?? c.profile.notes,
              },
            }))
          }
        />
      </main>
    </TooltipProvider>
  );
}
