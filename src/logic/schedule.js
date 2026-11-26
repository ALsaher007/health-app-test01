// Schedule helpers: active program, per-task time/water/meal lookups, time formatting.
import { EMPTY_PROGRAM } from "./programs.js";
import { state } from "../state.js";

export function getActiveProgram() {
  // The day's own deep-cloned program; the master template is never touched from here
  const snap = state.programSnap;
  return snap && snap.program ? snap.program : EMPTY_PROGRAM;
}

export function getTaskWater(taskObj) {
  if (!taskObj) return 0;
  const key = `${state.dayMode}_${taskObj.id}`;
  if (typeof state.customWater[key] === "number") return state.customWater[key];
  return taskObj.water || 0;
}

export function getTaskMealItems(taskObj) {
  if (!taskObj || !taskObj.defaultItems) return null;
  const key = `${state.dayMode}_${taskObj.id}`;
  return state.customMeals[key] || taskObj.defaultItems;
}

export function formatItemsSummary(items) {
  return items.map(it => `${it.name} (${it.grams}غ)`).join(" + ");
}

export function getTaskMins(id) {
  if (typeof state.taskTimes[id] === "number") return state.taskTimes[id];
  const t = getActiveProgram().tasks.find(x => x.id === id);
  return t ? t.baseMins : 0;
}

export function formatMinsArabic(totalMins) {
  const norm = ((totalMins % 1440) + 1440) % 1440;
  const h24 = Math.floor(norm / 60);
  const m = norm % 60;
  let period = "ص";
  if (h24 >= 12 && h24 < 15) period = "ظ";
  else if (h24 >= 15 && h24 < 18) period = "ع";
  else if (h24 >= 18) period = "م";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function minsToHHMM(totalMins) {
  const norm = ((totalMins % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function hhmmToMins(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

export function getNowMins() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/**
 * Clears everything tied to the current program's tasks (done/skipped flags, task meals,
 * water they added, water lock, shifted times, alarm flags). Used when a day's program or
 * mode changes. Call BEFORE swapping state.programSnap / state.dayMode.
 */
export function resetDayProgress() {
  getActiveProgram().tasks.forEach(t => {
    if (state.tasks[t.id]) state.water = Math.max(0, state.water - getTaskWater(t));
  });
  state.tasks = {}; state.skipped = {}; state.completedAt = {};
  state.meals = state.meals.filter(m => !m.taskId);
  state.eatEnd = null; state.lockEnd = null; state.lockOwnerTaskId = null;
  state.taskTimes = {};
  state.manualTimeSet = {};
  state.snoozeUntil = {};
  state.alarmFired = {};
}

/**
 * The real schedule of the day on screen: program tasks (the day's own clone) with this day's
 * manual / shifted times and water amounts merged in. Local alarms and the Telegram payload
 * both read this, so they can never disagree.
 */
export function getEffectiveSchedule() {
  return getActiveProgram().tasks.map(t => ({
    id: t.id,
    text: t.text,
    mins: getTaskMins(t.id),
    water: getTaskWater(t),
    isMeal: !!t.defaultItems,
    done: !!state.tasks[t.id],
    skipped: !!(state.skipped && state.skipped[t.id])
  }));
}

/** Pending "water door opens" alarm of today's water lock as a schedule entry (null when none). */
export function getLockAlarmEntry(nowMs = Date.now()) {
  if (!state.lockEnd || state.lockEnd <= nowMs) return null;
  const end = new Date(state.lockEnd);
  if (end.toDateString() !== new Date(nowMs).toDateString()) return null; // the cloud schedule is per day
  return {
    id: "lock_" + (state.lockOwnerTaskId || "water"),
    mins: end.getHours() * 60 + end.getMinutes(),
    text: "💧 انفتح باب المي — تقدر تشرب الآن"
  };
}
