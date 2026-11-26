// Day state: current/viewing date, the loaded day object, and persistence.
// ES module exports are live bindings: importers read the latest value but
// cannot assign, so every reassignment goes through the setters below.
import { STORAGE_PREFIX } from "./config.js";
import { legacySnapshot, snapshotActiveProgram } from "./logic/programs.js";

export function getTodayDateStr() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
export function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export let currentTodayStr = getTodayDateStr();
export let viewingDateStr = currentTodayStr;

export function getDefaultModeForDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 6 ? "sat" : (dow === 0 || dow === 4) ? "rest" : "gym";
}

export function createEmptyDayState(dateStr) {
  return {
    dayMode: getDefaultModeForDate(dateStr),
    water: 0,
    tasks: {},
    taskTimes: {},
    manualTimeSet: {},
    completedAt: {},
    customMeals: {},
    customWater: {},
    snoozeUntil: {},
    alarmFired: {},
    prayers: {},
    skipped: {},
    meals: [],
    offsets: [],
    eatEnd: null,
    lockEnd: null,
    lockOwnerTaskId: null,
    weight: "",
    programSnap: null // Deep Clone of the active template taken when the day is created
  };
}

export function loadDayState(dateStr) {
  const raw = localStorage.getItem(STORAGE_PREFIX + dateStr);
  const base = createEmptyDayState(dateStr);
  // New day: independent deep copy of the currently active template (null = no program active)
  const fresh = () => { base.programSnap = snapshotActiveProgram(base.dayMode); return base; };
  if (!raw) return fresh();
  try {
    const saved = JSON.parse(raw);
    Object.assign(base, saved);
    // Days saved before program profiles keep the built-in program they ran on
    if (!("programSnap" in saved)) base.programSnap = legacySnapshot(base.dayMode);
    return base;
  } catch (e) {
    return fresh();
  }
}

export let state = loadDayState(viewingDateStr);

export function saveState() {
  localStorage.setItem(STORAGE_PREFIX + viewingDateStr, JSON.stringify(state));
}

export function isViewingToday() {
  return viewingDateStr === currentTodayStr;
}

// ----- Setters (the only places that reassign the bindings above) -----

/** Real "today" changed (midnight rollover). Does not touch the viewed day. */
export function setCurrentToday(dateStr) {
  currentTodayStr = dateStr;
}

/** Switch the viewed day and load its saved state. */
export function setViewingDate(dateStr) {
  viewingDateStr = dateStr;
  state = loadDayState(viewingDateStr);
}

/** Re-read the viewed day from localStorage (after import / reset). */
export function reloadState() {
  state = loadDayState(viewingDateStr);
}
