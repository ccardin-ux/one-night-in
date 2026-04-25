import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type {
  ChecklistItem,
  CreateFavoriteBody,
  CreateLearningBody,
  CreateReflectionBody,
  DatePlan,
  Favorite,
  Learning,
  Reflection,
  Summary,
  ToggleChecklistItemBody,
  UpdateDateBody,
} from "@workspace/api-client-react";
import { CHECKLIST_ITEMS, STATIC_DATE_PLANS } from "./static-seed";

type QueryOptions = {
  query?: {
    queryKey?: readonly unknown[];
    enabled?: boolean;
    staleTime?: number;
  };
};

type MutationOptions<TData, TVariables> = {
  mutation?: {
    onSuccess?: (data: TData, variables: TVariables) => unknown;
    onError?: (error: Error, variables: TVariables) => unknown;
  };
};

const STORAGE_PREFIX = "year-of-dates-static";
const DATE_STATE_KEY = `${STORAGE_PREFIX}:dates`;
const CHECKLIST_STATE_KEY = `${STORAGE_PREFIX}:checklist`;
const FAVORITES_KEY = `${STORAGE_PREFIX}:favorites`;
const REFLECTIONS_KEY = `${STORAGE_PREFIX}:reflections`;
const LEARNINGS_KEY = `${STORAGE_PREFIX}:learnings`;
const STORAGE_KEYS = [
  DATE_STATE_KEY,
  CHECKLIST_STATE_KEY,
  FAVORITES_KEY,
  REFLECTIONS_KEY,
  LEARNINGS_KEY,
] as const;

type StoredDateState = Record<number, Partial<UpdateDateBody>>;
type StoredChecklistState = Record<number, boolean>;
type MemoryBackup = {
  app: "year-of-dates";
  version: 1;
  exportedAt: string;
  data: {
    dateState: StoredDateState;
    checklistState: StoredChecklistState;
    favorites: Favorite[];
    reflections: Reflection[];
    learnings: Learning[];
  };
};

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function nextId(items: { id: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}

function getDateState(): StoredDateState {
  return readStorage<StoredDateState>(DATE_STATE_KEY, {});
}

function getDates(): DatePlan[] {
  const state = getDateState();
  return STATIC_DATE_PLANS.map((date) => ({
    ...date,
    ...(state[date.month] ?? {}),
  }));
}

function getDate(month: number): DatePlan {
  const date = getDates().find((item) => item.month === month);
  if (!date) throw new Error("Date plan not found");
  return date;
}

function getChecklist(month: number): ChecklistItem[] {
  const completedState = readStorage<StoredChecklistState>(CHECKLIST_STATE_KEY, {});
  const items = CHECKLIST_ITEMS[month] ?? [];

  return items.map((item, index) => {
    const id = month * 100 + index + 1;
    return {
      id,
      month,
      label: item.label,
      phase: item.phase,
      person: item.person,
      completed: completedState[id] ?? false,
    };
  });
}

function getAllChecklistItems(): ChecklistItem[] {
  return STATIC_DATE_PLANS.flatMap((date) => getChecklist(date.month));
}

function getFavorites(): Favorite[] {
  return readStorage<Favorite[]>(FAVORITES_KEY, []);
}

function getReflections(): Reflection[] {
  return readStorage<Reflection[]>(REFLECTIONS_KEY, []);
}

function getLearnings(): Learning[] {
  return readStorage<Learning[]>(LEARNINGS_KEY, []);
}

function getSummary(): Summary {
  const dates = getDates();
  const completedDates = dates.filter((date) => date.completed).length;
  const upcomingDate = dates.find((date) => !date.completed);
  const nextScheduled = dates.find((date) => !date.completed && date.scheduledDate);

  return {
    totalDates: dates.length,
    completedDates,
    upcomingMonth: upcomingDate?.month ?? null,
    totalReflections: getReflections().length,
    totalLearnings: getLearnings().length,
    nextScheduledDate: nextScheduled?.scheduledDate ?? null,
  };
}

function downloadJson(filename: string, data: unknown): void {
  if (typeof document === "undefined") return;

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function createMemoryBackup(): MemoryBackup {
  return {
    app: "year-of-dates",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      dateState: getDateState(),
      checklistState: readStorage<StoredChecklistState>(CHECKLIST_STATE_KEY, {}),
      favorites: getFavorites(),
      reflections: getReflections(),
      learnings: getLearnings(),
    },
  };
}

export function downloadMemoryBackup(): void {
  const date = new Date().toISOString().slice(0, 10);
  downloadJson(`year-of-dates-memories-${date}.json`, createMemoryBackup());
}

export function importMemoryBackup(rawBackup: unknown): void {
  const backup = rawBackup as Partial<MemoryBackup>;

  if (backup.app !== "year-of-dates" || backup.version !== 1 || !backup.data) {
    throw new Error("This does not look like a Year of Dates backup file.");
  }

  writeStorage(DATE_STATE_KEY, backup.data.dateState ?? {});
  writeStorage(CHECKLIST_STATE_KEY, backup.data.checklistState ?? {});
  writeStorage(FAVORITES_KEY, backup.data.favorites ?? []);
  writeStorage(REFLECTIONS_KEY, backup.data.reflections ?? []);
  writeStorage(LEARNINGS_KEY, backup.data.learnings ?? []);
}

export function clearStoredMemories(): void {
  if (typeof window === "undefined") return;
  STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

export const getListDatesQueryKey = () => ["/api/dates"] as const;
export const getGetDateQueryKey = (month: number) => [`/api/dates/${month}`] as const;
export const getGetChecklistQueryKey = (month: number) => [`/api/checklist/${month}`] as const;
export const getListFavoritesQueryKey = () => ["/api/favorites"] as const;
export const getListReflectionsQueryKey = () => ["/api/reflections"] as const;
export const getListLearningsQueryKey = () => ["/api/learnings"] as const;
export const getGetSummaryQueryKey = () => ["/api/summary"] as const;

export function useListDates(options?: QueryOptions): UseQueryResult<DatePlan[], Error> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListDatesQueryKey(),
    queryFn: getDates,
    ...options?.query,
  });
}

export function useGetDate(month: number, options?: QueryOptions): UseQueryResult<DatePlan, Error> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetDateQueryKey(month),
    queryFn: () => getDate(month),
    enabled: !!month,
    ...options?.query,
  });
}

export function useGetChecklist(month: number, options?: QueryOptions): UseQueryResult<ChecklistItem[], Error> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetChecklistQueryKey(month),
    queryFn: () => getChecklist(month),
    enabled: !!month,
    ...options?.query,
  });
}

export function useListFavorites(options?: QueryOptions): UseQueryResult<Favorite[], Error> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListFavoritesQueryKey(),
    queryFn: getFavorites,
    ...options?.query,
  });
}

export function useListReflections(options?: QueryOptions): UseQueryResult<Reflection[], Error> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListReflectionsQueryKey(),
    queryFn: getReflections,
    ...options?.query,
  });
}

export function useListLearnings(options?: QueryOptions): UseQueryResult<Learning[], Error> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListLearningsQueryKey(),
    queryFn: getLearnings,
    ...options?.query,
  });
}

export function useGetSummary(options?: QueryOptions): UseQueryResult<Summary, Error> {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetSummaryQueryKey(),
    queryFn: getSummary,
    ...options?.query,
  });
}

export function useUpdateDate(options?: MutationOptions<DatePlan, { month: number; data: UpdateDateBody }>) {
  return useMutation({
    mutationFn: async ({ month, data }: { month: number; data: UpdateDateBody }) => {
      const state = getDateState();
      state[month] = { ...(state[month] ?? {}), ...data };
      writeStorage(DATE_STATE_KEY, state);
      return getDate(month);
    },
    ...options?.mutation,
  });
}

export function useToggleChecklistItem(
  options?: MutationOptions<ChecklistItem, { month: number; itemId: number; data: ToggleChecklistItemBody }>,
) {
  return useMutation({
    mutationFn: async ({ month, itemId, data }: { month: number; itemId: number; data: ToggleChecklistItemBody }) => {
      const state = readStorage<StoredChecklistState>(CHECKLIST_STATE_KEY, {});
      state[itemId] = data.completed;
      writeStorage(CHECKLIST_STATE_KEY, state);

      const item = getAllChecklistItems().find((entry) => entry.id === itemId && entry.month === month);
      if (!item) throw new Error("Checklist item not found");
      return item;
    },
    ...options?.mutation,
  });
}

export function useCreateFavorite(options?: MutationOptions<Favorite, { data: CreateFavoriteBody }>) {
  return useMutation({
    mutationFn: async ({ data }: { data: CreateFavoriteBody }) => {
      const favorites = getFavorites();
      const favorite: Favorite = {
        id: nextId(favorites),
        type: data.type,
        content: data.content,
        sourceMonth: data.sourceMonth,
        createdAt: new Date().toISOString(),
      };
      writeStorage(FAVORITES_KEY, [...favorites, favorite]);
      return favorite;
    },
    ...options?.mutation,
  });
}

export function useDeleteFavorite(options?: MutationOptions<void, { id: number }>) {
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      writeStorage(FAVORITES_KEY, getFavorites().filter((favorite) => favorite.id !== id));
    },
    ...options?.mutation,
  });
}

export function useCreateReflection(options?: MutationOptions<Reflection, { data: CreateReflectionBody }>) {
  return useMutation({
    mutationFn: async ({ data }: { data: CreateReflectionBody }) => {
      const now = new Date().toISOString();
      const reflections = getReflections();
      const reflection: Reflection = {
        id: nextId(reflections),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      writeStorage(REFLECTIONS_KEY, [...reflections, reflection]);
      return reflection;
    },
    ...options?.mutation,
  });
}

export function useDeleteReflection(options?: MutationOptions<void, { id: number }>) {
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      writeStorage(REFLECTIONS_KEY, getReflections().filter((reflection) => reflection.id !== id));
    },
    ...options?.mutation,
  });
}

export function useCreateLearning(options?: MutationOptions<Learning, { data: CreateLearningBody }>) {
  return useMutation({
    mutationFn: async ({ data }: { data: CreateLearningBody }) => {
      const learnings = getLearnings();
      const learning: Learning = {
        id: nextId(learnings),
        ...data,
        createdAt: new Date().toISOString(),
      };
      writeStorage(LEARNINGS_KEY, [...learnings, learning]);
      return learning;
    },
    ...options?.mutation,
  });
}

export function useDeleteLearning(options?: MutationOptions<void, { id: number }>) {
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      writeStorage(LEARNINGS_KEY, getLearnings().filter((learning) => learning.id !== id));
    },
    ...options?.mutation,
  });
}
