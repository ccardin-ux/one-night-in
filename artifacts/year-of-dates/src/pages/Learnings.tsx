import { useState } from "react";
import {
  useListLearnings,
  useCreateLearning,
  useDeleteLearning,
  getListLearningsQueryKey,
  getGetSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Plus, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

type AboutType = "seth" | "elana" | "both";

const ABOUT_LABELS: Record<AboutType, string> = {
  seth: "About Seth",
  elana: "About Elana",
  both: "About Both",
};

const ABOUT_COLORS: Record<AboutType, string> = {
  seth: "bg-blue-50 text-blue-700 border-blue-200",
  elana: "bg-rose-50 text-rose-700 border-rose-200",
  both: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function Learnings() {
  const { data: learnings, isLoading } = useListLearnings({
    query: { queryKey: getListLearningsQueryKey() },
  });
  const createLearning = useCreateLearning();
  const deleteLearning = useDeleteLearning();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ month: number; about: AboutType; content: string }>({
    month: 1,
    about: "both",
    content: "",
  });
  const [filter, setFilter] = useState<AboutType | "all">("all");

  const handleCreate = async () => {
    if (!form.content.trim()) return;
    await createLearning.mutateAsync({ data: form });
    queryClient.invalidateQueries({ queryKey: getListLearningsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    setForm({ month: 1, about: "both", content: "" });
    setShowForm(false);
    toast({ description: "Learning recorded" });
  };

  const handleDelete = async (id: number) => {
    await deleteLearning.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListLearningsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    toast({ description: "Removed" });
  };

  const filtered = filter === "all"
    ? learnings
    : learnings?.filter((l) => l.about === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-900 to-stone-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/">
            <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 text-sm font-sans">
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
          </Link>
          <Heart className="w-8 h-8 text-rose-300/70 mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">What We've Learned</h1>
          <p className="text-white/70 font-sans text-sm">
            {learnings?.length ?? 0} discoveries so far
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Filter + Add */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            {(["all", "seth", "elana", "both"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                data-testid={`filter-${f}`}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-sans border transition-colors",
                  filter === f
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/40"
                )}
              >
                {f === "all" ? "All" : ABOUT_LABELS[f]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            data-testid="button-add-learning"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-sans hover:opacity-90 transition-opacity"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add"}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-6 space-y-4"
          >
            <h3 className="font-serif text-xl text-foreground">Record a discovery</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground font-sans block mb-1.5">Month</label>
                <select
                  value={form.month}
                  onChange={(e) => setForm((f) => ({ ...f, month: parseInt(e.target.value, 10) }))}
                  data-testid="select-month"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {MONTH_NAMES.slice(1).map((name, i) => (
                    <option key={i + 1} value={i + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-sans block mb-1.5">About</label>
                <select
                  value={form.about}
                  onChange={(e) => setForm((f) => ({ ...f, about: e.target.value as AboutType }))}
                  data-testid="select-about"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="seth">Seth</option>
                  <option value="elana">Elana</option>
                  <option value="both">Both of us</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-sans block mb-1.5">What did you learn?</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Something you discovered tonight..."
                data-testid="input-learning-content"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground/50"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!form.content.trim()}
              data-testid="button-save-learning"
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-sans hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              Save
            </button>
          </motion.div>
        )}

        {isLoading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
          </div>
        )}

        {!isLoading && (!filtered || filtered.length === 0) && (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-foreground mb-2">Nothing here yet</h2>
            <p className="text-muted-foreground font-sans text-sm max-w-xs mx-auto">
              As you go through your dates, record the things you discover about each other.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {filtered?.slice().reverse().map((learning, i) => (
            <motion.div
              key={learning.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              data-testid={`learning-${learning.id}`}
              className="rounded-2xl border border-border bg-card p-5 flex gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-sans",
                    ABOUT_COLORS[learning.about as AboutType]
                  )}>
                    {ABOUT_LABELS[learning.about as AboutType]}
                  </span>
                  <span className="text-xs text-muted-foreground font-sans">
                    {MONTH_NAMES[learning.month]}
                  </span>
                </div>
                <p className="font-serif text-base text-foreground leading-relaxed">{learning.content}</p>
              </div>
              <button
                onClick={() => handleDelete(learning.id)}
                data-testid={`delete-learning-${learning.id}`}
                className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1 shrink-0 mt-0.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
