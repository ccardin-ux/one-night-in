import { useEffect, useState } from "react";

export type CookingSkill = "beginner" | "intermediate" | "expert";

export type CoupleProfile = {
  partnerOne: string;
  partnerTwo: string;
  occasion: string;
  cookingLead: string;
  musicLead: string;
  cookingSkill: CookingSkill;
  foodNotes: string;
  musicNotes: string;
  interests: string[];
  vibe: string;
};

export const INTEREST_OPTIONS = [
  "Cooking",
  "Music",
  "Fashion",
  "History",
  "Geopolitics",
  "Art",
  "Nature",
  "Film",
  "Books",
  "Nightlife",
  "Wellness",
  "Design",
];

export const VIBE_OPTIONS = [
  "Cozy",
  "Romantic",
  "Playful",
  "Adventurous",
  "Intellectual",
  "Sensual",
  "Low-key",
  "Luxe",
];

export const DEFAULT_PROFILE: CoupleProfile = {
  partnerOne: "Seth",
  partnerTwo: "Elana",
  occasion: "First year of marriage",
  cookingLead: "Seth",
  musicLead: "Elana",
  cookingSkill: "intermediate",
  foodNotes: "Vegetarian-friendly options welcome; thoughtful cooking project is part of the gift.",
  musicNotes: "Give each month four soundtrack moods: fun, sexy, relaxing, and meditative.",
  interests: ["Cooking", "Music", "History", "Nature", "Wellness"],
  vibe: "Romantic",
};

const PROFILE_KEY = "year-of-dates-mvp:couple-profile";
const CHEF_ROLES_KEY = "year-of-dates-mvp:chef-roles";

export type ChefRole = "primary" | "sous" | "together";
export type ChefRoleState = Record<number, ChefRole>;

export function getCoupleProfile(): CoupleProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as CoupleProfile) : null;
  } catch {
    return null;
  }
}

export function saveCoupleProfile(profile: CoupleProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("couple-profile-updated"));
}

export function clearCoupleProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
  window.dispatchEvent(new Event("couple-profile-updated"));
}

export function getChefRoles(): ChefRoleState {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CHEF_ROLES_KEY);
    return raw ? (JSON.parse(raw) as ChefRoleState) : {};
  } catch {
    return {};
  }
}

export function getChefRole(month: number): ChefRole {
  return getChefRoles()[month] ?? "primary";
}

export function saveChefRole(month: number, role: ChefRole): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CHEF_ROLES_KEY, JSON.stringify({ ...getChefRoles(), [month]: role }));
  window.dispatchEvent(new Event("chef-role-updated"));
}

export function useCoupleProfile() {
  const [profile, setProfile] = useState<CoupleProfile | null>(() => getCoupleProfile());

  useEffect(() => {
    const updateProfile = () => setProfile(getCoupleProfile());
    window.addEventListener("couple-profile-updated", updateProfile);
    window.addEventListener("storage", updateProfile);
    return () => {
      window.removeEventListener("couple-profile-updated", updateProfile);
      window.removeEventListener("storage", updateProfile);
    };
  }, []);

  return profile;
}

export function getDisplayProfile(profile: CoupleProfile | null): CoupleProfile {
  return profile ?? DEFAULT_PROFILE;
}
