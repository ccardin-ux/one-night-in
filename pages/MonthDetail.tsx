import { useState, useEffect } from "react";
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
  getPartnerNames,
  getMonthRoles,
  saveMonthRoles,
  type MonthRoles,
  type PartnerNames,
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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASE_LABELS_COOK = ["Choose Recipe", "Source & Prep", "Cook Night"];
const PHASE_LABELS_VIBE = ["Choose Vibe", "Build Playlist", "Set the Mood"];

const VIBE_SUGGESTIONS: Record<string, string> = {
  "Soft & floral": "Studio Ghibli playlist",
  "Lo-fi jazz": "Tokyo jazz café",
  "Ambient calm": "Japanese ambient",
  "Upbeat": "upbeat J-pop 2024",
  "Cinematic": "Joe Hisaishi",
};

// ─── Date night flow modal ────────────────────────────────────────────────────

type FlowStep = "roles" | "ritual" | "culture" | "vibes" | "done";

function DateNightFlow({
  month,
  destination,
  dish,
  names,
  savedRoles,
  onComplete,
  onDismiss,
}: {
  month: number;
  destination: string;
  dish: string;
  names: PartnerNames;
  savedRoles: MonthRoles | null;
  onComplete: (roles: MonthRoles) => void;
  onDismiss: () => void;
}) {
  const p1 = names.p1 || "Partner 1";
  const p2 = names.p2 || "Partner 2";

  const [step, setStep] = useState<FlowStep>("roles");
  const [cookPartner, setCookPartner] = useState<"p1" | "p2">(savedRoles?.cookPartner ?? "p1");
  const [sousChef, setSousChef] = useState<boolean>(savedRoles?.sousChef ?? false);
  const [ritual, setRitual] = useState<MonthRoles["ritual"]>(savedRoles?.ritual ?? "candle");
  const [vibe, setVibe] = useState<string>(savedRoles?.vibe ?? "Studio Ghibli playlist");
  const [aiStory, setAiStory] = useState<string>("");
  const [aiStarters, setAiStarters] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  const vibePartner: "p1" | "p2" = cookPartner === "p1" ? "p2" : "p1";
  const cookName = cookPartner === "p1" ? p1 : p2;
  const vibeName = vibePartner === "p1" ? p1 : p2;

  const PROGRESS: Record<FlowStep, number> = { roles: 25, ritual: 50, culture: 75, vibes: 100, done: 100 };

  function buildCultureMoment() {
    return {
      story: `Tonight, ${destination} comes into the room through ${dish}: the aromas, textures, and small rituals that make a meal feel like travel without leaving home. Let the dish become a way into the place, then notice what it brings out in the two of you.`,
      starters: [
        `What part of ${destination} would you want to experience together first?`,
        `What does ${dish} make you curious about: the place, the ingredients, or the people who cook it?`,
        "What is one tradition from your own life that you would want to bring into future nights like this?",
      ],
    };
  }

  async function loadCulture() {
    if (aiLoaded) return;
    setAiLoading(true);
    setAiError(false);
    try {
      const parsed = buildCultureMoment();
      setAiStory(parsed.story);
      setAiStarters(parsed.starters);
      setAiLoaded(true);
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  }

  function handleNext() {
    if (step === "roles") setStep("ritual");
    else if (step === "ritual") { setStep("culture"); loadCulture(); }
    else if (step === "culture") setStep("vibes");
    else if (step === "vibes") {
      const roles: MonthRoles = { cookPartner, vibePartner, sousChef, ritual, vibe };
      saveMonthRoles(month, roles);
      onComplete(roles);
    }
  }

  function handleBack() {
    if (step === "ritual") setStep("roles");
    else if (step === "culture") setStep("ritual");
    else if (step === "vibes") setStep("culture");
  }

  const ritualLabels: Record<MonthRoles["ritual"], string> = {
    candle: "Light a candle together",
    toast: "Make a toast",
    song: "First song",
  };
  const spotifyHref = `https://open.spotify.com/search/${encodeURIComponent(`${vibe} ${destination} date night playlist`)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        style={{ background: "#0f0d0b", border: "0.5px solid rgba(255,255,255,0.1)", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Progress */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, height: 1, background: "#c4623a", width: `${PROGRESS[step]}%`, transition: "width 0.4s ease" }} />
        </div>

        <div style={{ padding: "32px 36px" }}>
          {/* Nav row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            {step !== "roles" ? (
              <button onClick={handleBack} style={{ background: "none", border: "none", color: "#a89880", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", padding: 0 }}>
                ← Back
              </button>
            ) : <div />}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4623a" }}>
                {destination}
              </span>
              <button onClick={onDismiss} style={{ background: "none", border: "none", color: "#5a4e42", cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* STEP: Roles */}
          {step === "roles" && (
            <div>
              <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 10 }}>Step 1 of 4</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#f0e8dc", lineHeight: 1.1, marginBottom: 8 }}>
                Who leads the kitchen <em style={{ fontStyle: "italic" }}>tonight?</em>
              </h2>
              <p style={{ color: "#a89880", fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 28, fontFamily: "sans-serif" }}>
                The one who doesn't cook owns the whole atmosphere.
              </p>

              {/* P1 */}
              <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4623a", marginBottom: 8 }}>{p1}</div>
              {[
                { label: "Lead cook", desc: "The kitchen is yours tonight.", val: "p1" as const, role: "cook" },
                { label: "Vibe curator", desc: "Music, candles, the mood of the whole evening.", val: "p1" as const, role: "vibe" },
              ].map(({ label, desc, role }) => {
                const isSelected = role === "cook" ? cookPartner === "p1" : cookPartner !== "p1";
                return (
                  <div key={role} onClick={() => { if (role === "cook") { setCookPartner("p1"); setSousChef(false); } else { setCookPartner("p2"); setSousChef(false); } }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 0", borderBottom: "0.5px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `0.5px solid ${isSelected ? "#c4623a" : "#5a4e42"}`, background: isSelected ? "#c4623a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4, transition: "all 0.15s" }}>
                      {isSelected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0f0d0b" }} />}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#f0e8dc" }}>{label}</div>
                      <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#5a4e42", marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                );
              })}

              {/* P2 */}
              <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4623a", marginBottom: 8, marginTop: 20 }}>{p2}</div>
              {(cookPartner === "p1"
                ? [
                    { label: "Sous chef", desc: "Help when called. Step back when not.", isSous: true },
                    { label: "Vibe curator", desc: "Music, candles, the mood of the whole evening.", isSous: false },
                  ]
                : [
                    { label: "Lead cook", desc: "The kitchen is yours tonight.", isSous: false },
                  ]
              ).map(({ label, desc, isSous }) => {
                const isSelected = cookPartner === "p2" ? !isSous || label === "Lead cook" : sousChef === isSous;
                return (
                  <div key={label} onClick={() => {
                    if (cookPartner === "p1") setSousChef(isSous);
                    else { setCookPartner("p2"); setSousChef(false); }
                  }}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 0", borderBottom: "0.5px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `0.5px solid ${isSelected ? "#c4623a" : "#5a4e42"}`, background: isSelected ? "#c4623a" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 4, transition: "all 0.15s" }}>
                      {isSelected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#0f0d0b" }} />}
                    </div>
                    <div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#f0e8dc" }}>{label}</div>
                      <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#5a4e42", marginTop: 2 }}>{desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP: Ritual */}
          {step === "ritual" && (
            <div>
              <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 10 }}>Step 2 of 4</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#f0e8dc", lineHeight: 1.1, marginBottom: 8 }}>
                How does the evening <em style={{ fontStyle: "italic" }}>begin?</em>
              </h2>
              <p style={{ color: "#a89880", fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 28, fontFamily: "sans-serif" }}>
                One small act. The line between ordinary and intentional.
              </p>
              {(["candle", "toast", "song"] as const).map((r) => {
                const labels: Record<typeof r, { title: string; desc: string }> = {
                  candle: { title: "Light a candle together", desc: "One flame, two hands. The evening begins when it catches." },
                  toast: { title: "Make a toast", desc: "Pour something worth raising. Name one thing you're grateful for, right now." },
                  song: { title: "First song", desc: "The vibe curator chooses. Everything that follows begins with that note." },
                };
                const isSelected = ritual === r;
                return (
                  <div key={r} onClick={() => setRitual(r)}
                    style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "18px 0", borderBottom: "0.5px solid rgba(255,255,255,0.07)", cursor: "pointer" }}>
                    <div style={{ width: 14, height: 14, border: `0.5px solid ${isSelected ? "#c4623a" : "#5a4e42"}`, background: isSelected ? "#c4623a" : "transparent", flexShrink: 0, marginTop: 5, transition: "all 0.15s" }} />
                    <div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#f0e8dc" }}>{labels[r].title}</div>
                      <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "#5a4e42", marginTop: 3, lineHeight: 1.6 }}>{labels[r].desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP: Culture */}
          {step === "culture" && (
            <div>
              <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 10 }}>Step 3 of 4</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#f0e8dc", lineHeight: 1.1, marginBottom: 8 }}>
                Tonight, you're in <em style={{ fontStyle: "italic", color: "#e07a50" }}>{destination}.</em>
              </h2>
              <p style={{ color: "#a89880", fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 24, fontFamily: "sans-serif" }}>
                Read this together before a single knife is lifted.
              </p>

              {aiLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0", color: "#5a4e42", fontFamily: "sans-serif", fontSize: 12 }}>
                  <div style={{ width: 14, height: 14, border: "0.5px solid #5a4e42", borderTopColor: "#c4623a", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  Composing your cultural moment...
                </div>
              )}

              {!aiLoading && aiStory && (
                <div style={{ background: "#181410", padding: "24px", marginBottom: 16 }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4623a", marginBottom: 14 }}>The story</div>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 300, fontStyle: "italic", color: "#d4c0a8", lineHeight: 1.85, margin: 0 }}>{aiStory}</p>
                  {aiStarters.length > 0 && (
                    <>
                      <div style={{ height: "0.5px", background: "rgba(255,255,255,0.08)", margin: "20px 0" }} />
                      <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 12 }}>Conversation starters</div>
                      {aiStarters.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < aiStarters.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none" }}>
                          <span style={{ fontFamily: "Georgia, serif", fontSize: 14, fontStyle: "italic", color: "#c4623a", flexShrink: 0 }}>{i + 1}</span>
                          <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", lineHeight: 1.65 }}>{s}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {!aiLoading && aiError && (
                <p style={{ color: "#5a4e42", fontSize: 13, fontFamily: "sans-serif", marginBottom: 16 }}>
                  Couldn't load the cultural moment — but the evening doesn't need permission to begin.
                </p>
              )}

              <div style={{ background: "#181410", padding: "20px", border: "0.5px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 6 }}>Tonight's dish</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#f0e8dc" }}>{dish}</div>
              </div>
            </div>
          )}

          {/* STEP: Vibes */}
          {step === "vibes" && (
            <div>
              <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 10 }}>Step 4 of 4</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 300, color: "#f0e8dc", lineHeight: 1.1, marginBottom: 6 }}>
                Set the <em style={{ fontStyle: "italic" }}>mood.</em>
              </h2>
              <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4623a", marginBottom: 20 }}>
                {vibeName}'s call.
              </div>

              {/* Partner tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,0.07)", marginBottom: 24 }}>
                {[
                  { name: p1, role: cookPartner === "p1" ? "In the kitchen" : "Vibe curator", isVibe: cookPartner !== "p1" },
                  { name: p2, role: cookPartner === "p2" ? "In the kitchen" : "Vibe curator", isVibe: cookPartner !== "p2" },
                ].map(({ name, role, isVibe }) => (
                  <div key={name} style={{ background: isVibe ? "rgba(196,98,58,0.08)" : "#181410", padding: "16px 18px", border: isVibe ? "0.5px solid rgba(196,98,58,0.2)" : "none" }}>
                    <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: isVibe ? "#c4623a" : "#5a4e42", marginBottom: 6 }}>{name.toUpperCase()}</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 300, color: isVibe ? "#e07a50" : "#a89880" }}>{role}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                {Object.keys(VIBE_SUGGESTIONS).map((v) => {
                  const suggestion = VIBE_SUGGESTIONS[v];
                  const isSelected = vibe === suggestion;
                  return (
                    <button key={v} onClick={() => setVibe(suggestion)}
                      style={{ fontFamily: "sans-serif", fontSize: 10, fontWeight: 200, letterSpacing: "0.15em", textTransform: "uppercase", padding: "9px 16px", border: `0.5px solid ${isSelected ? "#c4623a" : "rgba(255,255,255,0.13)"}`, color: isSelected ? "#c4623a" : "#a89880", background: isSelected ? "rgba(196,98,58,0.08)" : "transparent", cursor: "pointer", transition: "all 0.15s" }}>
                      {v}
                    </button>
                  );
                })}
              </div>

              <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.07)", paddingTop: 16, marginBottom: 8 }}>
                <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 8 }}>Search Spotify</div>
                <a href={spotifyHref} target="_blank" rel="noreferrer" style={{ display: "inline-block", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 300, color: "#f0e8dc", textDecoration: "underline", textUnderlineOffset: 4 }}>"{vibe}"</a>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleNext}
            disabled={step === "culture" && aiLoading}
            style={{ width: "100%", background: step === "vibes" ? "#c4623a" : "#c4623a", color: "#fdf5ee", border: "none", padding: "15px 32px", fontFamily: "sans-serif", fontSize: 11, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", marginTop: 32, opacity: step === "culture" && aiLoading ? 0.4 : 1, transition: "opacity 0.2s" }}
          >
            {step === "roles" && "Choose your ritual"}
            {step === "ritual" && "Enter tonight's world"}
            {step === "culture" && "Set the vibe"}
            {step === "vibes" && "The evening begins"}
          </button>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

// ─── Summary banner (shown after flow complete) ────────────────────────────────

function RolesBanner({ roles, names, onEdit }: { roles: MonthRoles; names: PartnerNames; onEdit: () => void }) {
  const p1 = names.p1 || "Partner 1";
  const p2 = names.p2 || "Partner 2";
  const cookName = roles.cookPartner === "p1" ? p1 : p2;
  const vibeName = roles.vibePartner === "p1" ? p1 : p2;
  const ritualLabels: Record<MonthRoles["ritual"], string> = {
    candle: "Light a candle together",
    toast: "Make a toast",
    song: "First song",
  };
  return (
    <div style={{ background: "#181410", borderBottom: "0.5px solid rgba(255,255,255,0.07)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 4 }}>Lead cook</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 300, color: "#f0e8dc" }}>{cookName}</div>
        </div>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 4 }}>Vibe curator</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 300, color: "#f0e8dc" }}>{vibeName}</div>
        </div>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 4 }}>Opening ritual</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 300, color: "#f0e8dc" }}>{ritualLabels[roles.ritual]}</div>
        </div>
        <div>
          <div style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 4 }}>Mood</div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 300, color: "#f0e8dc" }}>"{roles.vibe}"</div>
        </div>
      </div>
      <button onClick={onEdit} style={{ background: "transparent", border: "0.5px solid rgba(255,255,255,0.1)", color: "#a89880", fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer" }}>
        Edit tonight
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MonthDetail() {
  const { month } = useParams<{ month: string }>();
  const monthNum = parseInt(month || "1", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showFlow, setShowFlow] = useState(false);
  const [savedRoles, setSavedRoles] = useState<MonthRoles | null>(null);
  const [names, setNames] = useState<PartnerNames>({ p1: "", p2: "" });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [reflectionData, setReflectionData] = useState({ highlight: "", memory: "", learnedAboutEachOther: "", rating: 5 });

  useEffect(() => {
    const n = getPartnerNames();
    setNames(n);
    const r = getMonthRoles(monthNum);
    setSavedRoles(r);
    // Show flow automatically if not yet set for this month
    if (!r) setShowFlow(true);
  }, [monthNum]);

  const { data: date, isLoading } = useGetDate(monthNum, { query: { enabled: !!monthNum, queryKey: getGetDateQueryKey(monthNum) } });
  const { data: checklist } = useGetChecklist(monthNum, { query: { enabled: !!monthNum, queryKey: getGetChecklistQueryKey(monthNum) } });
  const { data: favorites } = useListFavorites({ query: { queryKey: getListFavoritesQueryKey() } });

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
    if (favId) { await deleteFavorite.mutateAsync({ id: favId }); toast({ description: "Removed from favorites" }); }
    else { await createFavorite.mutateAsync({ data: { type, content, sourceMonth: monthNum } }); toast({ description: "Saved to favorites" }); }
    queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
  };

  const handleToggleChecklist = async (itemId: number, completed: boolean) => {
    await toggleItem.mutateAsync({ month: monthNum, itemId, data: { completed: !completed } });
    queryClient.invalidateQueries({ queryKey: getGetChecklistQueryKey(monthNum) });
  };

  const handleChooseRecipe = async (recipeId: number) => {
    await updateDate.mutateAsync({ month: monthNum, data: { sethRecipeChoice: recipeId, sethPhase: 2 } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: "Recipe chosen. Time to source those ingredients." });
  };

  const handleChooseVibe = async (vibeId: string) => {
    await updateDate.mutateAsync({ month: monthNum, data: { elanaVibeChoice: vibeId, elanaPhase: 2 } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: "Vibe locked in. Time to build that playlist." });
  };

  const handleResetCookChoice = async () => {
    await updateDate.mutateAsync({ month: monthNum, data: { sethRecipeChoice: null, sethPhase: 1 } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: "No worries — pick whichever dish feels right." });
  };

  const handleResetVibeChoice = async () => {
    await updateDate.mutateAsync({ month: monthNum, data: { elanaVibeChoice: null, elanaPhase: 1 } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: "Vibe reset — choose the one that fits tonight." });
  };

  const handleAdvanceCookPhase = async () => {
    const next = Math.min((date?.sethPhase ?? 1) + 1, 3);
    await updateDate.mutateAsync({ month: monthNum, data: { sethPhase: next } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: next === 3 ? "Cook night! Let's go." : "Phase updated." });
  };

  const handleAdvanceVibePhase = async () => {
    const next = Math.min((date?.elanaPhase ?? 1) + 1, 3);
    await updateDate.mutateAsync({ month: monthNum, data: { elanaPhase: next } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    toast({ description: next === 3 ? "Playlist ready. Date night incoming." : "Phase updated." });
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
    await updateDate.mutateAsync({ month: monthNum, data: { completed: true, completedAt: new Date().toISOString() } });
    queryClient.invalidateQueries({ queryKey: getGetDateQueryKey(monthNum) });
    queryClient.invalidateQueries({ queryKey: getListDatesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    setShowReflectionModal(true);
  };

  const handleSaveReflection = async () => {
    await createReflection.mutateAsync({ data: { month: monthNum, ...reflectionData } });
    queryClient.invalidateQueries({ queryKey: getListReflectionsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
    setShowReflectionModal(false);
    toast({ description: "Reflection saved. Beautiful." });
  };

  const handleAddToCalendar = () => {
    if (!date) return;
    const title = `Date Night: ${date.theme} — ${date.monthName}`;
    if (date.scheduledDate) window.open(generateGoogleCalendarUrl(title, date.scheduledDate, date.intro), "_blank");
    else setShowScheduleModal(true);
  };

  if (isLoading || !date) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0d0b" }}>
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-full border border-[#c4623a]/30 border-t-[#c4623a] animate-spin mx-auto" />
          <p style={{ color: "#a89880", fontFamily: "Georgia, serif", fontStyle: "italic" }}>Preparing your evening...</p>
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

  const cookName = savedRoles ? (savedRoles.cookPartner === "p1" ? (names.p1 || "Partner 1") : (names.p2 || "Partner 2")) : "Cook";
  const vibeName = savedRoles ? (savedRoles.vibePartner === "p1" ? (names.p1 || "Partner 1") : (names.p2 || "Partner 2")) : "Vibe";

  const phaseChecklistItems = checklist?.filter((item) => item.person === "seth" && item.phase === sethPhase) ?? [];
  const elanaChecklistItems = checklist?.filter((item) => item.person === "elana" && item.phase === elanaPhase) ?? [];
  const bothChecklistItems = checklist?.filter((item) => item.person === "both") ?? [];

  return (
    <div className="min-h-screen" style={{ background: "#0f0d0b", color: "#f0e8dc" }}>

      {/* Date Night Flow Modal */}
      <AnimatePresence>
        {showFlow && (
          <DateNightFlow
            month={monthNum}
            destination={date.destination}
            dish={chosenRecipe?.dish ?? dinner.options[0]?.dish ?? date.theme}
            names={names}
            savedRoles={savedRoles}
            onComplete={(roles) => { setSavedRoles(roles); setShowFlow(false); }}
            onDismiss={() => setShowFlow(false)}
          />
        )}
      </AnimatePresence>

      {/* Hero */}
      <div className={cn("relative bg-gradient-to-br text-white", gradient)}>
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-5xl mx-auto px-6 py-12">
          <Link href="/" data-testid="back-button">
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", marginBottom: 32, fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
              <ArrowLeft size={14} /> All months
            </button>
          </Link>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
              Month {date.month} — {date.monthName}
            </p>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 300, marginBottom: 8, lineHeight: 1.05 }}>{date.theme}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 12, fontFamily: "sans-serif" }}>
              <MapPin size={12} /> {date.destination}
            </div>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 18, fontStyle: "italic", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 560 }}>{date.tagline}</p>
            <div style={{ display: "flex", gap: 20, marginTop: 20, color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "sans-serif" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={11} />{date.duration}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><DollarSign size={11} />{date.cost}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Flame size={11} />{date.effort}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Roles banner */}
      {savedRoles && !date.completed && (
        <RolesBanner roles={savedRoles} names={names} onEdit={() => setShowFlow(true)} />
      )}

      {/* Start flow CTA if no roles set */}
      {!savedRoles && !date.completed && (
        <div style={{ background: "#181410", borderBottom: "0.5px solid rgba(255,255,255,0.07)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ color: "#a89880", fontFamily: "sans-serif", fontSize: 13, fontWeight: 200 }}>Set up tonight's roles, ritual, and vibe before you start.</p>
          <button onClick={() => setShowFlow(true)} style={{ background: "#c4623a", color: "#fdf5ee", border: "none", padding: "12px 24px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
            Begin the evening
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
        {/* Intro */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p style={{ fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.75, color: "rgba(240,232,220,0.7)", fontStyle: "italic" }}>{date.intro}</p>
        </motion.section>

        {/* Action bar */}
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <button onClick={handleAddToCalendar} data-testid="button-add-calendar"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c4623a", color: "#fdf5ee", border: "none", padding: "11px 20px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
            <CalendarPlus size={13} /> Add to Calendar
          </button>
          <button onClick={() => { if (date.scheduledDate) downloadICS(`Date Night: ${date.theme}`, date.scheduledDate, date.intro); else setShowScheduleModal(true); }}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "0.5px solid rgba(255,255,255,0.13)", color: "#a89880", padding: "11px 20px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
            <Calendar size={13} /> Download .ics
          </button>
          {!date.completed && (
            <button onClick={handleMarkComplete} data-testid="button-mark-complete"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", border: "0.5px solid rgba(196,98,58,0.4)", color: "#c4623a", padding: "11px 20px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", marginLeft: "auto" }}>
              <Check size={13} /> Mark as Complete
            </button>
          )}
          {date.completed && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(196,98,58,0.1)", border: "0.5px solid rgba(196,98,58,0.3)", color: "#c4623a", padding: "11px 20px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", marginLeft: "auto" }}>
              <Star size={13} /> Completed
            </div>
          )}
        </motion.section>

        {/* Two-track journey */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cook track */}
          <div style={{ border: "0.5px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ background: "#1c1410", padding: "20px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ChefHat size={14} style={{ color: "#c4623a" }} />
                <span style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4623a" }}>{cookName}'s Kitchen</span>
              </div>
              <PhaseStepper phase={sethPhase} labels={PHASE_LABELS_COOK} />
            </div>
            <div style={{ padding: "24px", background: "#0f0d0b" }}>
              {sethPhase === 1 && <SethPhase1 options={dinner.options} sourcingItems={phaseChecklistItems} onChoose={handleChooseRecipe} onToggle={handleToggleChecklist} isPending={updateDate.isPending} />}
              {sethPhase === 2 && <SethPhase2 chosenRecipe={chosenRecipe} sethItems={phaseChecklistItems} onToggle={handleToggleChecklist} onAdvance={handleAdvanceCookPhase} onReset={handleResetCookChoice} isPending={updateDate.isPending} />}
              {sethPhase === 3 && <SethPhase3 chosenRecipe={chosenRecipe} onReset={handleResetCookChoice} isPending={updateDate.isPending} />}
            </div>
          </div>

          {/* Vibe track */}
          <div style={{ border: "0.5px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ background: "#1a1018", padding: "20px 24px", borderBottom: "0.5px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Music size={14} style={{ color: "#c4623a" }} />
                <span style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4623a" }}>{vibeName}'s Soundscape</span>
              </div>
              <PhaseStepper phase={elanaPhase} labels={PHASE_LABELS_VIBE} />
            </div>
            <div style={{ padding: "24px", background: "#0f0d0b" }}>
              {elanaPhase === 1 && <ElanaPhase1 moods={music.moods} onChoose={handleChooseVibe} isPending={updateDate.isPending} />}
              {elanaPhase === 2 && <ElanaPhase2 chosenMood={chosenMood} elanaItems={elanaChecklistItems} onToggle={handleToggleChecklist} onAdvance={handleAdvanceVibePhase} onReset={handleResetVibeChoice} isPending={updateDate.isPending} />}
              {elanaPhase === 3 && <ElanaPhase3 chosenMood={chosenMood} onReset={handleResetVibeChoice} isPending={updateDate.isPending} />}
            </div>
          </div>
        </motion.div>

        {/* Both checklist */}
        {bothChecklistItems.length > 0 && (
          <Section title="Date Night Prep" icon={CheckSquare} delay={0.25}>
            <div style={{ border: "0.5px solid rgba(255,255,255,0.07)" }}>
              {bothChecklistItems.map((item) => (
                <button key={item.id} onClick={() => handleToggleChecklist(item.id, item.completed)} data-testid={`checklist-item-${item.id}`}
                  style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.05)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  {item.completed ? <CheckSquare size={16} style={{ color: "#c4623a", flexShrink: 0, marginTop: 2 }} /> : <Square size={16} style={{ color: "#5a4e42", flexShrink: 0, marginTop: 2 }} />}
                  <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: item.completed ? "#5a4e42" : "#a89880", textDecoration: item.completed ? "line-through" : "none", lineHeight: 1.5 }}>
                    {item.label.replace(/^Both:\s*/i, "")}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Opening Ritual */}
        <Section title="Opening Ritual" icon={Flame} delay={0.3}>
          <FavoriteCard title={ritual.title} body={ritual.description} favType="ritual" isFavorited={isFavorited("ritual", ritual.title)} onToggle={() => handleToggleFavorite("ritual", ritual.title)} data-testid="ritual-card" />
        </Section>

        {/* Discover */}
        {funFacts.length > 0 && (
          <Section title="Discover" icon={Leaf} delay={0.33}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {funFacts.map((fact, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
                  style={{ padding: "16px 20px", border: "0.5px solid rgba(255,255,255,0.07)", background: "#181410" }}>
                  <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", lineHeight: 1.65, margin: 0 }}>{fact}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Conversation */}
        <Section title="Conversation" icon={MessageCircle} delay={0.35}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {prompts.map((prompt, i) => (
              <FavoriteCard key={i} title={`Prompt ${i + 1}`} body={prompt} favType="prompt" isFavorited={isFavorited("prompt", prompt)} onToggle={() => handleToggleFavorite("prompt", prompt)} data-testid={`prompt-${i}`} />
            ))}
          </div>
        </Section>

        {/* Activity */}
        <Section title="The Activity" icon={Sparkles} delay={0.4}>
          <FavoriteCard title={activity.title} body={activity.description} favType="activity" isFavorited={isFavorited("activity", activity.title)} onToggle={() => handleToggleFavorite("activity", activity.title)} data-testid="activity-card" />
        </Section>

        {/* Local Add-On */}
        <Section title="If You Leave the House" icon={Navigation} delay={0.45}>
          <div style={{ border: "0.5px solid rgba(255,255,255,0.07)", background: "#181410", padding: "24px" }}>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 300, color: "#f0e8dc", marginBottom: 8 }}>{localAddOn.title}</h3>
            <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", lineHeight: 1.65, margin: 0 }}>{localAddOn.description}</p>
          </div>
        </Section>

        {/* Post-date reflection */}
        {date.completed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ border: "0.5px solid rgba(196,98,58,0.2)", background: "rgba(196,98,58,0.05)", padding: "32px", textAlign: "center" }}>
            <BookOpen size={20} style={{ color: "#c4623a", margin: "0 auto 12px" }} />
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#f0e8dc", marginBottom: 8 }}>This date is complete</h3>
            <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", marginBottom: 20 }}>Add a reflection to capture what you felt and what you learned.</p>
            <button onClick={() => setShowReflectionModal(true)}
              style={{ background: "#c4623a", color: "#fdf5ee", border: "none", padding: "13px 28px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer" }}>
              Write a Reflection
            </button>
          </motion.div>
        )}
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <Modal title="When is your date?" onClose={() => setShowScheduleModal(false)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 8 }}>Pick a date</label>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} data-testid="input-schedule-date"
                  style={{ width: "100%", background: "transparent", border: "0.5px solid rgba(255,255,255,0.13)", color: "#f0e8dc", fontFamily: "sans-serif", fontSize: 14, padding: "10px 14px", outline: "none", boxSizing: "border-box" }} />
              </div>
              <button onClick={handleSchedule} disabled={!scheduleDate} data-testid="button-save-schedule"
                style={{ width: "100%", background: "#c4623a", color: "#fdf5ee", border: "none", padding: "14px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", opacity: !scheduleDate ? 0.4 : 1 }}>
                Schedule & Add to Google Calendar
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Reflection Modal */}
      <AnimatePresence>
        {showReflectionModal && (
          <Modal title="How was the evening?" subtitle="Take a moment to capture what you felt and what you learned." onClose={() => setShowReflectionModal(false)}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ReflectionField label="The highlight of the evening" value={reflectionData.highlight} onChange={(v) => setReflectionData((d) => ({ ...d, highlight: v }))} placeholder="What moment will you remember most?" data-testid="input-highlight" />
              <ReflectionField label="A memory to keep" value={reflectionData.memory} onChange={(v) => setReflectionData((d) => ({ ...d, memory: v }))} placeholder="Something you want to hold onto..." data-testid="input-memory" />
              <ReflectionField label="Something you learned about each other" value={reflectionData.learnedAboutEachOther} onChange={(v) => setReflectionData((d) => ({ ...d, learnedAboutEachOther: v }))} placeholder="What did you discover tonight?" data-testid="input-learned" />
              <div>
                <label style={{ display: "block", fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 10 }}>How was tonight?</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setReflectionData((d) => ({ ...d, rating: n }))} data-testid={`rating-${n}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                      <Star size={24} style={{ color: n <= reflectionData.rating ? "#c4623a" : "#5a4e42", fill: n <= reflectionData.rating ? "#c4623a" : "none", transition: "all 0.15s" }} />
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSaveReflection} disabled={!reflectionData.highlight || !reflectionData.memory || !reflectionData.learnedAboutEachOther} data-testid="button-save-reflection"
                style={{ width: "100%", background: "#c4623a", color: "#fdf5ee", border: "none", padding: "14px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", opacity: !reflectionData.highlight || !reflectionData.memory || !reflectionData.learnedAboutEachOther ? 0.4 : 1 }}>
                Save Reflection
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components (unchanged logic, restyled) ────────────────────────────────

function PhaseStepper({ phase, labels }: { phase: number; labels: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {labels.map((label, i) => {
        const stepNum = i + 1;
        const isActive = phase === stepNum;
        const isDone = phase > stepNum;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: isActive ? 1 : isDone ? 0.6 : 0.25 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: "sans-serif", flexShrink: 0, background: isDone ? "#c4623a" : isActive ? "#f0e8dc" : "rgba(255,255,255,0.15)", color: isDone || isActive ? "#0f0d0b" : "#f0e8dc" }}>
                {isDone ? <Check size={10} /> : stepNum}
              </div>
              <span style={{ fontFamily: "sans-serif", fontSize: 10, color: "#f0e8dc", display: window.innerWidth > 640 ? "block" : "none" }}>{label}</span>
            </div>
            {i < labels.length - 1 && <div style={{ flex: 1, height: "0.5px", background: phase > stepNum + 1 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)", marginLeft: 4 }} />}
          </div>
        );
      })}
    </div>
  );
}

function SethPhase1({ options, sourcingItems, onChoose, onToggle, isPending }: { options: RecipeOption[]; sourcingItems: { id: number; label: string; completed: boolean }[]; onChoose: (id: number) => void; onToggle: (id: number, completed: boolean) => void; isPending: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", lineHeight: 1.65 }}>Browse these options. Pick the one that speaks to you tonight.</p>
      {options.map((option) => (
        <div key={option.id} style={{ border: "0.5px solid rgba(255,255,255,0.1)", padding: "20px", background: "#181410" }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 300, color: "#f0e8dc", marginBottom: 4 }}>{option.dish}</h3>
          <p style={{ fontFamily: "sans-serif", fontSize: 10, color: "#c4623a", letterSpacing: "0.1em", marginBottom: 10 }}>{option.cuisine}</p>
          <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", lineHeight: 1.65, marginBottom: 12 }}>{option.description}</p>
          <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#5a4e42", fontFamily: "sans-serif", marginBottom: 14 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{option.prepTime}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Flame size={11} />{option.difficulty}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {option.ingredients.map((ing, i) => (
              <span key={i} style={{ fontFamily: "sans-serif", fontSize: 10, color: "#5a4e42", border: "0.5px solid rgba(255,255,255,0.07)", padding: "3px 8px" }}>{ing}</span>
            ))}
          </div>
          <a href={`https://www.instacart.com/store/s?k=${encodeURIComponent(option.ingredients.join(", "))}`} target="_blank" rel="noreferrer"
            style={{ display: "block", width: "100%", boxSizing: "border-box", background: "transparent", color: "#a89880", border: "0.5px solid rgba(255,255,255,0.13)", padding: "12px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", textAlign: "center", marginBottom: 8 }}>
            Order groceries
          </a>
          <button onClick={() => onChoose(option.id)} disabled={isPending}
            style={{ width: "100%", background: "#c4623a", color: "#fdf5ee", border: "none", padding: "12px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", opacity: isPending ? 0.5 : 1 }}>
            I'll cook this
          </button>
        </div>
      ))}
    </div>
  );
}

function SethPhase2({ chosenRecipe, sethItems, onToggle, onAdvance, onReset, isPending }: { chosenRecipe?: RecipeOption; sethItems: { id: number; label: string; completed: boolean }[]; onToggle: (id: number, completed: boolean) => void; onAdvance: () => void; onReset: () => void; isPending: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {chosenRecipe && (
        <div style={{ background: "#181410", border: "0.5px solid rgba(255,255,255,0.07)", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 6 }}>Your dish</p>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 300, color: "#f0e8dc" }}>{chosenRecipe.dish}</h3>
            </div>
            <button onClick={onReset} disabled={isPending} data-testid="button-reset-seth"
              style={{ background: "none", border: "none", color: "#5a4e42", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}>
              Change
            </button>
          </div>
        </div>
      )}
      <div>
        <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", marginBottom: 12, lineHeight: 1.65 }}>Prep day. Work through these before cook night.</p>
        {sethItems.map((item) => (
          <button key={item.id} onClick={() => onToggle(item.id, item.completed)} data-testid={`checklist-item-${item.id}`}
            style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            {item.completed ? <CheckSquare size={15} style={{ color: "#c4623a", flexShrink: 0, marginTop: 2 }} /> : <Square size={15} style={{ color: "#5a4e42", flexShrink: 0, marginTop: 2 }} />}
            <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: item.completed ? "#5a4e42" : "#a89880", textDecoration: item.completed ? "line-through" : "none", lineHeight: 1.5 }}>
              {item.label.replace(/^Seth:\s*/i, "")}
            </span>
          </button>
        ))}
      </div>
      <button onClick={onAdvance} disabled={isPending}
        style={{ width: "100%", background: "transparent", border: "0.5px solid rgba(255,255,255,0.13)", color: "#a89880", padding: "12px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Ready for cook night <ChevronRight size={12} />
      </button>
    </div>
  );
}

function SethPhase3({ chosenRecipe, onReset, isPending }: { chosenRecipe?: RecipeOption; onReset: () => void; isPending: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "rgba(196,98,58,0.08)", border: "0.5px solid rgba(196,98,58,0.2)", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4623a", marginBottom: 6 }}>Tonight you're making</p>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#f0e8dc" }}>{chosenRecipe?.dish ?? "Your chosen dish"}</h3>
          </div>
          <button onClick={onReset} disabled={isPending} data-testid="button-reset-seth"
            style={{ background: "none", border: "none", color: "#c4623a", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}>
            Change
          </button>
        </div>
      </div>
      <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", lineHeight: 1.75 }}>
        Cook with intention. Pour yourself something good before you start. The process is part of the date.
      </p>
      <div style={{ border: "0.5px solid rgba(255,255,255,0.07)", padding: "16px 20px" }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 12 }}>A few reminders</p>
        {["Read the full recipe before you start.", "Mise en place — prep everything before heat.", "Taste as you go. Season with confidence.", "If something goes sideways, improvise. Tell the story later."].map((r, i) => (
          <p key={i} style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", marginBottom: 8, lineHeight: 1.5 }}>· {r}</p>
        ))}
      </div>
    </div>
  );
}

function ElanaPhase1({ moods, onChoose, isPending }: { moods: MoodOption[]; onChoose: (id: string) => void; isPending: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", lineHeight: 1.65 }}>What are you in the mood for tonight? Your gut knows.</p>
      {moods.map((mood) => (
        <button key={mood.id} onClick={() => onChoose(mood.id)} disabled={isPending}
          style={{ border: "0.5px solid rgba(255,255,255,0.1)", padding: "16px 18px", background: "#181410", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s", opacity: isPending ? 0.5 : 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#c4623a")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{mood.emoji}</span>
            <div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 300, color: "#f0e8dc", marginBottom: 4 }}>{mood.name}</h3>
              <p style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 200, color: "#5a4e42", lineHeight: 1.5, marginBottom: 6 }}>{mood.description}</p>
              <p style={{ fontFamily: "sans-serif", fontSize: 11, color: "#c4623a", fontStyle: "italic", marginBottom: 8 }}>{mood.playlistDirection}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {mood.artists.map((a) => <span key={a} style={{ fontFamily: "sans-serif", fontSize: 10, color: "#c4623a", border: "0.5px solid rgba(196,98,58,0.3)", padding: "2px 8px" }}>{a}</span>)}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ElanaPhase2({ chosenMood, elanaItems, onToggle, onAdvance, onReset, isPending }: { chosenMood?: MoodOption; elanaItems: { id: number; label: string; completed: boolean }[]; onToggle: (id: number, completed: boolean) => void; onAdvance: () => void; onReset: () => void; isPending: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {chosenMood && (
        <div style={{ background: "rgba(196,98,58,0.06)", border: "0.5px solid rgba(196,98,58,0.2)", padding: "16px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4623a", marginBottom: 6 }}>Tonight's vibe</p>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 300, color: "#f0e8dc" }}>{chosenMood.emoji} {chosenMood.name}</h3>
              <p style={{ fontFamily: "sans-serif", fontSize: 11, color: "#c4623a", fontStyle: "italic", marginTop: 4 }}>{chosenMood.playlistDirection}</p>
            </div>
            <button onClick={onReset} disabled={isPending} data-testid="button-reset-elana"
              style={{ background: "none", border: "none", color: "#5a4e42", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}>
              Change
            </button>
          </div>
        </div>
      )}
      {chosenMood && (
        <a href={`https://open.spotify.com/search/${encodeURIComponent(`${chosenMood.name} ${chosenMood.playlistDirection} ${chosenMood.artists.slice(0, 3).join(" ")} date night playlist`)}`} target="_blank" rel="noreferrer"
          style={{ display: "block", background: "transparent", border: "0.5px solid rgba(196,98,58,0.3)", color: "#c4623a", padding: "12px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center" }}>
          Prep in Spotify
        </a>
      )}
      <div>
        {elanaItems.map((item) => (
          <button key={item.id} onClick={() => onToggle(item.id, item.completed)} data-testid={`checklist-item-${item.id}`}
            style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "0.5px solid rgba(255,255,255,0.05)", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
            {item.completed ? <CheckSquare size={15} style={{ color: "#c4623a", flexShrink: 0, marginTop: 2 }} /> : <Square size={15} style={{ color: "#5a4e42", flexShrink: 0, marginTop: 2 }} />}
            <span style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: item.completed ? "#5a4e42" : "#a89880", textDecoration: item.completed ? "line-through" : "none" }}>
              {item.label.replace(/^Elana:\s*/i, "")}
            </span>
          </button>
        ))}
      </div>
      <button onClick={onAdvance} disabled={isPending}
        style={{ width: "100%", background: "transparent", border: "0.5px solid rgba(196,98,58,0.3)", color: "#c4623a", padding: "12px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        Playlist is ready <ChevronRight size={12} />
      </button>
    </div>
  );
}

function ElanaPhase3({ chosenMood, onReset, isPending }: { chosenMood?: MoodOption; onReset: () => void; isPending: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "rgba(196,98,58,0.06)", border: "0.5px solid rgba(196,98,58,0.2)", padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c4623a", marginBottom: 6 }}>Tonight's vibe</p>
            <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 300, color: "#f0e8dc" }}>{chosenMood ? `${chosenMood.emoji} ${chosenMood.name}` : "Your chosen vibe"}</h3>
          </div>
          <button onClick={onReset} disabled={isPending} data-testid="button-reset-elana"
            style={{ background: "none", border: "none", color: "#5a4e42", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", textDecoration: "underline" }}>
            Change
          </button>
        </div>
      </div>
      {chosenMood && (
        <a href={`https://open.spotify.com/search/${encodeURIComponent(`${chosenMood.name} ${chosenMood.playlistDirection} ${chosenMood.artists.slice(0, 3).join(" ")} date night playlist`)}`} target="_blank" rel="noreferrer"
          style={{ display: "block", background: "transparent", border: "0.5px solid rgba(196,98,58,0.3)", color: "#c4623a", padding: "12px", fontFamily: "sans-serif", fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center" }}>
          Open Spotify search
        </a>
      )}
      <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", lineHeight: 1.75 }}>
        Hit play before cooking starts. Let the room settle into the feeling. You set the tone.
      </p>
      {chosenMood && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {chosenMood.artists.map((a) => <span key={a} style={{ fontFamily: "sans-serif", fontSize: 11, color: "#c4623a", border: "0.5px solid rgba(196,98,58,0.3)", padding: "4px 10px" }}>{a}</span>)}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, delay, children }: { title: string; icon: React.ElementType; delay: number; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Icon size={14} style={{ color: "#c4623a" }} />
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300, color: "#f0e8dc" }}>{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function FavoriteCard({ title, body, favType, isFavorited, onToggle, "data-testid": testId }: { title: string; body: string; favType: "ritual" | "activity" | "prompt"; isFavorited: boolean | undefined; onToggle: () => void; "data-testid"?: string }) {
  return (
    <div style={{ border: "0.5px solid rgba(255,255,255,0.07)", background: "#181410", padding: "20px 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }} data-testid={testId}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 8 }}>{title}</p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 300, color: "#f0e8dc", lineHeight: 1.7, margin: 0 }}>{body}</p>
      </div>
      <button onClick={onToggle}
        style={{ flexShrink: 0, background: "transparent", border: "none", cursor: "pointer", color: isFavorited ? "#c4623a" : "#5a4e42", padding: 4, transition: "color 0.15s" }}>
        <Heart size={15} style={{ fill: isFavorited ? "#c4623a" : "none" }} />
      </button>
    </div>
  );
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        style={{ background: "#181410", border: "0.5px solid rgba(255,255,255,0.1)", padding: "28px 28px 32px", width: "100%", maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 300, color: "#f0e8dc" }}>{title}</h2>
            {subtitle && <p style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 200, color: "#a89880", marginTop: 4 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#5a4e42", cursor: "pointer" }}><X size={16} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function ReflectionField({ label, value, onChange, placeholder, "data-testid": testId }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; "data-testid"?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "sans-serif", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5a4e42", marginBottom: 8 }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testId} rows={3}
        style={{ width: "100%", background: "transparent", border: "0.5px solid rgba(255,255,255,0.13)", color: "#f0e8dc", fontFamily: "Georgia, serif", fontSize: 14, fontWeight: 300, padding: "10px 14px", outline: "none", resize: "none", boxSizing: "border-box" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#c4623a")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)")}
        placeholder-style={{ color: "#5a4e42" }} />
    </div>
  );
}
