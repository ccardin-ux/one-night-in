import { useListDates, useGetSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Calendar, BookOpen, Heart, Star, ChevronRight } from "lucide-react";
import { cn, getMonthGradient } from "@/lib/utils";

export default function Dashboard() {
  const { data: dates, isLoading: datesLoading } = useListDates();
  const { data: summary } = useGetSummary();

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
              Seth &amp; Elana
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6">
              Year of Dates
            </h1>
            <p className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed font-light">
              One meaningful evening together, every month of your first year of marriage.
              Food. Music. Conversation. Adventure.
            </p>
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
                      {date.scheduledDate && !isCompleted && (
                        <div className="mt-2 text-xs text-primary/70 flex items-center gap-1">
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
