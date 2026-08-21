import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface ProfileDraft {
  avatar: string;
  name: string;
  role: string;
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  language?: string;
  tags?: string;
  notes?: string;
}

export function ProfileEditDialog({
  open,
  onOpenChange,
  mode,
  value,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "me" | "client";
  value: ProfileDraft;
  onSave: (next: ProfileDraft) => void;
}) {
  const [draft, setDraft] = useState<ProfileDraft>(value);
  const [saving, setSaving] = useState(false);
  const pickRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const set = (k: keyof ProfileDraft, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const pickPhoto = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("avatar", String(reader.result));
      toast.success("New profile photo selected");
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!draft.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      onSave({ ...draft, name: draft.name.trim() });
      setSaving(false);
      onOpenChange(false);
      toast.success("Profile updated");
    }, 450);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-3xl sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display">
            {mode === "me" ? "My Profile" : "Edit Client Profile"}
          </DialogTitle>
          <DialogDescription>
            Update your display photo and details. Changes apply instantly across the workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={draft.avatar}
              alt={draft.name}
              width={80}
              height={80}
              className="size-20 rounded-3xl bg-card object-cover shadow-3d ring-1 ring-border/60"
            />
            <button
              type="button"
              aria-label="Change profile photo"
              onClick={() => pickRef.current?.click()}
              className="press absolute -right-1 -bottom-1 grid size-8 place-items-center rounded-full bg-brand-gradient text-brand-foreground shadow-glow"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={pickRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) pickPhoto(f);
                e.target.value = "";
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Tap the camera to upload a new DP (JPG / PNG). Square photos look best.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pf-name">Full name</Label>
            <Input id="pf-name" value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pf-role">Role</Label>
            <Input id="pf-role" value={draft.role} onChange={(e) => set("role", e.target.value)} />
          </div>
          {mode === "client" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="pf-company">Company</Label>
                <Input
                  id="pf-company"
                  value={draft.company ?? ""}
                  onChange={(e) => set("company", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-email">Email</Label>
                <Input
                  id="pf-email"
                  type="email"
                  value={draft.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-phone">Phone</Label>
                <Input
                  id="pf-phone"
                  value={draft.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-location">Location</Label>
                <Input
                  id="pf-location"
                  value={draft.location ?? ""}
                  onChange={(e) => set("location", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-language">Preferred language</Label>
                <Input
                  id="pf-language"
                  value={draft.language ?? ""}
                  onChange={(e) => set("language", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pf-tags">Labels (comma separated)</Label>
                <Input
                  id="pf-tags"
                  value={draft.tags ?? ""}
                  onChange={(e) => set("tags", e.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pf-notes">Account note</Label>
                <Textarea
                  id="pf-notes"
                  rows={3}
                  value={draft.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={saving}
            className="press gap-2 rounded-full bg-brand-gradient text-brand-foreground shadow-glow"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
