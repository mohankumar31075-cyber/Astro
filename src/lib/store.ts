/**
 * Local-first storage.
 *
 * AstroSutra has no backend. Profiles, settings and the active chart live in
 * localStorage on this device, and can be exported or erased at any time.
 * Nothing is transmitted anywhere.
 */
import { useSyncExternalStore } from 'react';
import type { BirthInput } from './time';
import { buildBirthChart, type BirthChart } from './astro';

export interface Profile {
  id: string;
  name: string;
  relation: string;
  gender: 'female' | 'male' | 'other' | 'unspecified';
  birth: BirthInput;
  createdAt: string;
  isSample?: boolean;
}

export interface Settings {
  chartStyle: 'north' | 'south';
  /** Use the active profile's birthplace for panchang and daily readings. */
  useProfilePlace: boolean;
  panchangCity: { name: string; latitude: number; longitude: number; timeZone: string } | null;
  lastHoroscopeSign: number | null;
}

export interface AppData {
  version: 1;
  profiles: Profile[];
  activeId: string | null;
  settings: Settings;
}

const STORAGE_KEY = 'astrosutra.data.v1';

const defaultSettings: Settings = {
  chartStyle: 'north',
  useProfilePlace: true,
  panchangCity: null,
  lastHoroscopeSign: null,
};

const emptyData = (): AppData => ({
  version: 1,
  profiles: [],
  activeId: null,
  settings: { ...defaultSettings },
});

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sanitiseProfile(raw: unknown): Profile | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Partial<Profile>;
  if (!p.id || !p.name || !p.birth) return null;
  const birth = p.birth as BirthInput;
  if (!birth.date || !birth.time || !birth.timeZone) return null;
  if (typeof birth.latitude !== 'number' || typeof birth.longitude !== 'number') return null;
  if (Math.abs(birth.latitude) > 90 || Math.abs(birth.longitude) > 180) return null;
  return {
    id: String(p.id),
    name: String(p.name).slice(0, 80),
    relation: String(p.relation ?? 'Self').slice(0, 40),
    gender: p.gender ?? 'unspecified',
    birth: {
      name: String(p.name).slice(0, 80),
      date: birth.date,
      time: birth.time,
      timeZone: birth.timeZone,
      latitude: birth.latitude,
      longitude: birth.longitude,
      place: birth.place ?? 'Unknown place',
      timeUnknown: Boolean(birth.timeUnknown),
      gender: p.gender ?? 'unspecified',
      relation: String(p.relation ?? 'Self'),
    },
    createdAt: p.createdAt ?? new Date().toISOString(),
    isSample: Boolean(p.isSample),
  };
}

function load(): AppData {
  if (!isBrowser()) return emptyData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const profiles = Array.isArray(parsed.profiles)
      ? parsed.profiles.map(sanitiseProfile).filter((p): p is Profile => p !== null)
      : [];
    const activeId = profiles.some((p) => p.id === parsed.activeId) ? parsed.activeId! : profiles[0]?.id ?? null;
    return {
      version: 1,
      profiles,
      activeId,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return emptyData();
  }
}

let state: AppData = load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Storage can fail in private mode or when full; the app still works for
    // the session, it just will not remember.
    console.warn('AstroSutra could not save to local storage.', error);
  }
}

function commit(next: AppData) {
  state = next;
  persist();
  emit();
}

export function getSnapshot(): AppData {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useActiveProfile(): Profile | null {
  const data = useAppData();
  return data.profiles.find((p) => p.id === data.activeId) ?? null;
}

const chartCache = new Map<string, BirthChart>();

function profileKey(profile: Profile): string {
  return `${profile.id}|${profile.birth.date}|${profile.birth.time}|${profile.birth.timeZone}|${profile.birth.latitude}|${profile.birth.longitude}`;
}

export function chartForProfile(profile: Profile | null): BirthChart | null {
  if (!profile) return null;
  const key = profileKey(profile);
  const cached = chartCache.get(key);
  if (cached) return cached;
  const chart = buildBirthChart({ ...profile.birth, name: profile.name });
  chartCache.set(key, chart);
  return chart;
}

export function useActiveChart(): BirthChart | null {
  const profile = useActiveProfile();
  return chartForProfile(profile);
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `p_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export interface ProfileDraft {
  name: string;
  relation: string;
  gender: Profile['gender'];
  date: string;
  time: string;
  timeUnknown: boolean;
  place: string;
  latitude: number;
  longitude: number;
  timeZone: string;
  isSample?: boolean;
}

export function validateDraft(draft: ProfileDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = 'A name helps keep family charts apart.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) errors.date = 'Use a valid date.';
  else {
    const d = new Date(`${draft.date}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) errors.date = 'That date does not exist.';
    else if (d.getTime() > Date.now()) errors.date = 'Birth dates cannot be in the future.';
    else if (d.getUTCFullYear() < 1800) errors.date = 'AstroSutra supports births from 1800 onward.';
  }
  if (!/^\d{2}:\d{2}$/.test(draft.time)) errors.time = 'Use a 24-hour time such as 06:45.';
  if (Number.isNaN(draft.latitude) || Math.abs(draft.latitude) > 90) errors.latitude = 'Latitude must be between -90 and 90.';
  if (Number.isNaN(draft.longitude) || Math.abs(draft.longitude) > 180) errors.longitude = 'Longitude must be between -180 and 180.';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: draft.timeZone }).format(new Date());
  } catch {
    errors.timeZone = 'That time zone is not recognised.';
  }
  return errors;
}

export function saveProfile(draft: ProfileDraft, existingId?: string): Profile {
  const birth: BirthInput = {
    name: draft.name.trim(),
    date: draft.date,
    time: draft.time,
    timeZone: draft.timeZone,
    latitude: draft.latitude,
    longitude: draft.longitude,
    place: draft.place,
    timeUnknown: draft.timeUnknown,
    gender: draft.gender,
    relation: draft.relation,
  };
  const existing = existingId ? state.profiles.find((p) => p.id === existingId) : undefined;
  const profile: Profile = {
    id: existing?.id ?? newId(),
    name: draft.name.trim(),
    relation: draft.relation || 'Family',
    gender: draft.gender,
    birth,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    isSample: draft.isSample,
  };
  const profiles = existing
    ? state.profiles.map((p) => (p.id === profile.id ? profile : p))
    : [...state.profiles, profile];
  commit({
    ...state,
    profiles,
    activeId: existing ? state.activeId : profile.id,
    settings: { ...state.settings, lastHoroscopeSign: chartForProfile(profile)?.sunSign ?? state.settings.lastHoroscopeSign },
  });
  return profile;
}

export function deleteProfile(id: string) {
  const profiles = state.profiles.filter((p) => p.id !== id);
  commit({
    ...state,
    profiles,
    activeId: state.activeId === id ? profiles[0]?.id ?? null : state.activeId,
  });
  for (const key of [...chartCache.keys()]) {
    if (key.startsWith(`${id}|`)) chartCache.delete(key);
  }
}

export function setActiveProfile(id: string) {
  if (!state.profiles.some((p) => p.id === id)) return;
  commit({ ...state, activeId: id });
}

export function updateSettings(patch: Partial<Settings>) {
  commit({ ...state, settings: { ...state.settings, ...patch } });
}

export function exportData(): string {
  return JSON.stringify(state, null, 2);
}

export function importData(raw: string): { ok: boolean; message: string } {
  try {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const profiles = Array.isArray(parsed.profiles)
      ? parsed.profiles.map(sanitiseProfile).filter((p): p is Profile => p !== null)
      : [];
    if (profiles.length === 0) return { ok: false, message: 'No valid profiles found in that file.' };
    commit({
      version: 1,
      profiles,
      activeId: profiles.some((p) => p.id === parsed.activeId) ? parsed.activeId! : profiles[0].id,
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    });
    chartCache.clear();
    return { ok: true, message: `Imported ${profiles.length} profile${profiles.length === 1 ? '' : 's'}.` };
  } catch {
    return { ok: false, message: 'That file is not valid AstroSutra JSON.' };
  }
}

export function clearAll() {
  chartCache.clear();
  commit(emptyData());
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
}

export const SAMPLE_DRAFT: ProfileDraft = {
  name: 'Aarav (sample)',
  relation: 'Self',
  gender: 'unspecified',
  date: '1992-08-14',
  time: '22:45',
  timeUnknown: false,
  place: 'Mumbai, India',
  latitude: 19.076,
  longitude: 72.8777,
  timeZone: 'Asia/Kolkata',
  isSample: true,
};

export function addSampleProfile(): Profile {
  const existing = state.profiles.find((profile) => profile.isSample);
  if (existing) {
    setActiveProfile(existing.id);
    return existing;
  }
  return saveProfile(SAMPLE_DRAFT);
}
