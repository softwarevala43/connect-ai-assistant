import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  MessageSquare,
  Users,
  Clock,
  Star,
  BellDot,
  Languages,
  TrendingUp,
} from "lucide-react";
import { conversations, valaLogo } from "@/lib/chat-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Chat Manager Dashboard · Software Vala" },
      {
        name: "description",
        content:
          "Chat Manager dashboard for Software Vala — live client conversation volume, unread queue, response health, channel split and translation activity.",
      },
      { property: "og:title", content: "Chat Manager Dashboard · Software Vala" },
      {
        property: "og:description",
        content:
          "Monitor client chats, unread queue, satisfaction and channel performance from one premium Software Vala console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const totalChats = conversations.length;
  const totalMessages = conversations.reduce((n, c) => n + c.messages.length, 0);
  const unread = conversations.reduce((n, c) => n + c.unread, 0);
  const online = conversations.filter((c) => c.online).length;
  const favorites = conversations.filter((c) => c.favorite).length;
  const openTickets = conversations.reduce((n, c) => n + c.profile.stats.openTickets, 0);

  const channels = Array.from(
    conversations.reduce((map, c) => {
      map.set(c.channel, (map.get(c.channel) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);

  const kpis = [
    { label: "Active Conversations", value: totalChats, icon: MessageSquare, hint: `${online} clients online` },
    { label: "Total Messages", value: totalMessages, icon: TrendingUp, hint: "Across all client threads" },
    { label: "Unread Queue", value: unread, icon: BellDot, hint: "Needs a reply" },
    { label: "Open Tickets", value: openTickets, icon: Clock, hint: "Support follow-ups" },
    { label: "Clients", value: totalChats, icon: Users, hint: "In this workspace" },
    { label: "Starred Threads", value: favorites, icon: Star, hint: "Priority clients" },
  ];

  return (
    <main className="min-h-screen bg-background p-4 lg:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 shadow-float">
          <div className="flex items-center gap-3">
            <img
              src={valaLogo}
              alt="Software Vala"
              width={48}
              height={48}
              className="size-12 rounded-2xl object-cover ring-2 ring-brand/40"
            />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Chat Manager Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Live overview of Software Vala client conversations
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="press inline-flex items-center gap-2 rounded-2xl bg-brand-gradient px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-glow"
          >
            <ArrowLeft className="size-4" /> Back to Inbox
          </Link>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <article key={k.label} className="glass rounded-3xl p-5 shadow-3d">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{k.label}</span>
                  <Icon className="size-4 text-brand" />
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{k.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="glass rounded-3xl p-5 shadow-3d">
            <h2 className="text-sm font-semibold text-foreground">Channel Split</h2>
            <ul className="mt-4 space-y-3">
              {channels.map(([name, count]) => (
                <li key={name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{name}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand-gradient"
                      style={{ width: `${(count / totalChats) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="glass rounded-3xl p-5 shadow-3d">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Languages className="size-4 text-brand" /> Client Threads
            </h2>
            <ul className="mt-4 divide-y divide-border/60">
              {conversations.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <img
                    src={c.avatar}
                    alt={c.profile.name}
                    width={36}
                    height={36}
                    loading="lazy"
                    className="size-9 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.profile.company} · {c.profile.language} · {c.messages.length} messages
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      c.unread > 0
                        ? "bg-brand-gradient text-brand-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {c.unread > 0 ? `${c.unread} new` : c.when}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
