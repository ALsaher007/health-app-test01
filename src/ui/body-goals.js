// "أهدافي الغذائية" window: body measurements -> daily goals, calculated live and saved permanently.
// Measurements live in localStorage "aburaslan_body_profile"; the cards read the effective goals
// through storage.js (calculated values + manual overrides), so nothing else needs to be told.
import { isBodyProfileComplete, sumMeals } from "../logic/nutrition.js";
import { getBodyGoals, getBodyProfile, getEffectiveNutrGoals, getNutrGoals, NUTR_GOAL_KEYS, setBodyProfile } from "../logic/storage.js";
import { state } from "../state.js";
import { showModal } from "./modals.js";
import { renderMeals } from "./render-meals.js";
import { renderNutritionCard } from "./render-nutrition.js";

const NUMERIC_FIELDS = ["age", "height", "weight", "waist", "neck", "hip"];
const BODY_INPUT_IDS = { sex: "bp_sex", age: "bp_age", height: "bp_height", weight: "bp_weight", waist: "bp_waist", neck: "bp_neck", hip: "bp_hip", activity: "bp_activity", goal: "bp_goal" };
const GOAL_FIELD_KEYS = ["cal", "pro", ...NUTR_GOAL_KEYS];

const $ = id => document.getElementById(id);

export function openNutrGoals() {
  const p = getBodyProfile();
  if (!p.weight) { // first time: start from the last weight entered in the weight tab
    const last = parseFloat(localStorage.getItem("aburaslan_last_weight"));
    if (last > 0) { p.weight = last; setBodyProfile(p); }
  }
  Object.entries(BODY_INPUT_IDS).forEach(([k, id]) => { $(id).value = p[k] === null || p[k] === undefined ? "" : p[k]; });
  // incomplete profile: the goal fields keep working as the old manual goals
  const manual = getNutrGoals();
  GOAL_FIELD_KEYS.forEach(k => { $("ng_" + k).value = manual[k] > 0 ? manual[k] : ""; });
  refreshBodyUI(true);
  showModal("nutrGoalsModal");
}

function renderCards() {
  renderNutritionCard(sumMeals(state.meals));
}

/** Re-renders everything that depends on the profile; `fillGoals` rewrites the goal fields. */
function refreshBodyUI(fillGoals) {
  const p = getBodyProfile();
  const complete = isBodyProfileComplete(p);
  $("bp_hip_row").style.display = p.sex === "female" ? "block" : "none";
  ["program", "full"].forEach(m => $("bpMode-" + m).classList.toggle("active", p.mode === m));

  const box = $("bodySummary");
  if (!complete) {
    box.textContent = "أدخل الجنس والعمر والطول والوزن لتُحسب أهدافك تلقائياً. إلى ذلك الحين تعمل الحقول كأهداف يدوية.";
  } else {
    const g = getBodyGoals(p);
    const lines = [];
    lines.push(g.bodyFat !== null
      ? `🔬 نسبة الدهون (US Navy): ${g.bodyFat}% • الكتلة الصافية LBM: ${g.lbm} كغ`
      : `ℹ️ لحساب نسبة الدهون وLBM أضف محيط الرقبة${p.sex === "female" ? " والورك" : ""} مع الخصر. الآن يُستخدم الوزن الكلي.`);
    lines.push(`🔥 BMR: ${g.bmr} (${g.bmrMethod === "katch" ? "Katch-McArdle" : "Mifflin-St Jeor"}) • TDEE: ${g.tdee} • سعرات الهدف: ${g.targetCal}${g.floorApplied ? " (رُفعت إلى BMR كحد أمان)" : ""}`);
    lines.push(p.mode === "full"
      ? "✅ الأهداف كلها من قياسات جسمك."
      : (g.usedProgram ? "✅ السعرات والبروتين من البرنامج المفعّل، والحدود الأخرى محسوبة منها."
        : "ℹ️ لا يوجد برنامج بمهام اليوم — حُسبت السعرات والبروتين من قياساتك."));
    box.innerHTML = "";
    lines.forEach(t => { const d = document.createElement("div"); d.textContent = t; box.appendChild(d); });
  }
  if (complete && fillGoals) {
    const eff = getEffectiveNutrGoals();
    GOAL_FIELD_KEYS.forEach(k => { $("ng_" + k).value = eff[k] > 0 ? eff[k] : ""; });
  }
  renderCards();
}

/** A measurement / option changed: save it, recalculate ALL goals (manual overrides reset). */
export function bodyFieldChanged(field, value) {
  const p = getBodyProfile();
  if (NUMERIC_FIELDS.includes(field)) p[field] = parseFloat(value) > 0 ? parseFloat(value) : null;
  else if (field in BODY_INPUT_IDS) p[field] = value;
  else return;
  p.overrides = {};
  setBodyProfile(p);
  refreshBodyUI(true);
  renderMeals();
}

export function setBodyMode(mode) {
  const p = getBodyProfile();
  p.mode = mode === "full" ? "full" : "program";
  p.overrides = {};
  setBodyProfile(p);
  refreshBodyUI(true);
  renderMeals();
}

/** A goal number typed by hand: kept as an override until the next recalculation. */
export function goalFieldChanged(key, value) {
  const p = getBodyProfile();
  if (!isBodyProfileComplete(p) || !GOAL_FIELD_KEYS.includes(key)) return; // incomplete: saved by the "حفظ" button
  const n = parseFloat(value);
  if (n > 0) p.overrides[key] = n; else delete p.overrides[key];
  setBodyProfile(p);
  refreshBodyUI(false);
  renderMeals();
}

export function recalcBodyGoals() {
  const p = getBodyProfile();
  p.overrides = {};
  setBodyProfile(p);
  refreshBodyUI(true);
  renderMeals();
}
