import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, CheckCircle2, Camera, User2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AvatarCropModal from "@/components/AvatarCropModal";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/supabase";
import { useTranslation } from "react-i18next";

const COUNTRIES = ["Egypt", "Saudi Arabia", "UAE", "USA", "UK", "France", "Germany", "Other"];
const LANGUAGES = [{ value: "en", label: "English" }, { value: "ar", label: "العربية" }];

interface Props {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  userId: string;
  updateProfile: (updates: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>) => Promise<{ error: string | null }>;
}

export default function ProfileEditSheet({ open, onClose, profile, userId, updateProfile }: Props) {
  const { t } = useTranslation("t");
  const [form, setForm] = useState({
    display_name:       profile?.display_name      ?? "",
    bio:                profile?.bio               ?? "",
    country:            profile?.country            ?? "",
    preferred_language: (profile?.preferred_language ?? "en") as "en" | "ar",
  });
  const [saving,          setSaving]          = useState(false);
  const [saved,           setSaved]           = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError,     setAvatarError]     = useState<string | null>(null);
  const [cropSrc,         setCropSrc]         = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm({
        display_name:       profile?.display_name      ?? "",
        bio:                profile?.bio               ?? "",
        country:            profile?.country            ?? "",
        preferred_language: (profile?.preferred_language ?? "en") as "en" | "ar",
      });
      setError(null);
      setSaved(false);
      setAvatarError(null);
    }
  }, [open, profile]);

  function openFilePicker() { setAvatarError(null); fileInputRef.current?.click(); }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setAvatarError(t("profile.edit.avatar_too_large")); return; }
    if (!file.type.startsWith("image/")) { setAvatarError(t("profile.edit.avatar_invalid")); return; }
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleCroppedUpload(blob: Blob) {
    setCropSrc(null);
    setAvatarUploading(true); setAvatarError(null);
    try {
      const path = `${userId}/avatar.jpg`;
      const { error: upErr } = await supabase.storage
        .from("Profile pictures")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("Profile pictures").getPublicUrl(path);
      const { error: profErr } = await updateProfile({ avatar_url: `${publicUrl}?t=${Date.now()}` });
      if (profErr) throw new Error(profErr);
    } catch (e: any) {
      setAvatarError(e.message || t("profile.edit.avatar_error"));
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true); setError(null);
    const { error } = await updateProfile(form);
    setSaving(false);
    if (error) {
      setError(error);
    } else {
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1100);
    }
  }

  const portalTarget =
    (typeof document !== "undefined" && document.getElementById("app-root")) ||
    (typeof document !== "undefined" && document.body);

  if (!portalTarget) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 z-[200] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-[201] bg-background rounded-t-3xl shadow-2xl border-t border-border/40 overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border/60" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/30">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <User2 className="w-4 h-4 text-violet-400" /> {t("profile.edit.title")}
                </h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Body — scrollable */}
              <div className="overflow-y-auto max-h-[72vh] px-5 py-4 space-y-4 pb-8">

                {/* Avatar upload */}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={avatarUploading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-violet-500/8 border border-violet-500/25 hover:bg-violet-500/14 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                    {avatarUploading
                      ? <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      : <Camera className="w-5 h-5 text-violet-400" />}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {avatarUploading ? t("profile.edit.avatar_uploading") : t("profile.edit.change_avatar")}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("profile.edit.avatar_hint")}</p>
                  </div>
                </button>
                {avatarError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <X className="w-3 h-3" /> {avatarError}
                  </p>
                )}

                {/* ─ Name ─ */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block">{t("profile.name_label")}</label>
                  <Input
                    value={form.display_name}
                    onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                    placeholder={t("profile.edit.name_placeholder")}
                    className="h-11 rounded-xl bg-muted/40 border-border/50 text-sm focus:border-violet-500/50"
                    autoComplete="name"
                  />
                </div>

                {/* ─ Bio ─ */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block">{t("profile.bio_label")}</label>
                  <Input
                    value={form.bio}
                    onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder={t("profile.edit.bio_placeholder")}
                    className="h-11 rounded-xl bg-muted/40 border-border/50 text-sm focus:border-violet-500/50"
                  />
                </div>

                {/* ─ Country ─ */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block">{t("profile.country_label")}</label>
                  <select
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    className="w-full h-11 px-3 rounded-xl bg-muted/40 border border-border/50 text-sm text-foreground focus:outline-none focus:border-violet-500/50"
                  >
                    <option value="">{t("profile.edit.country_placeholder")}</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* ─ Language ─ */}
                <div>
                  <label className="text-xs font-bold text-foreground mb-1.5 block">{t("profile.language_label")}</label>
                  <div className="flex gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, preferred_language: lang.value as "en" | "ar" }))}
                        className={cn(
                          "flex-1 h-11 rounded-xl text-sm font-semibold border transition-all",
                          form.preferred_language === lang.value
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-500/50 shadow-md shadow-violet-500/20"
                            : "bg-muted/40 border-border/50 text-foreground hover:border-violet-500/30"
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}

                {/* Save button */}
                <Button
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={cn(
                    "w-full h-12 rounded-2xl text-sm font-bold border-0 shadow-md transition-all",
                    saved
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20"
                      : "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-violet-500/20"
                  )}
                >
                  {saving
                    ? <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" /> {t("profile.edit.saving")}</span>
                    : saved
                      ? <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {t("profile.edit.saved")}</span>
                      : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {t("profile.save")}</span>}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {cropSrc && (
        <AvatarCropModal
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onCrop={handleCroppedUpload}
        />
      )}
    </>,
    portalTarget,
  );
}
