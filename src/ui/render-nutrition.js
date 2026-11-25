// Nutrition summary card.
import { NUTR_KEYS, NUTR_LABELS, NUTR_TYPE, NUTR_UNITS } from "../data/nutrition-constants.js";
import { nutrGoalFor } from "../logic/storage.js";

export function renderNutritionCard(t) {
  const box = document.getElementById("nutrGrid");
  if (!box) return;
  box.innerHTML = NUTR_KEYS.map(k => {
    const goal = nutrGoalFor(k);
    let cls = "";
    if (goal) cls = NUTR_TYPE[k] === "max" ? (t[k] > goal ? "over" : "") : (t[k] >= goal ? "ok" : "");
    const goalHtml = goal ? ` <span class="nutr-goal">/ ${goal.toLocaleString("en-US")}</span>` : "";
    return `<div class="nutr-box ${cls}"><span>${NUTR_LABELS[k]}</span><span class="nutr-val">${t[k].toLocaleString("en-US")} ${NUTR_UNITS[k]}${goalHtml}</span></div>`;
  }).join("");
}
