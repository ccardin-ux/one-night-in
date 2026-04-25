import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  clearStoredMemories,
  downloadKeepsake,
  downloadMemoryBackup,
  getGetSummaryQueryKey,
  getListDatesQueryKey,
  getListFavoritesQueryKey,
  getListLearningsQueryKey,
  getListReflectionsQueryKey,
  importMemoryBackup,
  useListDates,
  useGetSummary,
} from "@/lib/static-api";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Calendar, BookOpen, Heart, Star, ChevronRight, Download, Upload, Trash2, FileText } from "lucide-react";
import { cn, getMonthGradient } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getDisplayProfile, useCoupleProfile } from "@/lib/couple-profile";
import Setup from "@/pages/Setup";

export default function Dashboard() {
  const { data: dates, isLoading: datesLoading } = useListDates();
  const { data: summary } = useGetSummary();
  const savedProfile = useCoupleProfile();
  const profile = getDisplayProfile(savedProfile);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const showTestingTools =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("test");

  const refreshStoredData = () => {
    [
      getListDatesQueryKey(),
      getGetSummaryQueryKey(),
      getListFavoritesQueryKey(),
      getListReflectionsQueryKey(),
      getListLearningsQueryKey(),
    ].forEach((queryKey) => queryClient.invalidateQueries({ queryKey }));
  };

  const handleExport = () => {
    downloadMemoryBackup();
    toast({ description: "Memory backup downloaded" });
  };

  const handleKeepsake = () => {
    downloadKeepsake();
    toast({ description: "Keepsake downloaded" });
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;

    try {
      setIsImporting(true);
      importMemoryBackup(JSON.parse(await file.text()));
      refreshStoredData();
      toast({ description: "Memories imported" });
    } catch (error) {
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Choose a valid backup file.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  };

  const handleClearData = () => {
    const confirmed = window.confirm(
      "Delete all saved schedules, checklist progress, favorites, memories, and learnings from this browser?",
    );

    if (!confirmed) return;
    clearStoredMemories();
    refreshStoredData();
    toast({ description: "Test data cleared from this browser" });
  };

  if (datesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-serif text-lg italic">Setting the table...</p>
        </div>
      </div>
    );
  }

  const completedCount = summary?.completedDates ?? 0;
  const currentMonth = summary?.upcomingMonth ?? 1;

  if (!savedProfile) {
    return <Setup />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-stone-800 via-rose-900 to-stone-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-100" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <p className="text-rose-300/80 text-sm tracking-[0.2em] uppercase font-sans mb-4">
              {profile.partnerOne} &amp; {profile.partnerTwo}
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6">
              Year of Dates
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed font-light">
              {profile.occasion}. Twelve personalized evenings shaped around {profile.vibe.toLowerCase()} connection,
              {profile.cookingSkill} cooking, music, conversation, and shared curiosity.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.interests.slice(0, 6).map((interest) => (
                <span key={interest} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75">
                  {interest}
                </span>
              ))}
              <Link href="/setup" className="rounded-full border border-rose-200/30 bg-rose-200/10 px-3 py-1 text-xs text-rose-100 hover:bg-rose-200/20">
                Edit profile
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Dates Completed", value: completedCount, icon: Star },
              { label: "Memories Saved", value: summary?.totalReflections ?? 0, icon: BookOpen },
              { label: "Things Learned", value: summary?.totalLearnings ?? 0, icon: Heart },
              { label: "Months Remaining", value: 12 - completedCount, icon: Calendar },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <stat.icon className="w-4 h-4 text-rose-300/70 mb-2" />
                <div className="text-3xl font-serif font-light text-white">{stat.value}</div>
                <div className="text-white/50 text-xs mt-1 font-sans">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Month Grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl text-foreground">Your Journey</h2>
            <p className="text-muted-foreground mt-1 text-sm">Twelve evenings. Twelve worlds to explore together.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/reflections" className="text-sm text-primary hover:underline flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Memories
            </Link>
            <Link href="/learnings" className="text-sm text-primary hover:underline flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Learnings
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dates?.map((date, i) => {
            const isCurrent = date.month === currentMonth;
            const isCompleted = date.completed;
            const gradient = getMonthGradient(date.month);

            return (
              <motion.div
                key={date.month}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Link href={`/month/${date.month}`} data-testid={`month-card-${date.month}`}>
                  <div className={cn(
                    "group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer",
                    "hover:shadow-lg hover:-translate-y-0.5",
                    isCurrent && !isCompleted
                      ? "border-primary/40 shadow-md ring-2 ring-primary/20"
                      : "border-border",
                  )}>
                    {/* Card header gradient */}
                    <div className={cn(
                      "bg-gradient-to-br h-28 relative",
                      gradient,
                      isCompleted && "opacity-60"
                    )}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="relative p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white/60 text-xs tracking-widest uppercase font-sans">
                              Month {date.month}
                            </p>
                            <h3 className="font-serif text-2xl text-white font-light mt-0.5">
                              {date.monthName}
                            </h3>
                          </div>
                          {isCompleted && (
                            <div className="bg-white/20 rounded-full p-1.5">
                              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                            </div>
                          )}
                          {isCurrent && !isCompleted && (
                            <div className="bg-white/20 rounded-full px-2 py-1">
                              <span className="text-white text-xs font-sans">Now</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="bg-card p-4">
                      <p className="text-xs text-primary/80 flex items-center gap-1.5 font-sans mb-1.5">
                        <MapPin className="w-3 h-3" />
                        {date.destination}
                      </p>
                      <p className="text-sm text-muted-foreground leading-snug font-serif italic line-clamp-2">
                        {date.tagline}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span>{date.effort}</span>
                          <span>·</span>
                          <span>{date.cost}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </div>
                      {!isCompleted && (
                        <div className="mt-2 flex gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-sans">
                            🍳 Day {date.sethPhase}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 font-sans">
                            🎵 Day {date.elanaPhase}
                          </span>
                        </div>
                      )}
                      {date.scheduledDate && !isCompleted && (
                        <div className="mt-1 text-xs text-primary/70 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(date.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Memory tools */}
      <div className="border-t border-border bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-2xl text-foreground">Memory Backup</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Back up private data for restore, or download a readable keepsake to print or save.
              </p>
              <p className="text-xs text-muted-foreground/80 mt-2 max-w-xl">
                Your memories stay private on this device unless you export and share a backup or keepsake file.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-sans text-foreground hover:bg-accent transition-colors"
              >
                <Download className="w-4 h-4" />
                Backup Memories
              </button>
              <button
                onClick={handleKeepsake}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-sans text-foreground hover:bg-accent transition-colors"
              >
                <FileText className="w-4 h-4" />
                Download Keepsake
              </button>
              <button
                onClick={() => importInputRef.current?.click()}
                disabled={isImporting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-sans text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                Restore Backup
              </button>
              {showTestingTools && (
                <button
                  onClick={handleClearData}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/25 bg-background text-sm font-sans text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Test Data
                </button>
              )}
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(event) => handleImport(event.target.files?.[0])}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap gap-4 justify-center">
          {[
            { href: "/reflections", label: "Memory Vault", icon: BookOpen },
            { href: "/learnings", label: "What We've Learned", icon: Heart },
            { href: "/favorites", label: "Saved Favorites", icon: Star },
          ].map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-accent">
                <Icon className="w-4 h-4" />
                {label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
