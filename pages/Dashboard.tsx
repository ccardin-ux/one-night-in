import { useRef, useState, useEffect } from "react";
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
  getPartnerNames,
  savePartnerNames,
  type PartnerNames,
} from "@/lib/static-api";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, BookOpen, Heart, Star, ChevronRight, Download, Upload, Trash2, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: dates, isLoading: datesLoading } = useListDates();
  const { data: summary } = useGetSummary();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showNameSetup, setShowNameSetup] = useState(false);
  const [names, setNames] = useState<PartnerNames>({ p1: "", p2: "" });
  const [draftNames, setDraftNames] = useState<PartnerNames>({ p1: "", p2: "" });

  const showTestingTools =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("test");

  // Load saved names on mount; show setup if not set yet
  useEffect(() => {
    const saved = getPartnerNames();
    if (saved.p1 && saved.p2) {
      setNames(saved);
    } else {
      setShowNameSetup(true);
      setDraftNames({ p1: "", p2: "" });
    }
  }, []);

  const handleSaveNames = () => {
    const trimmed = { p1: draftNames.p1.trim(), p2: draftNames.p2.trim() };
    if (!trimmed.p1 || !trimmed.p2) return;
    savePartnerNames(trimmed);
    setNames(trimmed);
    setShowNameSetup(false);
  };

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
    setNames({ p1: "", p2: "" });
    setShowNameSetup(true);
    toast({ description: "Test data cleared from this browser" });
  };

  if (datesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0d0b" }}>
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-full border border-[#c4623a]/30 border-t-[#c4623a] animate-spin mx-auto" />
          <p style={{ color: "#a89880", fontFamily: "Georgia, serif", fontSize: 16, fontStyle: "italic" }}>
            Setting the table...
          </p>
        </div>
      </div>
    );
  }

  const completedCount = summary?.completedDates ?? 0;
  const currentMonth = summary?.upcomingMonth ?? 1;
  const coupleLabel = names.p1 && names.p2 ? `${names.p1} & ${names.p2}` : "Your Year";

  return (
    <div className="min-h-screen" style={{ background: "#0f0d0b", color: "#f0e8dc" }}>

      {/* Name setup modal */}
      <AnimatePresence>
        {showNameSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.85)" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              style={{ background: "#181410", border: "0.5px solid rgba(255,255,255,0.1)", maxWidth: 420, width: "100%", padding: "40px 36px" }}
            >
              <p style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "#c4623a", marginBottom: 16, fontFamily: "sans-serif" }}>
                One Night In
              </p>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 30, fontWeight: 300, color: "#f0e8dc", marginBottom: 8, lineHeight: 1.1 }}>
                Before we begin.
              </h2>
              <p style={{ color: "#a89880", fontSize: 13, fontWeight: 300, marginBottom: 32, lineHeight: 1.7, fontFamily: "sans-serif" }}>
                What should we call you two? These names stay on your device — private to you.
              </p>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 8, fontFamily: "sans-serif" }}>
                  Partner 1
                </label>
                <input
                  value={draftNames.p1}
                  onChange={(e) => setDraftNames((d) => ({ ...d, p1: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveNames()}
                  placeholder="First name"
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "0.5px solid rgba(255,255,255,0.15)", color: "#f0e8dc", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300, padding: "8px 0", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: 36 }}>
                <label style={{ display: "block", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 8, fontFamily: "sans-serif" }}>
                  Partner 2
                </label>
                <input
                  value={draftNames.p2}
                  onChange={(e) => setDraftNames((d) => ({ ...d, p2: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveNames()}
                  placeholder="First name"
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "0.5px solid rgba(255,255,255,0.15)", color: "#f0e8dc", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300, padding: "8px 0", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <button
                onClick={handleSaveNames}
                disabled={!draftNames.p1.trim() || !draftNames.p2.trim()}
                style={{ width: "100%", background: "#c4623a", color: "#fdf5ee", border: "none", padding: "15px 32px", fontFamily: "sans-serif", fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", opacity: !draftNames.p1.trim() || !draftNames.p2.trim() ? 0.4 : 1 }}
              >
                Begin the year
              </button>

              {names.p1 && (
                <button
                  onClick={() => setShowNameSetup(false)}
                  style={{ display: "block", marginTop: 12, width: "100%", background: "transparent", border: "none", color: "#5a4e42", fontFamily: "sans-serif", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: "8px 0" }}
                >
                  Cancel
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <div style={{ borderBottom: "0.5px solid rgba(255,255,255,0.07)", padding: "52px 44px 44px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c4623a", marginBottom: 14, fontFamily: "sans-serif" }}>
              {coupleLabel}
            </p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 300, lineHeight: 1.05, marginBottom: 12 }}>
              Your year of{" "}
              <em style={{ fontStyle: "italic", color: "#e07a50" }}>dates.</em>
            </h1>
            <p style={{ color: "#a89880", fontSize: 14, fontWeight: 300, maxWidth: 360, lineHeight: 1.75, fontFamily: "sans-serif" }}>
              One meaningful evening together, every month.
            </p>
            <button
              onClick={() => { setDraftNames(names); setShowNameSetup(true); }}
              style={{ marginTop: 16, background: "transparent", border: "0.5px solid rgba(255,255,255,0.1)", color: "#5a4e42", fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer" }}
            >
              Edit names
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, marginTop: 44, borderTop: "0.5px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { label: "Evenings complete", value: completedCount },
              { label: "Memories saved", value: summary?.totalReflections ?? 0 },
              { label: "Months remaining", value: 12 - completedCount },
            ].map((stat, i) => (
              <div key={i} style={{ padding: "20px 0", borderRight: i < 2 ? "0.5px solid rgba(255,255,255,0.07)" : "none", paddingRight: i < 2 ? 24 : 0, paddingLeft: i > 0 ? 24 : 0 }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 36, fontWeight: 300, color: "#f0e8dc", lineHeight: 1, marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: "sans-serif", fontSize: 9, fontWeight: 200, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Month Grid */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 44px 0" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "#5a4e42" }}>Twelve evenings</span>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/reflections" style={{ fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c4623a", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              <BookOpen size={12} /> Memories
            </Link>
            <Link href="/learnings" style={{ fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#c4623a", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              <Heart size={12} /> Learnings
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 44px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: "0.5px solid rgba(255,255,255,0.07)" }}>
          {dates?.map((date, i) => {
            const isCurrent = date.month === currentMonth;
            const isCompleted = date.completed;
            const isLocked = !isCompleted && date.month > currentMonth;

            return (
              <motion.div
                key={date.month}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                style={{
                  borderRight: (i + 1) % 3 !== 0 ? "0.5px solid rgba(255,255,255,0.07)" : "none",
                  borderBottom: "0.5px solid rgba(255,255,255,0.07)",
                  opacity: isLocked ? 0.22 : isCompleted ? 0.45 : 1,
                  position: "relative",
                }}
              >
                {isCurrent && !isCompleted && (
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "#c4623a" }} />
                )}
                <Link href={isLocked || isCompleted ? "#" : `/month/${date.month}`} data-testid={`month-card-${date.month}`}>
                  <div
                    style={{ padding: "24px 22px", cursor: isLocked || isCompleted ? "default" : "pointer", background: "transparent", transition: "background 0.2s" }}
                    onMouseEnter={(e) => { if (!isLocked && !isCompleted) (e.currentTarget as HTMLDivElement).style.background = "#181410"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div style={{ fontFamily: "sans-serif", fontSize: 9, fontWeight: 200, letterSpacing: "0.22em", textTransform: "uppercase", color: isCurrent && !isCompleted ? "#c4623a" : "#5a4e42", marginBottom: 8 }}>
                      Month {date.month}
                    </div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300, color: "#f0e8dc", lineHeight: 1.1, marginBottom: 6 }}>
                      {date.destination}
                    </div>
                    <div style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 200, color: "#5a4e42", letterSpacing: "0.06em" }}>
                      {date.effort} · {date.cost}
                    </div>
                    {isCurrent && !isCompleted && (
                      <div style={{ marginTop: 10, display: "inline-block", fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4623a", border: "0.5px solid #c4623a", padding: "3px 8px" }}>
                        Tonight
                      </div>
                    )}
                    {isCompleted && (
                      <div style={{ marginTop: 10, fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5a4e42" }}>
                        Complete
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Footer nav */}
      <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", padding: "24px 44px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[
              { href: "/reflections", label: "Memory Vault", icon: BookOpen },
              { href: "/learnings", label: "Learnings", icon: Heart },
              { href: "/favorites", label: "Favorites", icon: Star },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#5a4e42", padding: "8px 12px", cursor: "pointer" }}>
                  <Icon size={12} />
                  {label}
                </div>
              </Link>
            ))}
          </div>

          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <button onClick={handleExport} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "0.5px solid rgba(255,255,255,0.1)", background: "transparent", color: "#a89880", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
              <Download size={12} /> Backup
            </button>
            <button onClick={handleKeepsake} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "0.5px solid rgba(255,255,255,0.1)", background: "transparent", color: "#a89880", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
              <FileText size={12} /> Keepsake
            </button>
            <button onClick={() => importInputRef.current?.click()} disabled={isImporting} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "0.5px solid rgba(255,255,255,0.1)", background: "transparent", color: "#a89880", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", opacity: isImporting ? 0.5 : 1 }}>
              <Upload size={12} /> Restore
            </button>
            {showTestingTools && (
              <button onClick={handleClearData} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "0.5px solid rgba(196,98,58,0.3)", background: "transparent", color: "#c4623a", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
                <Trash2 size={12} /> Clear
              </button>
            )}
            <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => handleImport(e.target.files?.[0])} />
          </div>
        </div>
      </div>
    </div>
  );
}
