import { useState } from "react";
import { useParams } from "wouter";
import {
  useGetDate,
  useGetChecklist,
  useListFavorites,
  useUpdateDate,
  useToggleChecklistItem,
  useCreateFavorite,
  useDeleteFavorite,
  useCreateReflection,
  getGetDateQueryKey,
  getGetChecklistQueryKey,
  getListFavoritesQueryKey,
  getListReflectionsQueryKey,
  getListDatesQueryKey,
  getGetSummaryQueryKey,
} from "@/lib/static-api";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, DollarSign, ChefHat, Music, Flame,
  MessageCircle, Sparkles, Navigation, CheckSquare, Square,
  Calendar, CalendarPlus, Star, Heart, BookOpen, Check, X, ChevronRight, Leaf
} from "lucide-react";
import { Link } from "wouter";
import { cn, getMonthGradient, generateGoogleCalendarUrl, downloadICS } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RecipeOption {
  id: number;
  dish: string;
  cuisine: string;
  description: string;
  difficulty: string;
  prepTime: string;
  ingredients: string[];
}

interface MoodOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  artists: string[];
  playlistDirection: string;
}

const PHASE_LABELS_SETH = ["Choose Your Recipe", "Source & Prep", "Cook Night"];
const PHASE_LABELS_ELANA = ["Choose Your Vibe", "Build the Playlist", "Set the Mood"];

export default function MonthDetail() {
  const { month } = useParams<{ month: string }>();
  const monthNum = parseInt(month || "1", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [reflectionData, setReflectionData] = useState({
    highlight: "",
    memory: "",
    learnedAboutEachOther: "",
    rating: 5,
  });

  const { data: date, isLoading } = useGetDate(monthNum, {
    query: { enabled: !!monthNum, queryKey: getGetDateQueryKey(monthNum) },
  });
  const { data: checklist } = useGetChecklist(monthNum, {
    query: { enabled: !!monthNum, queryKey: getGetChecklistQueryKey(monthNum) },
  });
  const { data: favorites } = useListFavorites({
    query: { queryKey: getListFavoritesQueryKey() },
  });

  const updateDate = useUpdateDate();
  const toggleItem = useToggleChecklistItem();
  const createFavorite = useCreateFavorite();
  const deleteFavorite = useDeleteFavorite();
  const createReflection = useCreateReflection();

  const isFavorited = (type: string, content: string) =>
    favorites?.some((f) => f.type === type && f.content === content && f.sourceMonth === monthNum);

  const getFavoriteId = (type: string, content: string) =>
    favorites?.find((f) => f.type === type && f.content === content && f.sourceMonth === monthNum)?.id;

  const handleToggleFavorite = async (type: "ritual" | "activity" | "prompt", content: string) => {
    const favId = getFavoriteId(type, content);
    if (favId) {
      await deleteFavorite.mutateAsync({ id: favId });
      toast({ description: "Removed from favorites" });
    } else {
      await createFavorite.mutateAsync({ data: { type, content, sourceMonth: monthNum } });
      toast({ description: "Saved to favorites" });
    }
    queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
  };

  const handleToggleChecklist = async (itemId: number, completed: boolean) => {
    await toggleItem.mutateAsync({ month: monthNum, itemId, data: { completed: !completed } });
    queryClient.invalidateQueries({ queryKey: getGetChecklistQueryKey(monthNum) });
  };

  const handleChooseRecipe = async (recipeId: number) => {
    await updateDate.mutateAsync({
      month: monthNum,
      data: { sethRecipeChoice: recipeId, sethPhase: 2 },
    });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: "Recipe chosen. Time to source those ingredients." });
  };

  const handleChooseVibe = async (vibeId: string) => {
    await updateDate.mutateAsync({
      month: monthNum,
      data: { elanaVibeChoice: vibeId, elanaPhase: 2 },
    });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: "Vibe locked in. Time to build that playlist." });
  };

  const handleResetSethChoice = async () => {
    await updateDate.mutateAsync({
      month: monthNum,
      data: { sethRecipeChoice: null, sethPhase: 1 },
    });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: "No worries — pick whichever dish feels right." });
  };

  const handleResetElanaChoice = async () => {
    await updateDate.mutateAsync({
      month: monthNum,
      data: { elanaVibeChoice: null, elanaPhase: 1 },
    });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: "Vibe reset — choose the one that fits tonight." });
  };

  const handleAdvanceSethPhase = async () => {
    const nextPhase = Math.min((date?.sethPhase ?? 1) + 1, 3);
    await updateDate.mutateAsync({ month: monthNum, data: { sethPhase: nextPhase } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: nextPhase === 3 ? "Cook night! Let's go." : "Phase updated." });
  };

  const handleAdvanceElanaPhase = async () => {
    const nextPhase = Math.min((date?.elanaPhase ?? 1) + 1, 3);
    await updateDate.mutateAsync({ month: monthNum, data: { elanaPhase: nextPhase } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: nextPhase === 3 ? "Playlist ready. Date night incoming." : "Phase updated." });
  };

  const handleSchedule = async () => {
    if (!scheduleDate) return;
    await updateDate.mutateAsync({ month: monthNum, data: { scheduledDate: scheduleDate } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    setShowScheduleModal(false);
    toast({ description: "Date night scheduled!" });
  };

  const handleMarkComplete = async () => {
    await updateDate.mutateAsync({
      month: monthNum,
      data: { completed: true, completedAt: new Date().toISOString() },
    });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    setShowReflectionModal(true);
  };

  const handleSaveReflection = async () => {
    await createReflection.mutateAsync({
      data: { month: monthNum, ...reflectionData },
    });
    queryClient.invalidateQueries({ queryKey: getListReflectionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    setShowReflectionModal(false);
    toast({ description: "Reflection saved. Beautiful." });
  };

  const handleAddToCalendar = () => {
    if (!date) return;
    const title = `Date Night: ${date.theme} — ${date.monthName}`;
    const desc = date.intro;
    if (date.scheduledDate) {
      window.open(generateGoogleCalendarUrl(title, date.scheduledDate, desc), "_blank");
    } else {
      setShowScheduleModal(true);
    }
  };

  if (isLoading || !date) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
          <p className="text-muted-foreground font-serif text-lg italic">Preparing your evening...</p>
        </div>
      </div>
    );
  }

  const dinner = date.dinner as { options: RecipeOption[] };
  const music = date.music as { moods: MoodOption[] };
  const ritual = date.ritual as { title: string; description: string };
  const activity = date.activity as { title: string; description: string };
  const localAddOn = date.localAddOn as { title: string; description: string };
  const prompts = date.conversationPrompts as string[];
  const funFacts = (date.funFacts as string[] | undefined) ?? [];
  const gradient = getMonthGradient(monthNum);

  const sethPhase = date.sethPhase ?? 1;
  const elanaPhase = date.elanaPhase ?? 1;
  const chosenRecipe = dinner.options.find((o) => o.id === date.sethRecipeChoice);
  const chosenMood = music.moods.find((m) => m.id === date.elanaVibeChoice);

  const phaseChecklistItems = checklist?.filter((item) =>
    item.person === "seth" && item.phase === sethPhase
  ) ?? [];

  const elanaChecklistItems = checklist?.filter((item) =>
    item.person === "elana" && item.phase === elanaPhase
  ) ?? [];

  const bothChecklistItems = checklist?.filter((item) =>
    item.person === "both"
  ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className={cn("relative bg-gradient-to-br text-white", gradient)}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-5xl mx-auto px-6 py-12">
          <Link href="/" data-testid="back-button">
            <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 text-sm font-sans">
              <ArrowLeft className="w-4 h-4" />
              All Months
            </button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/60 text-xs tracking-[0.2em] uppercase font-sans mb-3">
              Month {date.month} &mdash; {date.monthName}
            </p>
            <h1 className="font-serif text-4xl md:text-6xl font-light mb-3">{date.theme}</h1>
            <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span className="font-sans">{date.destination}</span>
            </div>
            <p className="font-serif text-xl italic text-white/80 leading-relaxed max-w-2xl">
              {date.tagline}
            </p>

            <div className="flex gap-4 mt-6 text-white/60 text-sm font-sans">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{date.duration}</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />{date.cost}</span>
              <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" />{date.effort}</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* Intro */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="font-serif text-lg leading-relaxed text-foreground/80 italic">{date.intro}</p>
        </motion.section>

        {/* Action bar */}
        <motion.section
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-3"
        >
          <button
            onClick={handleAddToCalendar}
            data-testid="button-add-calendar"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans hover:opacity-90 transition-opacity"
          >
            <CalendarPlus className="w-4 h-4" />
            Add to Calendar
          </button>
          <button
            onClick={() => {
              if (date.scheduledDate) {
                downloadICS(`Date Night: ${date.theme}`, date.scheduledDate, date.intro);
              } else {
                setShowScheduleModal(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-sans hover:bg-accent transition-colors"
          >
            <Calendar className="w-4 h-4" />
            Download .ics
          </button>
          {!date.completed && (
            <button
              onClick={handleMarkComplete}
              data-testid="button-mark-complete"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-primary text-sm font-sans hover:bg-primary/10 transition-colors ml-auto"
            >
              <Check className="w-4 h-4" />
              Mark as Complete
            </button>
          )}
          {date.completed && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-sans ml-auto">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              Completed
            </div>
          )}
        </motion.section>

        {/* Two-track journey */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Seth's Track */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="bg-stone-800 text-white px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-sans tracking-widest uppercase text-amber-300/80">Seth's Kitchen</span>
              </div>
              <PhaseStepper phase={sethPhase} labels={PHASE_LABELS_SETH} />
            </div>
            <div className="p-6">
              {sethPhase === 1 && (
                <SethPhase1
                  options={dinner.options}
                  sourcingItems={phaseChecklistItems}
                  onChoose={handleChooseRecipe}
                  onToggle={handleToggleChecklist}
                  isPending={updateDate.isPending}
                />
              )}
              {sethPhase === 2 && (
                <SethPhase2
                  chosenRecipe={chosenRecipe}
                  sethItems={phaseChecklistItems}
                  onToggle={handleToggleChecklist}
                  onAdvance={handleAdvanceSethPhase}
                  onReset={handleResetSethChoice}
                  isPending={updateDate.isPending}
                />
              )}
              {sethPhase === 3 && (
                <SethPhase3 chosenRecipe={chosenRecipe} onReset={handleResetSethChoice} isPending={updateDate.isPending} />
              )}
            </div>
          </div>

          {/* Elana's Track */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="bg-rose-900 text-white px-6 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-rose-200" />
                <span className="text-sm font-sans tracking-widest uppercase text-rose-200/80">Elana's Soundscape</span>
              </div>
              <PhaseStepper phase={elanaPhase} labels={PHASE_LABELS_ELANA} color="rose" />
            </div>
            <div className="p-6">
              {elanaPhase === 1 && (
                <ElanaPhase1
                  moods={music.moods}
                  onChoose={handleChooseVibe}
                  isPending={updateDate.isPending}
                />
              )}
              {elanaPhase === 2 && (
                <ElanaPhase2
                  chosenMood={chosenMood}
                  elanaItems={elanaChecklistItems}
                  onToggle={handleToggleChecklist}
                  onAdvance={handleAdvanceElanaPhase}
                  onReset={handleResetElanaChoice}
                  isPending={updateDate.isPending}
                />
              )}
              {elanaPhase === 3 && (
                <ElanaPhase3 chosenMood={chosenMood} onReset={handleResetElanaChoice} isPending={updateDate.isPending} />
              )}
            </div>
          </div>
        </motion.div>

        {/* Date Night Checklist (both phase 3) */}
        {bothChecklistItems.length > 0 && (
          <Section title="Date Night Prep" icon={CheckSquare} delay={0.25}>
            <div className="space-y-2">
              {bothChecklistItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id, item.completed)}
                  data-testid={`checklist-item-${item.id}`}
                  className="w-full flex items-start gap-3 text-left p-3 rounded-xl hover:bg-accent transition-colors"
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <span className={cn(
                    "text-sm font-sans leading-snug",
                    item.completed && "line-through text-muted-foreground"
                  )}>
                    {item.label.replace(/^Both:\s*/i, "")}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Opening Ritual */}
        <Section title="Opening Ritual" icon={Flame} delay={0.3}>
          <FavoriteCard
            title={ritual.title}
            body={ritual.description}
            favType="ritual"
            isFavorited={isFavorited("ritual", ritual.title)}
            onToggle={() => handleToggleFavorite("ritual", ritual.title)}
            data-testid="ritual-card"
          />
        </Section>

        {/* Discover */}
        {funFacts.length > 0 && (
          <Section title="Discover" icon={Leaf} delay={0.33}>
            <div className="space-y-3">
              {funFacts.map((fact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="rounded-xl p-4 bg-muted/60 border border-border"
                >
                  <p className="text-sm leading-relaxed text-foreground/80 font-sans">
                    {fact}
                  </p>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Conversation */}
        <Section title="Conversation" icon={MessageCircle} delay={0.35}>
          <div className="space-y-3">
            {prompts.map((prompt, i) => (
              <FavoriteCard
                key={i}
                title={`Prompt ${i + 1}`}
                body={prompt}
                favType="prompt"
                isFavorited={isFavorited("prompt", prompt)}
                onToggle={() => handleToggleFavorite("prompt", prompt)}
                data-testid={`prompt-${i}`}
              />
            ))}
          </div>
        </Section>

        {/* Activity */}
        <Section title="The Activity" icon={Sparkles} delay={0.4}>
          <FavoriteCard
            title={activity.title}
            body={activity.description}
            favType="activity"
            isFavorited={isFavorited("activity", activity.title)}
            onToggle={() => handleToggleFavorite("activity", activity.title)}
            data-testid="activity-card"
          />
        </Section>

        {/* Local Add-On */}
        <Section title="If You Leave the House" icon={Navigation} delay={0.45}>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-serif text-lg text-foreground mb-2">{localAddOn.title}</h3>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">{localAddOn.description}</p>
          </div>
        </Section>

        {/* Post-date reflection */}
        {date.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
          >
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-serif text-xl text-foreground mb-2">This date is complete</h3>
            <p className="text-sm text-muted-foreground mb-4 font-sans">Add a reflection to capture what you felt and what you learned.</p>
            <button
              onClick={() => setShowReflectionModal(true)}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans hover:opacity-90 transition-opacity"
            >
              Write a Reflection
            </button>
          </motion.div>
        )}
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <Modal title="When is your date?" onClose={() => setShowScheduleModal(false)}>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground font-sans block mb-2">Pick a date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  data-testid="input-schedule-date"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={handleSchedule}
                disabled={!scheduleDate}
                data-testid="button-save-schedule"
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Schedule & Add to Google Calendar
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Reflection Modal */}
      <AnimatePresence>
        {showReflectionModal && (
          <Modal
            title="How was the evening?"
            subtitle="Take a moment to capture what you felt and what you learned."
            onClose={() => setShowReflectionModal(false)}
          >
            <div className="space-y-4">
              <ReflectionField
                label="The highlight of the evening"
                value={reflectionData.highlight}
                onChange={(v) => setReflectionData((d) => ({ ...d, highlight: v }))}
                placeholder="What moment will you remember most?"
                data-testid="input-highlight"
              />
              <ReflectionField
                label="A memory to keep"
                value={reflectionData.memory}
                onChange={(v) => setReflectionData((d) => ({ ...d, memory: v }))}
                placeholder="Something you want to hold onto..."
                data-testid="input-memory"
              />
              <ReflectionField
                label="Something you learned about each other"
                value={reflectionData.learnedAboutEachOther}
                onChange={(v) => setReflectionData((d) => ({ ...d, learnedAboutEachOther: v }))}
                placeholder="What did you discover tonight?"
                data-testid="input-learned"
              />
              <div>
                <label className="text-sm text-muted-foreground font-sans block mb-2">How was tonight?</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setReflectionData((d) => ({ ...d, rating: n }))}
                      data-testid={`rating-${n}`}
                      className="p-1"
                    >
                      <Star className={cn(
                        "w-7 h-7 transition-colors",
                        n <= reflectionData.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                      )} />
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSaveReflection}
                disabled={!reflectionData.highlight || !reflectionData.memory || !reflectionData.learnedAboutEachOther}
                data-testid="button-save-reflection"
                className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Save Reflection
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhaseStepper({ phase, labels, color = "amber" }: { phase: number; labels: string[]; color?: "amber" | "rose" }) {
  return (
    <div className="flex items-center gap-1">
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = phase === stepNum;
        const isDone = phase > stepNum;
        return (
          <div key={i} className="flex items-center gap-1 flex-1">
            <div className={cn(
              "flex items-center gap-1.5 min-w-0",
              isActive ? "opacity-100" : isDone ? "opacity-60" : "opacity-30"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-xs font-sans shrink-0",
                isDone
                  ? color === "rose" ? "bg-rose-300 text-rose-900" : "bg-amber-300 text-amber-900"
                  : isActive
                  ? "bg-white text-stone-900"
                  : "bg-white/20 text-white"
              )}>
                {isDone ? <Check className="w-3 h-3" /> : stepNum}
              </div>
              <span className="text-white text-xs font-sans truncate hidden sm:block">{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div className={cn("h-px flex-1 mx-1", phase > stepNum + 1 ? "bg-white/40" : "bg-white/15")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SethPhase1({ options, sourcingItems, onChoose, onToggle, isPending }: {
  options: RecipeOption[];
  sourcingItems: { id: number; label: string; completed: boolean }[];
  onChoose: (id: number) => void;
  onToggle: (id: number, completed: boolean) => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-sans">Browse these options. Pick the one that speaks to you — based on what you're in the mood to cook, not what you think you should make.</p>
      {options.map((option) => (
        <div key={option.id} className="rounded-xl border border-border bg-background p-4 space-y-3">
          <div>
            <h3 className="font-serif text-lg text-foreground">{option.dish}</h3>
            <p className="text-xs text-primary/70 font-sans mt-0.5">{option.cuisine}</p>
          </div>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">{option.description}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-sans">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{option.prepTime}</span>
            <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{option.difficulty}</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans mb-1.5">Ingredients to source</p>
            <div className="flex flex-wrap gap-1.5">
              {option.ingredients.map((ing, i) => (
                <span key={i} className="px-2 py-0.5 bg-muted rounded-full text-xs text-muted-foreground font-sans">{ing}</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => onChoose(option.id)}
            disabled={isPending}
            className="w-full py-2.5 rounded-xl bg-stone-800 text-white text-sm font-sans hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            I'll cook this →
          </button>
        </div>
      ))}
      {sourcingItems.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2">
          <p className="text-xs text-stone-500 uppercase tracking-widest font-sans">Day 1 tasks</p>
          {sourcingItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id, item.completed)}
              data-testid={`checklist-item-${item.id}`}
              className="w-full flex items-start gap-3 text-left p-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {item.completed ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span className={cn("text-sm font-sans leading-snug", item.completed && "line-through text-muted-foreground")}>
                {item.label.replace(/^Seth:\s*/i, "")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SethPhase2({ chosenRecipe, sethItems, onToggle, onAdvance, onReset, isPending }: {
  chosenRecipe?: RecipeOption;
  sethItems: { id: number; label: string; completed: boolean }[];
  onToggle: (id: number, completed: boolean) => void;
  onAdvance: () => void;
  onReset: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-5">
      {chosenRecipe && (
        <div className="rounded-xl bg-stone-50 border border-stone-200 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-sans mb-1">Your dish</p>
              <h3 className="font-serif text-lg text-stone-900">{chosenRecipe.dish}</h3>
              <p className="text-xs text-stone-500 mt-1 font-sans">{chosenRecipe.prepTime} · {chosenRecipe.difficulty}</p>
            </div>
            <button
              onClick={onReset}
              disabled={isPending}
              data-testid="button-reset-seth"
              className="shrink-0 text-xs text-stone-400 hover:text-stone-600 font-sans underline underline-offset-2 transition-colors disabled:opacity-50"
            >
              Change choice
            </button>
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-sans text-muted-foreground mb-3">Day 2 is prep day. Get your kitchen ready — work through these tasks before cook night:</p>
        <div className="space-y-2">
          {sethItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id, item.completed)}
              data-testid={`checklist-item-${item.id}`}
              className="w-full flex items-start gap-3 text-left p-3 rounded-xl hover:bg-accent transition-colors"
            >
              {item.completed ? (
                <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span className={cn(
                "text-sm font-sans leading-snug",
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.label.replace(/^Seth:\s*/i, "")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onAdvance}
        disabled={isPending}
        className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 text-sm font-sans hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Ready for cook night <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function SethPhase3({ chosenRecipe, onReset, isPending }: { chosenRecipe?: RecipeOption; onReset: () => void; isPending: boolean }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-amber-700 uppercase tracking-widest font-sans mb-1">Tonight you're making</p>
            <h3 className="font-serif text-xl text-stone-900">{chosenRecipe?.dish ?? "Your chosen dish"}</h3>
            {chosenRecipe && (
              <p className="text-xs text-amber-700/70 mt-1 font-sans">{chosenRecipe.cuisine} · {chosenRecipe.difficulty} · {chosenRecipe.prepTime}</p>
            )}
          </div>
          <button
            onClick={onReset}
            disabled={isPending}
            data-testid="button-reset-seth"
            className="shrink-0 text-xs text-amber-600 hover:text-amber-800 font-sans underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            Change choice
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
        Cook with intention. Don't rush. Pour yourself something good before you start. The process is part of the date — not a chore to get through before it.
      </p>
      <div className="rounded-xl border border-border p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">A few reminders</p>
        <ul className="space-y-1.5 text-sm font-sans text-foreground/80">
          <li>· Read the full recipe before you start. All the way through.</li>
          <li>· Mise en place — prep everything before you turn on the heat.</li>
          <li>· Taste as you go. Season with confidence.</li>
          <li>· If something goes sideways, don't panic. Improvise. Tell the story later.</li>
        </ul>
      </div>
    </div>
  );
}

function ElanaPhase1({ moods, onChoose, isPending }: {
  moods: MoodOption[];
  onChoose: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-sans">What are you in the mood for tonight? Don't overthink it. Your gut knows.</p>
      <div className="space-y-3">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onChoose(mood.id)}
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-background p-4 text-left hover:border-primary/50 hover:bg-rose-50/50 transition-all group disabled:opacity-50"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{mood.emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-base text-foreground group-hover:text-primary transition-colors">{mood.name}</h3>
                <p className="text-xs text-muted-foreground font-sans mt-0.5 leading-snug">{mood.description}</p>
                <p className="text-xs text-primary/70 font-sans mt-1.5 italic">{mood.playlistDirection}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {mood.artists.map((artist) => (
                    <span key={artist} className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-sans">
                      {artist}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ElanaPhase2({ chosenMood, elanaItems, onToggle, onAdvance, onReset, isPending }: {
  chosenMood?: MoodOption;
  elanaItems: { id: number; label: string; completed: boolean }[];
  onToggle: (id: number, completed: boolean) => void;
  onAdvance: () => void;
  onReset: () => void;
  isPending: boolean;
}) {
  return (
    <div className="space-y-5">
      {chosenMood && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-rose-600 uppercase tracking-widest font-sans mb-1">Tonight's vibe</p>
              <h3 className="font-serif text-lg text-rose-900">{chosenMood.emoji} {chosenMood.name}</h3>
              <p className="text-xs text-rose-600/70 mt-1 font-sans italic">{chosenMood.playlistDirection}</p>
            </div>
            <button
              onClick={onReset}
              disabled={isPending}
              data-testid="button-reset-elana"
              className="shrink-0 text-xs text-rose-400 hover:text-rose-600 font-sans underline underline-offset-2 transition-colors disabled:opacity-50"
            >
              Change choice
            </button>
          </div>
        </div>
      )}

      {chosenMood && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans mb-2">Start with these artists</p>
          <div className="flex flex-wrap gap-2">
            {chosenMood.artists.map((artist) => (
              <span key={artist} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-sans">
                {artist}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-sans text-muted-foreground mb-3">Day 2 is playlist day. Work through this:</p>
        <div className="space-y-2">
          {elanaItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggle(item.id, item.completed)}
              data-testid={`checklist-item-${item.id}`}
              className="w-full flex items-start gap-3 text-left p-3 rounded-xl hover:bg-accent transition-colors"
            >
              {item.completed ? (
                <CheckSquare className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span className={cn(
                "text-sm font-sans leading-snug",
                item.completed && "line-through text-muted-foreground"
              )}>
                {item.label.replace(/^Elana:\s*/i, "")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans mb-2">Playlist tips</p>
        <ul className="space-y-1.5 text-sm font-sans text-foreground/80">
          <li>· Start quieter, let it build through the evening</li>
          <li>· Leave space for conversation — don't make it too loud</li>
          <li>· Save your best track for after dinner, when everything has settled</li>
        </ul>
      </div>

      <button
        onClick={onAdvance}
        disabled={isPending}
        className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-700 text-sm font-sans hover:bg-rose-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        Playlist is ready <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ElanaPhase3({ chosenMood, onReset, isPending }: { chosenMood?: MoodOption; onReset: () => void; isPending: boolean }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-rose-600 uppercase tracking-widest font-sans mb-1">Tonight's vibe</p>
            <h3 className="font-serif text-xl text-rose-900">{chosenMood ? `${chosenMood.emoji} ${chosenMood.name}` : "Your chosen vibe"}</h3>
            {chosenMood && (
              <p className="text-xs text-rose-600/70 mt-1 font-sans italic">{chosenMood.playlistDirection}</p>
            )}
          </div>
          <button
            onClick={onReset}
            disabled={isPending}
            data-testid="button-reset-elana"
            className="shrink-0 text-xs text-rose-400 hover:text-rose-600 font-sans underline underline-offset-2 transition-colors disabled:opacity-50"
          >
            Change choice
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
        Your playlist is ready. Hit play before Seth starts cooking — let the room settle into the feeling before anything happens. You set the tone. That's the power.
      </p>
      <div className="rounded-xl border border-border p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Tonight you're the curator</p>
        <ul className="space-y-1.5 text-sm font-sans text-foreground/80">
          <li>· Read the room. If the energy shifts, shift the music.</li>
          <li>· Don't over-explain the songs — let them land.</li>
          <li>· If a song comes on that means something, say so.</li>
          <li>· Turn it down slightly when the real conversation starts.</li>
        </ul>
      </div>
      {chosenMood && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans mb-2">Your anchors</p>
          <div className="flex flex-wrap gap-2">
            {chosenMood.artists.map((artist) => (
              <span key={artist} className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-sm font-sans">
                {artist}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, delay, children }: {
  title: string;
  icon: React.ElementType;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-primary/70" />
        <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function FavoriteCard({ title, body, favType, isFavorited, onToggle, "data-testid": testId }: {
  title: string;
  body: string;
  favType: "ritual" | "activity" | "prompt";
  isFavorited: boolean | undefined;
  onToggle: () => void;
  "data-testid"?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 relative group" data-testid={testId}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans mb-2">{title}</p>
          <p className="font-serif text-base leading-relaxed text-foreground">{body}</p>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "shrink-0 p-1.5 rounded-lg transition-all",
            isFavorited
              ? "text-rose-500 bg-rose-50"
              : "text-muted-foreground/30 hover:text-rose-400 hover:bg-rose-50"
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorited && "fill-rose-500")} />
        </button>
      </div>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-background rounded-2xl p-6 w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground font-sans mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ReflectionField({ label, value, onChange, placeholder, "data-testid": testId }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  "data-testid"?: string;
}) {
  return (
    <div>
      <label className="text-sm text-muted-foreground font-sans block mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-foreground font-serif text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
    </div>
  );
}
