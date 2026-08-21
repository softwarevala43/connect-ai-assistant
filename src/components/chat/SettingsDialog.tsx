import { useState } from "react";
import { Bell, Languages, Moon, Sun, UserRound, Volume2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { languages, type LangCode } from "@/lib/chat-data";

export function SettingsDialog({
  open,
  onOpenChange,
  dark,
  onToggleTheme,
  lang,
  onLangChange,
  autoTranslate,
  onToggleAutoTranslate,
  onOpenProfile,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  dark: boolean;
  onToggleTheme: () => void;
  lang: LangCode;
  onLangChange: (l: LangCode) => void;
  autoTranslate: boolean;
  onToggleAutoTranslate: () => void;
  onOpenProfile: () => void;
}) {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-3xl sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-display">Settings</DialogTitle>
          <DialogDescription>
            Appearance, real-time translation and notification preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-3 py-3 shadow-3d">
            <Label htmlFor="st-theme" className="flex items-center gap-2 text-sm font-semibold">
              {dark ? <Moon className="size-4 text-brand" /> : <Sun className="size-4 text-gold" />}
              Dark mode
            </Label>
            <Switch
              id="st-theme"
              checked={dark}
              onCheckedChange={() => {
                onToggleTheme();
                toast.success(dark ? "Light mode enabled" : "Dark mode enabled");
              }}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/70 px-3 py-3 shadow-3d">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Languages className="size-4 text-brand" /> Chat translation language
            </p>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    onLangChange(l.code);
                    toast.success(`Translation language: ${l.label}`);
                  }}
                  className={cn(
                    "press rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    l.code === lang
                      ? "bg-brand-gradient text-brand-foreground shadow-glow"
                      : "bg-muted text-muted-foreground hover:bg-accent",
                  )}
                >
                  <span className="emoji-3d">{l.flag}</span> {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-3 py-3 shadow-3d">
            <Label htmlFor="st-auto" className="flex items-center gap-2 text-sm font-semibold">
              <Wand2 className="size-4 text-gold" /> Real-time auto translate
            </Label>
            <Switch id="st-auto" checked={autoTranslate} onCheckedChange={onToggleAutoTranslate} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-3 py-3 shadow-3d">
            <Label htmlFor="st-notif" className="flex items-center gap-2 text-sm font-semibold">
              <Bell className="size-4 text-brand" /> Desktop notifications
            </Label>
            <Switch
              id="st-notif"
              checked={notifications}
              onCheckedChange={(v) => {
                setNotifications(v);
                toast.success(v ? "Notifications enabled" : "Notifications muted");
              }}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/70 px-3 py-3 shadow-3d">
            <Label htmlFor="st-sound" className="flex items-center gap-2 text-sm font-semibold">
              <Volume2 className="size-4 text-brand" /> Message sounds
            </Label>
            <Switch
              id="st-sound"
              checked={sounds}
              onCheckedChange={(v) => {
                setSounds(v);
                toast.success(v ? "Sounds on" : "Sounds off");
              }}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onOpenProfile();
            }}
            className="press h-11 w-full justify-start gap-2 rounded-2xl border-border/70 bg-card shadow-3d"
          >
            <UserRound className="size-4 text-brand" /> Edit my profile & photo
          </Button>
        </div>

        <DialogFooter>
          <Button
            className="press rounded-full bg-brand-gradient text-brand-foreground shadow-glow"
            onClick={() => {
              onOpenChange(false);
              toast.success("Settings saved");
            }}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
