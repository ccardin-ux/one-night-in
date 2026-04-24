import { useState } from "react";
import { useParams, useLocation } from "wouter";
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
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Clock, DollarSign, ChefHat, Music, Flame,
  MessageCircle, Sparkles, Navigation, CheckSquare, Square,
  Calendar, CalendarPlus, Star, Heart, BookOpen, Check, X
} from "lucide-react";
import { Link } from "wouter";
import { cn, getMonthGradient, generateGoogleCalendarUrl, downloadICS } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function MonthDetail() {
  const { month } = useParams<{ month: string }>();
  const monthNum = parseInt(month || "1", 10);
  const [, navigate] = useLocation();
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

  const handleSchedule = async () => {
    if (!scheduleDate) return;
    await updateDate.mutateAsync({ month: monthNum, data: { scheduledDate: scheduleDate } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    setShowScheduleModal(false);
    toast({ description: "Date scheduled!" });
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
    const desc = `${date.intro}\n\nDinner: ${(date.dinner as { dish: string }).dish}\nMusic: ${(date.music as { direction: string }).direction}`;
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

  const dinner = date.dinner as { dish: string; cuisine: string; description: string };
  const music = date.music as { direction: string; artists: string[]; mood: string };
  const ritual = date.ritual as { title: string; description: string };
  const activity = date.activity as { title: string; description: string };
  const localAddOn = date.localAddOn as { title: string; description: string };
  const prompts = date.conversationPrompts as string[];
  const gradient = getMonthGradient(monthNum);

  const completedItems = checklist?.filter((i) => i.completed).length ?? 0;
  const totalItems = checklist?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className={cn("relative bg-gradient-to-br text-white", gradient)}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative max-w-3xl mx-auto px-6 py-12">
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
            <p className="font-serif text-xl italic text-white/80 leading-relaxed max-w-xl">
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

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* Intro */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="font-serif text-lg leading-relaxed text-foreground/80 italic">{date.intro}</p>
        </motion.section>

        {/* Actions */}
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
                downloadICS(
                  `Date Night: ${date.theme}`,
                  date.scheduledDate,
                  date.intro
                );
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

        {/* Checklist */}
        {checklist && checklist.length > 0 && (
          <Section title="Prep Checklist" icon={CheckSquare} delay={0.2}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary rounded-full h-1.5 transition-all duration-500"
                  style={{ width: `${totalItems ? (completedItems / totalItems) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-sans">{completedItems}/{totalItems}</span>
            </div>
            <div className="space-y-2">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleToggleChecklist(item.id, item.completed)}
                  data-testid={`checklist-item-${item.id}`}
                  className="w-full flex items-start gap-3 text-left p-3 rounded-xl hover:bg-accent transition-colors group"
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
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Ritual */}
        <Section title="Opening Ritual" icon={Flame} delay={0.25}>
          <FavoriteCard
            title={ritual.title}
            body={ritual.description}
            favType="ritual"
            isFavorited={isFavorited("ritual", ritual.title)}
            onToggle={() => handleToggleFavorite("ritual", ritual.title)}
            data-testid="ritual-card"
          />
        </Section>

        {/* Dinner */}
        <Section title="The Dinner" icon={ChefHat} delay={0.3}>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-serif text-xl text-foreground">{dinner.dish}</h3>
                <p className="text-sm text-primary/70 font-sans mt-0.5">{dinner.cuisine}</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed font-sans text-sm">{dinner.description}</p>
          </div>
        </Section>

        {/* Music */}
        <Section title="The Music" icon={Music} delay={0.35}>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="font-serif text-lg italic text-foreground mb-3">"{music.mood}"</p>
            <p className="text-sm text-muted-foreground mb-4 font-sans">{music.direction}</p>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans mb-2">Start with</p>
              <div className="flex flex-wrap gap-2">
                {music.artists.map((artist) => (
                  <span key={artist} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-sans">
                    {artist}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* Conversation */}
        <Section title="Conversation" icon={MessageCircle} delay={0.4}>
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
        <Section title="The Activity" icon={Sparkles} delay={0.45}>
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
        <Section title="If You Leave the House" icon={Navigation} delay={0.5}>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-serif text-lg text-foreground mb-2">{localAddOn.title}</h3>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed">{localAddOn.description}</p>
          </div>
        </Section>

        {/* Post-date reflection link */}
        {date.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center"
          >
            <BookOpen className="w-6 h-6 text-primary mx-auto mb-3" />
            <h3 className="font-serif text-xl text-foreground mb-2">This date is complete</h3>
            <p className="text-sm text-muted-foreground mb-4 font-sans">Add a reflection to capture what you felt and learned.</p>
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
              <div className="flex gap-3">
                <button
                  onClick={handleSchedule}
                  disabled={!scheduleDate}
                  data-testid="button-save-schedule"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Schedule & Add to Google Calendar
                </button>
              </div>
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
        <div className="flex-1">
          {title !== `Prompt 1` && title !== `Prompt 2` && title !== `Prompt 3` && title !== `Prompt 4` && title !== `Prompt 5` && (
            <h3 className="font-serif text-lg text-foreground mb-2">{title}</h3>
          )}
          <p className="text-sm text-muted-foreground leading-relaxed font-sans">{body}</p>
        </div>
        <button
          onClick={onToggle}
          data-testid={`favorite-${favType}`}
          className={cn(
            "p-2 rounded-lg transition-colors shrink-0",
            isFavorited ? "text-rose-500 bg-rose-50" : "text-muted-foreground/40 hover:text-rose-400 hover:bg-rose-50"
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-card rounded-2xl border border-border shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-serif text-2xl text-foreground">{title}</h2>
            {subtitle && <p className="text-sm text-muted-foreground mt-1 font-sans">{subtitle}</p>}
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
        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
