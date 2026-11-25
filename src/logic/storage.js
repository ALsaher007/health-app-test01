// Small localStorage-backed getters/setters: goals, Telegram config, meal presets.
import { PROGRAMS } from "../data/programs.js";
import { state } from "../state.js";

export const NUTR_GOAL_KEYS = ["carb", "fat", "fib", "sug", "sat", "sod"];

export function getGoals() {
  try { return JSON.parse(localStorage.getItem("aburaslan_goals")) || {}; }
  catch (e) { return {}; }
}

export function getWaterGoal(mode = state.dayMode) {
  const g = getGoals()[mode];
  return g > 0 ? g : PROGRAMS[mode].waterGoal;
}

export function getNutrGoals() {
  try { return JSON.parse(localStorage.getItem("aburaslan_nutr_goals")) || {}; }
  catch (e) { return {}; }
}

export function nutrGoalFor(k) {
  const g = getNutrGoals();
  return g[k] > 0 ? g[k] : null;
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
