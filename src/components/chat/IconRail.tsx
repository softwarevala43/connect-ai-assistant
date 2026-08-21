import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageSquare,
  Bot,
  FileText,
  BarChart3,
  Boxes,
  Headphones,
  Sun,
  Moon,
  Languages,
  Settings,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const items = [
  { icon: MessageSquare, label: "Conversations", hint: "You are in the client conversations workspace." },
  { icon: Bot, label: "AI Agents", hint: "Vala AI assistant is active on every chat." },
  { icon: FileText, label: "Documents", hint: "Shared documents open in the client profile panel." },
  { icon: BarChart3, label: "Chat Manager Dashboard", hint: "Opening the chat manager dashboard.", to: "/dashboard" },
  { icon: Boxes, label: "Workspaces", hint: "Software Vala workspace selected." },
  { icon: Headphones, label: "Support Desk", hint: "Support threads are listed in your chat list." },
  { icon: Languages, label: "Translations", hint: "Use the translate bar above the message box." },
];


export function IconRail({
  avatar,
  dark,
  onToggleTheme,
}: {
  avatar: string;
  dark: boolean;
  onToggleTheme: () => void;
}) {
  const [active, setActive] = useState(0);

  return (
    <aside className="hidden w-[76px] shrink-0 flex-col items-center justify-between border-r border-border/60 bg-sidebar/70 py-6 backdrop-blur-xl md:flex">
      <div className="flex flex-col items-center gap-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === active;
          const classes = cn(
            "press grid size-12 place-items-center rounded-2xl",
            isActive
              ? "bg-brand-gradient text-brand-foreground shadow-glow"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          );
          const handle = () => {
            setActive(i);
            toast.success(item.label, { description: item.hint });
          };
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                {item.to ? (
                  <Link to={item.to} aria-label={item.label} onClick={handle} className={classes}>
                    <Icon className="size-5" strokeWidth={2.2} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-current={isActive}
                    onClick={handle}
                    className={classes}
                  >
                    <Icon className="size-5" strokeWidth={2.2} />
                  </button>
                )}
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}

      </div>

      <div className="flex flex-col items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                onToggleTheme();
                toast.success(dark ? "Light mode enabled" : "Dark mode enabled");
              }}
              aria-label="Toggle theme"
              className="press grid size-12 place-items-center rounded-2xl border border-border/60 bg-card text-gold shadow-3d"
            >
              {dark ? <Moon className="size-5" /> : <Sun className="size-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{dark ? "Dark mode" : "Light mode"}</TooltipContent>
        </Tooltip>
        <img
          src={avatar}
          alt="Amit Sharma"
          loading="lazy"
          width={48}
          height={48}
          className="size-12 rounded-2xl object-cover shadow-float ring-2 ring-brand/40"
        />
      </div>
    </aside>
  );
}
