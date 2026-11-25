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
    const per100 = f.custom ? 0 : (f[k] || 0);
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
