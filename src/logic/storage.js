// Small localStorage-backed getters/setters: goals, Telegram config, meal presets.
import { state } from "../state.js";
import { GOAL_KEYS_ALL, calcBodyGoals, isBodyProfileComplete, normAr } from "./nutrition.js";
import { getActiveProgram } from "./schedule.js";

export const NUTR_GOAL_KEYS = ["carb", "fat", "fib", "sug", "sat", "sod"];

export function getGoals() {
  try { return JSON.parse(localStorage.getItem("aburaslan_goals")) || {}; }
  catch (e) { return {}; }
}

export function getWaterGoal(mode = state.dayMode, prog = getActiveProgram()) {
  const g = getGoals()[mode];
  return g > 0 ? g : prog.waterGoal;
}

export function getNutrGoals() {
  try { return JSON.parse(localStorage.getItem("aburaslan_nutr_goals")) || {}; }
  catch (e) { return {}; }
}

// ----- body profile (aburaslan_body_profile) -----
export const BODY_PROFILE_KEY = "aburaslan_body_profile"; // "aburaslan_" prefix => part of the JSON backup

function posNum(v) { const n = parseFloat(v); return Number.isFinite(n) && n > 0 ? n : null; }

/** Always returns a complete, sanitised profile object (defaults: program-aligned mode, light activity, cut). */
export function getBodyProfile() {
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem(BODY_PROFILE_KEY)) || {}; } catch (e) { }
  if (typeof raw !== "object" || Array.isArray(raw)) raw = {};
  const overrides = {};
  GOAL_KEYS_ALL.forEach(k => { const n = posNum(raw.overrides && raw.overrides[k]); if (n) overrides[k] = n; });
  return {
    sex: raw.sex === "female" ? "female" : "male",
    age: posNum(raw.age), height: posNum(raw.height), weight: posNum(raw.weight),
    waist: posNum(raw.waist), neck: posNum(raw.neck), hip: posNum(raw.hip),
    activity: ["sedentary", "light", "moderate", "high"].includes(raw.activity) ? raw.activity : "light",
    goal: ["cut", "maintain", "build"].includes(raw.goal) ? raw.goal : "cut",
    mode: raw.mode === "full" ? "full" : "program", // default: align with the active program
    overrides
  };
}

export function setBodyProfile(p) {
  localStorage.setItem(BODY_PROFILE_KEY, JSON.stringify(p));
}

/** Backup restore guard: true when the raw JSON text is a profile object. */
export function isValidBodyProfilePayload(raw) {
  try { const o = JSON.parse(raw); return !!o && typeof o === "object" && !Array.isArray(o); } catch (e) { return false; }
}

/** Calculated goals for the current profile and the day's program (null if the profile is incomplete). */
export function getBodyGoals(p = getBodyProfile(), prog = getActiveProgram()) {
  const hasProgram = prog.tasks.length > 0;
  return calcBodyGoals(p, { programCal: hasProgram ? prog.calGoal : 0, programPro: hasProgram ? prog.proGoal : 0 });
}

/**
 * Goals used by the nutrition cards. With a complete body profile: calculated values (live, from the
 * active program in "program" mode) with manual overrides on top. Otherwise the old manual goals.
 */
export function getEffectiveNutrGoals() {
  const p = getBodyProfile();
  if (!isBodyProfileComplete(p)) return getNutrGoals();
  const calc = getBodyGoals(p);
  const eff = {};
  GOAL_KEYS_ALL.forEach(k => { eff[k] = p.overrides[k] > 0 ? p.overrides[k] : calc[k]; });
  return eff;
}

export function nutrGoalFor(k) {
  const g = getEffectiveNutrGoals();
  return g[k] > 0 ? g[k] : null;
}

/** Calorie / protein goals for the main bars: the effective body goals when set, else the program's. */
export function getCalProGoals(prog = getActiveProgram()) {
  const p = getBodyProfile();
  if (!isBodyProfileComplete(p)) return { cal: prog.calGoal, pro: prog.proGoal };
  const e = getEffectiveNutrGoals();
  return { cal: e.cal > 0 ? e.cal : prog.calGoal, pro: e.pro > 0 ? e.pro : prog.proGoal };
}

/** A new weigh-in updates a profile that already has a weight (goals recalculate, overrides reset). */
export function syncBodyWeight(w) {
  const p = getBodyProfile();
  if (!p.weight || !(w > 0) || p.weight === w) return false;
  p.weight = w;
  p.overrides = {};
  setBodyProfile(p);
  return true;
}

export function getTelegramConfig() {
  try {
    return JSON.parse(localStorage.getItem("aburaslan_tg_cfg")) || { botToken: "", chatId: "", webhookUrl: "" };
  } catch (e) {
    return { botToken: "", chatId: "", webhookUrl: "" };
  }
}

export function getSavedPresets() {
  try {
    return JSON.parse(localStorage.getItem("aburaslan_meal_presets")) || [];
  } catch (e) {
    return [];
  }
}

export function setSavedPresets(arr) {
  localStorage.setItem("aburaslan_meal_presets", JSON.stringify(arr));
}

export function getTargetWeight() {
  const saved = parseFloat(localStorage.getItem("aburaslan_target_weight"));
  return saved > 0 ? saved : 108.6;
}

export function getWeightHistory() {
  try {
    return JSON.parse(localStorage.getItem("aburaslan_weight_history")) || [];
  } catch (e) {
    return [];
  }
}

// ----- "أكلاتي": custom foods saved automatically, always per 100 g -----
export const MY_FOODS_KEY = "aburaslan_my_foods"; // "aburaslan_" prefix => part of the JSON backup
const MY_FOOD_KEYS = ["cal", "pro", "carb", "fat", "fib", "sug", "sat", "sod"];

function cleanMyFood(x) {
  if (!x || typeof x.name !== "string" || !x.name.trim()) return null;
  const o = { name: x.name.trim().slice(0, 60) };
  MY_FOOD_KEYS.forEach(k => {
    const n = Number(x[k]);
    o[k] = Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  });
  return o;
}

export function getMyFoods() {
  try {
    const a = JSON.parse(localStorage.getItem(MY_FOODS_KEY));
    return Array.isArray(a) ? a.map(cleanMyFood).filter(Boolean) : [];
  } catch (e) {
    return [];
  }
}

export function setMyFoods(arr) {
  localStorage.setItem(MY_FOODS_KEY, JSON.stringify(arr));
}

/** Backup restore guard: true when the raw JSON text is a list of foods. */
export function isValidMyFoodsPayload(raw) {
  try { return Array.isArray(JSON.parse(raw)); } catch (e) { return false; }
}

/** Saves (or updates, when the name already exists) a food with its per-100 g values. */
export function upsertMyFood(food) {
  const clean = cleanMyFood(food);
  if (!clean) return { saved: false, updated: false };
  const list = getMyFoods();
  const i = list.findIndex(f => normAr(f.name) === normAr(clean.name));
  if (i === -1) list.push(clean); else list[i] = clean;
  setMyFoods(list);
  return { saved: true, updated: i !== -1 };
}

export function deleteMyFood(name) {
  const list = getMyFoods();
  const next = list.filter(f => normAr(f.name) !== normAr(name));
  if (next.length === list.length) return false;
  setMyFoods(next);
  return true;
}
