import { useState } from "react";
import {
  useListReflections,
  useDeleteReflection,
  getListReflectionsQueryKey,
} from "@/lib/static-api";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Star, BookOpen, Trash2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export default function Reflections() {
  const { data: reflections, isLoading } = useListReflections({
    query: { queryKey: getListReflectionsQueryKey() },
  });
  const deleteReflection = useDeleteReflection();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await deleteReflection.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListReflectionsQueryKey() });
    setDeletingId(null);
    toast({ description: "Reflection removed" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-stone-800 to-rose-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/" data-testid="back-button">
            <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 text-sm font-sans">
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
          </Link>
          <BookOpen className="w-8 h-8 text-rose-300/70 mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">Memory Vault</h1>
          <p className="text-white/70 font-sans text-sm">
            {reflections?.length ?? 0} {reflections?.length === 1 ? "evening" : "evenings"} captured
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-serif italic">Loading your memories...</p>
          </div>
        )}

        {!isLoading && (!reflections || reflections.length === 0) && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="font-serif text-2xl text-foreground mb-3">Nothing here yet</h2>
            <p className="text-muted-foreground font-sans text-sm max-w-sm mx-auto leading-relaxed">
              After you complete a date night, you can add a reflection here — a small record of the evening, what you felt, and what you learned about each other.
            </p>
            <Link href="/" className="inline-block mt-6 text-primary text-sm hover:underline font-sans">
              Go to your dates
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {reflections?.slice().reverse().map((reflection, i) => (
            <motion.div
              key={reflection.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              data-testid={`reflection-${reflection.id}`}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              {/* Header bar */}
              <div className="bg-gradient-to-r from-stone-700 to-rose-800 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs tracking-widest uppercase font-sans">
                    Month {reflection.month}
                  </p>
                  <h3 className="font-serif text-xl text-white font-light">
                    {MONTH_NAMES[reflection.month]}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "w-4 h-4",
                          n <= reflection.rating ? "fill-amber-400 text-amber-400" : "text-white/20"
                        )}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(reflection.id)}
                    disabled={deletingId === reflection.id}
                    data-testid={`delete-reflection-${reflection.id}`}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white/80 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <ReflectionBlock label="Highlight" content={reflection.highlight} />
                <ReflectionBlock label="Memory" content={reflection.memory} />
                <ReflectionBlock label="What you learned" content={reflection.learnedAboutEachOther} />
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-sans pt-1 border-t border-border">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(reflection.createdAt), "MMMM d, yyyy")}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReflectionBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-sans mb-1.5">{label}</p>
      <p className="font-serif text-base text-foreground leading-relaxed">{content}</p>
    </div>
  );
}
