import { useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "wouter";
import { ChefHat, Heart, Music, Sparkles } from "lucide-react";
import {
  DEFAULT_PROFILE,
  INTEREST_OPTIONS,
  VIBE_OPTIONS,
  type CookingSkill,
  type CoupleProfile,
  saveCoupleProfile,
} from "@/lib/couple-profile";
import { cn } from "@/lib/utils";

const SAM_COURTNEY_PROFILE: CoupleProfile = {
  partnerOne: "Sam",
  partnerTwo: "Courtney",
  occasion: "A year of intentional date nights",
  cookingLead: "Sam",
  musicLead: "Courtney",
  cookingSkill: "intermediate",
  foodNotes: "Vegetarian-forward options, thoughtful dinner projects, and good hosting energy.",
  musicNotes: "Warm, stylish playlists with room for dance, conversation, and a late-night wind-down.",
  interests: ["Cooking", "Music", "Fashion", "History", "Geopolitics", "Design"],
  vibe: "Playful",
};

const SKILL_OPTIONS: { value: CookingSkill; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "Simple recipes, low stress, high payoff." },
  { value: "intermediate", label: "Intermediate", description: "A few techniques, prep steps, and fun sourcing." },
  { value: "expert", label: "Expert", description: "Project cooking, ambitious menus, and deeper pairings." },
];

export default function Setup() {
  const [, navigate] = useLocation();
  const [profile, setProfile] = useState<CoupleProfile>(() => DEFAULT_PROFILE);

  const update = <Key extends keyof CoupleProfile>(key: Key, value: CoupleProfile[Key]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    setProfile((current) => {
      const hasInterest = current.interests.includes(interest);
      return {
        ...current,
        interests: hasInterest
          ? current.interests.filter((item) => item !== interest)
          : [...current.interests, interest],
      };
    });
  };

  const handleSubmit = () => {
    saveCoupleProfile(profile);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-stone-900 via-rose-900 to-amber-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <Sparkles className="w-8 h-8 text-rose-200 mb-5" />
          <p className="text-rose-200/80 text-sm tracking-[0.2em] uppercase font-sans mb-3">
            MVP Setup
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-light leading-tight">
            Build a year of dates for any couple
          </h1>
          <p className="text-white/70 text-lg mt-5 max-w-2xl leading-relaxed">
            Start with names, interests, cooking confidence, and the kind of connection the couple wants more of.
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <section className="flex flex-wrap gap-3">
          <button
            onClick={() => setProfile(DEFAULT_PROFILE)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm hover:bg-accent transition-colors"
          >
            Prefill Seth + Elana
          </button>
          <button
            onClick={() => setProfile(SAM_COURTNEY_PROFILE)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-sm hover:bg-accent transition-colors"
          >
            Prefill Sam + Courtney
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Partner 1">
            <input value={profile.partnerOne} onChange={(event) => update("partnerOne", event.target.value)} className="form-input" />
          </Field>
          <Field label="Partner 2">
            <input value={profile.partnerTwo} onChange={(event) => update("partnerTwo", event.target.value)} className="form-input" />
          </Field>
          <Field label="Occasion">
            <input value={profile.occasion} onChange={(event) => update("occasion", event.target.value)} className="form-input" />
          </Field>
          <Field label="Overall vibe">
            <select value={profile.vibe} onChange={(event) => update("vibe", event.target.value)} className="form-input">
              {VIBE_OPTIONS.map((vibe) => (
                <option key={vibe} value={vibe}>{vibe}</option>
              ))}
            </select>
          </Field>
          <Field label="Cooking lead">
            <input value={profile.cookingLead} onChange={(event) => update("cookingLead", event.target.value)} className="form-input" />
          </Field>
          <Field label="Music lead">
            <input value={profile.musicLead} onChange={(event) => update("musicLead", event.target.value)} className="form-input" />
          </Field>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <ChefHat className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-2xl">Cooking skill</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SKILL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => update("cookingSkill", option.value)}
                className={cn(
                  "text-left rounded-xl border p-4 transition-colors",
                  profile.cookingSkill === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-accent",
                )}
              >
                <span className="font-sans text-sm font-medium">{option.label}</span>
                <span className="block text-xs text-muted-foreground mt-1">{option.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Heart className="w-5 h-5 text-primary" />
            <h2 className="font-serif text-2xl">Shared interests</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition-colors",
                  profile.interests.includes(interest)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent",
                )}
              >
                {interest}
              </button>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Food notes">
            <textarea value={profile.foodNotes} onChange={(event) => update("foodNotes", event.target.value)} rows={4} className="form-input resize-none" />
          </Field>
          <Field label="Music notes">
            <textarea value={profile.musicNotes} onChange={(event) => update("musicNotes", event.target.value)} rows={4} className="form-input resize-none" />
          </Field>
        </section>

        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-2xl">{profile.partnerOne} + {profile.partnerTwo}</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {profile.occasion}. {profile.cookingLead} leads cooking at {profile.cookingSkill} level; {profile.musicLead} leads music.
            </p>
          </div>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
          >
            Create Their Year
          </button>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground font-sans uppercase tracking-widest block mb-2">{label}</span>
      {children}
    </label>
  );
}
