import {
  useListFavorites,
  useDeleteFavorite,
  getListFavoritesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Flame, Sparkles, MessageCircle, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const MONTH_NAMES = ["", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

const TYPE_CONFIG = {
  ritual: { label: "Rituals", icon: Flame, color: "text-amber-600 bg-amber-50 border-amber-200" },
  activity: { label: "Activities", icon: Sparkles, color: "text-violet-600 bg-violet-50 border-violet-200" },
  prompt: { label: "Prompts", icon: MessageCircle, color: "text-blue-600 bg-blue-50 border-blue-200" },
};

export default function Favorites() {
  const { data: favorites, isLoading } = useListFavorites({
    query: { queryKey: getListFavoritesQueryKey() },
  });
  const deleteFavorite = useDeleteFavorite();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    await deleteFavorite.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
    toast({ description: "Removed from favorites" });
  };

  const rituals = favorites?.filter((f) => f.type === "ritual") ?? [];
  const activities = favorites?.filter((f) => f.type === "activity") ?? [];
  const prompts = favorites?.filter((f) => f.type === "prompt") ?? [];

  const sections = [
    { key: "ritual", items: rituals },
    { key: "activity", items: activities },
    { key: "prompt", items: prompts },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-stone-700 to-amber-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/">
            <button className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 text-sm font-sans">
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
          </Link>
          <Star className="w-8 h-8 text-amber-300/70 mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-3">Saved Favorites</h1>
          <p className="text-white/70 font-sans text-sm">
            {favorites?.length ?? 0} things worth keeping
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin mx-auto" />
          </div>
        )}

        {!isLoading && (!favorites || favorites.length === 0) && (
          <div className="text-center py-20">
            <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-foreground mb-2">Nothing saved yet</h2>
            <p className="text-muted-foreground font-sans text-sm max-w-xs mx-auto leading-relaxed">
              On any date night page, you can save rituals, activities, and conversation prompts that you want to keep forever.
            </p>
            <Link href="/" className="inline-block mt-6 text-primary text-sm hover:underline font-sans">
              Explore your dates
            </Link>
          </div>
        )}

        <div className="space-y-10">
          {sections.map(({ key, items }) => {
            if (items.length === 0) return null;
            const config = TYPE_CONFIG[key];
            const Icon = config.icon;

            return (
              <section key={key}>
                <div className="flex items-center gap-2 mb-5">
                  <Icon className="w-4 h-4 text-primary/70" />
                  <h2 className="font-serif text-2xl text-foreground">{config.label}</h2>
                  <span className="text-xs text-muted-foreground font-sans ml-1">({items.length})</span>
                </div>
                <div className="space-y-3">
                  {items.map((fav, i) => (
                    <motion.div
                      key={fav.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      data-testid={`favorite-item-${fav.id}`}
                      className="rounded-2xl border border-border bg-card p-5 flex gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn(
                            "text-xs px-2.5 py-1 rounded-full border font-sans",
                            config.color
                          )}>
                            {config.label.slice(0, -1)}
                          </span>
                          <span className="text-xs text-muted-foreground font-sans">
                            from {MONTH_NAMES[fav.sourceMonth]}
                          </span>
                        </div>
                        <p className="font-serif text-base text-foreground leading-relaxed">{fav.content}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(fav.id)}
                        data-testid={`delete-favorite-${fav.id}`}
                        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1 shrink-0 mt-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
