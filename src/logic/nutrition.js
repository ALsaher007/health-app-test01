// Nutrition helpers (pure functions)

import { NUTR_KEYS } from "../data/nutrition-constants.js";
import { FOOD_BY_NAME } from "../data/foods.js";

export function r1(n) { return Math.round(n * 10) / 10; }
export function emptyNutr() { return { cal: 0, pro: 0, carb: 0, fat: 0, fib: 0, sug: 0, sat: 0, sod: 0 }; }
export function roundNutr(t) {
  return { cal: Math.round(t.cal), pro: r1(t.pro), carb: r1(t.carb), fat: r1(t.fat), fib: r1(t.fib), sug: r1(t.sug), sat: r1(t.sat), sod: Math.round(t.sod) };
}
export function makeMealItem(f, grams) {
  const it = { name: f.name, grams: grams };
  NUTR_KEYS.forEach(k => { it[k + "100"] = f[k] || 0; });
  return it;
}
export function itemPer100(it, k) {
  if (typeof it[k + "100"] === "number") return it[k + "100"];
  const f = FOOD_BY_NAME[it.name];
  return f && typeof f[k] === "number" ? f[k] : 0;
}
export function calcItemsMacros(items) {
  const t = emptyNutr();
  items.forEach(it => NUTR_KEYS.forEach(k => { t[k] += (itemPer100(it, k) * it.grams) / 100; }));
  return roundNutr(t);
}
export function sumMeals(meals) {
  const t = emptyNutr();
  meals.forEach(m => NUTR_KEYS.forEach(k => { t[k] += (m[k] || 0); }));
  return roundNutr(t);
}
export function nutrLine(t) {
  return `${t.cal} سعرة | ${t.pro}غ بروتين | ${t.carb}غ كارب | ${t.fat}غ دهون | ${t.fib}غ ألياف | ${t.sug}غ سكريات | ${t.sat}غ مشبعة | ${t.sod}مغ صوديوم`;
}
export function foodNutrFor(f, grams) {
  const t = emptyNutr();
  NUTR_KEYS.forEach(k => {
    const per100 = f[k] || 0; // custom entries pass their own per-100 values on `f`
    t[k] = (per100 * grams) / 100;
  });
  return roundNutr(t);
}

// ----- Arabic search normalization -----
export function normAr(s) {
  return String(s || "").toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();
}

// ===================== Body-based daily goals =====================
// Pure functions (no DOM / storage). All circumferences in cm, weight in kg.

export const ACTIVITY_FACTORS = { sedentary: 1.2, light: 1.375, moderate: 1.55, high: 1.725 };
export const GOAL_KEYS_ALL = ["cal", "pro", "carb", "fat", "fib", "sug", "sat", "sod"];

function pos(v) { const n = parseFloat(v); return Number.isFinite(n) && n > 0 ? n : 0; }

/** The minimum a profile needs before any goal can be calculated. */
export function isBodyProfileComplete(p) {
  if (!p || (p.sex !== "male" && p.sex !== "female")) return false;
  const age = pos(p.age), h = pos(p.height), w = pos(p.weight);
  return age >= 10 && age <= 100 && h >= 100 && h <= 250 && w >= 20 && w <= 400;
}

/**
 * US Navy body-fat % (men: height, waist, neck; women: height, waist, neck, hip).
 * Returns null when a needed circumference is missing or the result is not plausible.
 */
export function navyBodyFat(p) {
  const h = pos(p.height), waist = pos(p.waist), neck = pos(p.neck), hip = pos(p.hip);
  if (!h || !waist || !neck) return null;
  let bf;
  if (p.sex === "female") {
    if (!hip || waist + hip - neck <= 0) return null;
    bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(h)) - 450;
  } else {
    if (waist - neck <= 0) return null;
    bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
  }
  return bf >= 2 && bf <= 60 ? r1(bf) : null;
}

/**
 * Daily goals from body measurements.
 *  - LBM from Navy body fat when possible -> Katch-McArdle BMR; else Mifflin-St Jeor on total weight.
 *  - TDEE = BMR x activity; cut = -500 (never below BMR), maintain = 0, build = +300.
 *  - Protein (ISSN): 2.0 g/kg (cut) or 1.8 g/kg (maintain/build) of LBM, or of total weight without LBM.
 *  - Fat max 25% kcal / 9; carbs = what is left / 4; fibre min 14 g per 1000 kcal;
 *    sugar max 10% kcal / 4 (5% when cutting); saturated max 10% kcal / 9; sodium 2300 mg.
 * opts.programCal / opts.programPro (> 0) switch to "program" mode: calories and protein come from
 * the active daily program and only the limits are derived (from the program's calories).
 * Returns null for an incomplete profile.
 */
export function calcBodyGoals(p, opts = {}) {
  if (!isBodyProfileComplete(p)) return null;
  const weight = pos(p.weight), height = pos(p.height), age = pos(p.age);
  const male = p.sex !== "female";
  const goal = p.goal === "maintain" || p.goal === "build" ? p.goal : "cut";

  const bodyFat = navyBodyFat(p);
  const lbm = bodyFat !== null ? r1(weight * (1 - bodyFat / 100)) : null;
  const bmrMethod = lbm !== null ? "katch" : "mifflin";
  const bmr = lbm !== null
    ? 370 + 21.6 * lbm
    : 10 * weight + 6.25 * height - 5 * age + (male ? 5 : -161);
  const tdee = bmr * (ACTIVITY_FACTORS[p.activity] || ACTIVITY_FACTORS.light);

  let target = goal === "cut" ? tdee - 500 : goal === "build" ? tdee + 300 : tdee;
  let floorApplied = false;
  if (goal === "cut" && target < bmr) { target = bmr; floorApplied = true; }
  const bodyPro = (goal === "cut" ? 2.0 : 1.8) * (lbm !== null ? lbm : weight);

  const progCal = pos(opts.programCal), progPro = pos(opts.programPro);
  const usedProgram = p.mode !== "full" && progCal > 0;
  const cal = Math.round(usedProgram ? progCal : target);
  const pro = Math.round(usedProgram && progPro > 0 ? progPro : bodyPro);

  const fat = (cal * 0.25) / 9;
  const carb = Math.max(0, (cal - pro * 4 - fat * 9) / 4);
  return {
    cal, pro,
    carb: Math.round(carb),
    fat: Math.round(fat),
    fib: Math.round((cal / 1000) * 14),
    sug: Math.round((cal * (goal === "cut" ? 0.05 : 0.10)) / 4),
    sat: Math.round((cal * 0.10) / 9),
    sod: 2300,
    bodyFat, lbm, bmrMethod, bmr: Math.round(bmr), tdee: Math.round(tdee),
    targetCal: Math.round(target), floorApplied, usedProgram
  };
}
