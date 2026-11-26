// Persistent program profiles ("Program Profiles").
//
// Every profile is an immutable master template:
//   { id, name,
//     modes:   { <modeId>: { name, label, waterGoal, calGoal, proGoal, tasks: [...] } },
//     weekMap: { 0..6 (JS getDay: Sun=0 ... Sat=6): <modeId> } }
// Every profile has the two base modes "gym" and "rest" (not deletable); extra modes
// ("نمط خاص", e.g. Saturday) are optional and per profile.
// `tasks` holds the fixed tasks / medicines / alarms with their times; a task that has
// `defaultItems` is a meal, and those items carry the fixed grams.
//
// A day never points at the template: loadDayState() takes a Deep Clone of the active
// template (state.programSnap), so edits made on the main screen can only touch that day.
// This module is pure (localStorage + data only, no import of state.js) so state.js can use it.
import { DEFAULT_CAL_GOAL, DEFAULT_PRO_GOAL, DEFAULT_WATER_GOAL } from "../config.js";
import { PROGRAMS } from "../data/programs.js"; // built-in defaults: seed for the first run + legacy days

export const PROGRAMS_KEY = "aburaslan_programs"; // "aburaslan_" prefix => included in the JSON backup
export const BASE_MODES = ["gym", "rest"];
export const DEFAULT_MODE_NAMES = { gym: "💪 النادي", sat: "🏋️ السبت", rest: "🛏️ راحة" };
export const WEEK_DAYS = [ // display order (Saturday first) with JS getDay() numbers
  { dow: 6, name: "السبت" }, { dow: 0, name: "الأحد" }, { dow: 1, name: "الاثنين" }, { dow: 2, name: "الثلاثاء" },
  { dow: 3, name: "الأربعاء" }, { dow: 4, name: "الخميس" }, { dow: 5, name: "الجمعة" }
];
export const DEFAULT_PROFILE_ID = "prof_default";
export const DEFAULT_PROFILE_NAME = "برنامجي الحالي";

export function deepClone(o) {
  return JSON.parse(JSON.stringify(o));
}

/** What a day shows when no program is active: nothing scheduled, so no alarms. */
export const EMPTY_PROGRAM = Object.freeze({
  label: "بدون برنامج مفعّل",
  waterGoal: DEFAULT_WATER_GOAL,
  calGoal: DEFAULT_CAL_GOAL,
  proGoal: DEFAULT_PRO_GOAL,
  tasks: Object.freeze([])
});

// ----- validation -----

function isValidMode(m) {
  return !!m && typeof m === "object" && Array.isArray(m.tasks) &&
    m.tasks.every(t => t && typeof t.id === "string" && typeof t.baseMins === "number" && typeof t.text === "string" &&
      (t.defaultItems === undefined || Array.isArray(t.defaultItems)));
}

export function isValidProfile(p) {
  return !!p && typeof p === "object" && typeof p.id === "string" && p.id !== "" &&
    typeof p.name === "string" && !!p.modes && typeof p.modes === "object" &&
    BASE_MODES.every(k => isValidMode(p.modes[k])) && Object.values(p.modes).every(isValidMode);
}

export function modeKeys(profile) {
  return Object.keys(profile.modes);
}

export function modeName(profile, id) {
  const m = profile.modes[id];
  return (m && m.name) || DEFAULT_MODE_NAMES[id] || id;
}

/** Sun/Thu = rest, Sat = the "sat" mode when the profile has one, everything else = gym. */
export function defaultWeekMap(modes) {
  return { 0: "rest", 1: "gym", 2: "gym", 3: "gym", 4: "rest", 5: "gym", 6: modes.sat ? "sat" : "gym" };
}

/** Fills missing mode names and a missing / broken week map (also upgrades profiles saved by older versions). */
function upgradeProfile(p) {
  Object.keys(p.modes).forEach(k => { if (!p.modes[k].name) p.modes[k].name = DEFAULT_MODE_NAMES[k] || k; });
  const def = defaultWeekMap(p.modes);
  const wm = p.weekMap && typeof p.weekMap === "object" ? p.weekMap : {};
  p.weekMap = {};
  for (let d = 0; d < 7; d++) p.weekMap[d] = typeof wm[d] === "string" && p.modes[wm[d]] ? wm[d] : def[d];
  return p;
}

/** Mode a profile assigns to a weekday of the date "YYYY-MM-DD". */
export function modeForDateStr(profile, dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return (profile && profile.weekMap && profile.modes[profile.weekMap[dow]] && profile.weekMap[dow]) ||
    (dow === 6 ? "sat" : dow === 0 || dow === 4 ? "rest" : "gym");
}

/** Returns a clean store object, or null when `obj` is not a usable store. */
export function normalizeStore(obj) {
  if (!obj || typeof obj !== "object" || !Array.isArray(obj.profiles)) return null;
  const seen = new Set();
  const profiles = obj.profiles.filter(p => {
    if (!isValidProfile(p) || seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  }).map(upgradeProfile);
  const activeId = typeof obj.activeId === "string" && seen.has(obj.activeId) ? obj.activeId : null;
  return { version: 1, activeId, profiles };
}

/** Used before a backup restore: true when the raw JSON text is a usable programs store. */
export function isValidProgramsPayload(raw) {
  try { return normalizeStore(JSON.parse(raw)) !== null; } catch (e) { return false; }
}

// ----- store -----

function buildDefaultProfile() {
  // first program keeps its three modes and the current weekday split (Sat -> sat, Thu/Sun -> rest)
  return upgradeProfile({ id: DEFAULT_PROFILE_ID, name: DEFAULT_PROFILE_NAME, modes: deepClone(PROGRAMS) });
}

function writeStore(store) {
  localStorage.setItem(PROGRAMS_KEY, JSON.stringify(store));
  return store;
}

/**
 * Reads the store. First run (no key, or unreadable JSON): moves the built-in program from
 * src/data/programs.js into storage as the first saved template, already active.
 * An existing store with zero profiles is respected (the user deleted them all).
 */
export function getProgramsStore() {
  let raw = null;
  try { raw = localStorage.getItem(PROGRAMS_KEY); } catch (e) { }
  if (raw) {
    try {
      const store = normalizeStore(JSON.parse(raw));
      if (store) return store;
    } catch (e) { }
  }
  return writeStore({ version: 1, activeId: DEFAULT_PROFILE_ID, profiles: [buildDefaultProfile()] });
}

export function getProfiles() {
  return getProgramsStore().profiles;
}

export function getProfile(id) {
  return getProgramsStore().profiles.find(p => p.id === id) || null;
}

export function getActiveProfileId() {
  return getProgramsStore().activeId;
}

export function getActiveProfile() {
  const s = getProgramsStore();
  return s.profiles.find(p => p.id === s.activeId) || null;
}

/** Only one program can be active: setting one replaces the previous. null = none active. */
export function setActiveProfile(id) {
  const s = getProgramsStore();
  s.activeId = id !== null && s.profiles.some(p => p.id === id) ? id : null;
  writeStore(s);
  return s.activeId;
}

function newProfileId() {
  return "prof_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function cleanName(name, fallback = "برنامج جديد") {
  const n = String(name || "").trim().slice(0, 40);
  return n || fallback;
}

function emptyModes() { // a new program starts with the two base modes only
  const modes = {};
  BASE_MODES.forEach(k => {
    const d = PROGRAMS[k];
    modes[k] = { name: DEFAULT_MODE_NAMES[k], label: d.label, waterGoal: d.waterGoal, calGoal: d.calGoal, proGoal: d.proGoal, tasks: [] };
  });
  return modes;
}

/** New saved template: empty, or a copy of `fromId` (never linked to it afterwards). */
export function createProfile(name, fromId = null) {
  const s = getProgramsStore();
  const src = fromId ? s.profiles.find(p => p.id === fromId) : null;
  const modes = src ? deepClone(src.modes) : emptyModes();
  const profile = upgradeProfile({ id: newProfileId(), name: cleanName(name), modes, weekMap: src ? deepClone(src.weekMap) : undefined });
  s.profiles.push(profile);
  writeStore(s);
  return profile;
}

/** Replaces a template (used only by the "edit master template" window). */
export function saveProfile(profile) {
  if (!isValidProfile(profile)) return false;
  const s = getProgramsStore();
  const i = s.profiles.findIndex(p => p.id === profile.id);
  if (i === -1) return false;
  const clean = upgradeProfile(deepClone(profile));
  clean.name = cleanName(clean.name, s.profiles[i].name);
  s.profiles[i] = clean;
  writeStore(s);
  return true;
}

/** Deletes a template; if it was the active one, nothing is active afterwards. */
export function deleteProfile(id) {
  const s = getProgramsStore();
  const before = s.profiles.length;
  s.profiles = s.profiles.filter(p => p.id !== id);
  if (s.profiles.length === before) return { deleted: false, wasActive: false };
  const wasActive = s.activeId === id;
  if (wasActive) s.activeId = null;
  writeStore(s);
  return { deleted: true, wasActive };
}

// ----- day snapshots (Deep Clone) -----

function makeSnap(profile, mode) {
  const program = profile && profile.modes && profile.modes[mode];
  if (!program) return null;
  return { profileId: profile.id, profileName: profile.name, mode, program: deepClone(program) };
}

/** Independent copy of the active template's `mode` program, or null when none is active. */
export function snapshotActiveProgram(mode) {
  return makeSnap(getActiveProfile(), mode);
}

/** Same, but prefers the profile a day already runs on (mode switch inside "from tomorrow" days). */
export function snapshotForMode(mode, preferProfileId = null) {
  const preferred = preferProfileId ? getProfile(preferProfileId) : null;
  return makeSnap(preferred, mode) || makeSnap(getActiveProfile(), mode);
}

/** Days saved before this feature carry no snapshot: they keep the built-in program they ran on. */
export function legacySnapshot(mode) {
  const m = PROGRAMS[mode] ? mode : "gym";
  return { profileId: null, profileName: DEFAULT_PROFILE_NAME, mode: m, program: deepClone(PROGRAMS[m]) };
}

/** Program a stored day object (possibly from localStorage) was built on. */
export function resolveProgramForDay(dayObj) {
  const snap = dayObj && dayObj.programSnap;
  if (snap && snap.program && Array.isArray(snap.program.tasks)) return snap.program;
  if (snap === null) return EMPTY_PROGRAM;
  return PROGRAMS[dayObj && dayObj.dayMode] || PROGRAMS.gym;
}

/**
 * New template from the day on screen. The shown mode is rebuilt from what the day displays
 * (times, water, meal grams); the other two modes are copied from the active template
 * (or the built-in defaults when none is active).
 */
export function buildProfileFromDay(name, day, effective) {
  const base = getActiveProfile() || buildDefaultProfile();
  const modes = deepClone(base.modes);
  const prog = effective.program;
  modes[day.dayMode] = {
    name: (modes[day.dayMode] && modes[day.dayMode].name) || DEFAULT_MODE_NAMES[day.dayMode] || day.dayMode,
    label: prog.label, waterGoal: prog.waterGoal, calGoal: prog.calGoal, proGoal: prog.proGoal,
    tasks: prog.tasks.map(t => {
      const c = deepClone(t);
      c.baseMins = effective.minsOf(t);
      if (typeof effective.waterOf(t) === "number") c.water = effective.waterOf(t);
      if (t.defaultItems) c.defaultItems = deepClone(effective.itemsOf(t));
      if (!(c.water > 0)) delete c.water;
      return c;
    })
  };
  const s = getProgramsStore();
  const profile = upgradeProfile({ id: newProfileId(), name: cleanName(name), modes, weekMap: deepClone(base.weekMap) });
  s.profiles.push(profile);
  writeStore(s);
  return profile;
}
