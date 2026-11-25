// Per-task meal customizer and saved presets.
import { ALL_FOOD_ITEMS } from "../data/foods.js";
import { calcItemsMacros, makeMealItem, nutrLine } from "../logic/nutrition.js";
import { formatItemsSummary, getActiveProgram, getTaskMealItems } from "../logic/schedule.js";
import { getSavedPresets, setSavedPresets } from "../logic/storage.js";
import { saveState, state } from "../state.js";
import { esc } from "./dom.js";
import { closeMealEdit, editing } from "./modals.js";
import { populateMealAddSelect, renderMeals } from "./render-meals.js";
import { renderNextStationCard, renderTasks } from "./render-tasks.js";
import { showToast } from "./toast.js";

export function populatePresetDropdown() {
  const sel = document.getElementById("presetSelect");
  const presets = getSavedPresets();
  sel.innerHTML = "";
  if (presets.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "لا توجد قوالب محفوظة بعد";
    sel.appendChild(opt);
    return;
  }
  presets.forEach((p, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${p.name} (${p.cal} سعرة)`;
    sel.appendChild(opt);
  });
}

export function saveCurrentAsPreset() {
  const validItems = editing.tempMealItems.filter(it => it.grams > 0);
  if (validItems.length === 0) return;
  const presetName = prompt("اكتب اسماً لهذا القالب (مثلاً: غداء لحم 200غ + 150غ برغل):");
  if (!presetName || !presetName.trim()) return;
  const totals = calcItemsMacros(validItems);
  const presets = getSavedPresets();
  presets.push({
    name: presetName.trim(),
    cal: totals.cal,
    items: JSON.parse(JSON.stringify(validItems))
  });
  setSavedPresets(presets);
  populatePresetDropdown();
  showToast(`💾 تم حفظ قالب "${presetName.trim()}"`);
}

export function applySelectedPreset() {
  const idx = document.getElementById("presetSelect").value;
  if (idx === "") return;
  const presets = getSavedPresets();
  const p = presets[parseInt(idx)];
  if (!p) return;
  editing.tempMealItems = JSON.parse(JSON.stringify(p.items));
  renderMealIngredientsEditor();
  showToast(`تم تطبيق قالب "${p.name}"`);
}

export function deleteSelectedPreset() {
  const idx = document.getElementById("presetSelect").value;
  if (idx === "") return;
  const presets = getSavedPresets();
  const removed = presets.splice(parseInt(idx), 1);
  setSavedPresets(presets);
  populatePresetDropdown();
  if (removed[0]) showToast(`تم حذف قالب "${removed[0].name}"`);
}

export function openMealEdit(e, taskId) {
  e.stopPropagation();
  editing.mealTaskId = taskId;
  const t = getActiveProgram().tasks.find(x => x.id === taskId);
  if (!t) return;
  document.getElementById("mealEditTitle").textContent = `تخصيص: ${t.text}`;
  editing.tempMealItems = JSON.parse(JSON.stringify(getTaskMealItems(t)));

  populatePresetDropdown();

  document.getElementById("mealAddSearch").value = "";
  populateMealAddSelect();

  renderMealIngredientsEditor();
  document.getElementById("mealEditModal").style.display = "flex";
}

export function renderMealIngredientsEditor() {
  const box = document.getElementById("mealIngredientsList");
  box.innerHTML = "";
  editing.tempMealItems.forEach((it, idx) => {
    const itemCal = Math.round((it.cal100 * it.grams) / 100);
    const row = document.createElement("div");
    row.className = "ing-row";
    row.innerHTML = `
    <div>
      <div style="font-weight:700;">${esc(it.name)}</div>
      <div style="font-size:10px; color:var(--muted);" data-ing-cal="${idx}">${itemCal} سعرة</div>
    </div>
    <input type="number" value="${it.grams}" min="0" data-input="update-temp-ing-grams" data-index="${idx}" />
    <button class="del-btn" data-action="remove-temp-ing" data-index="${idx}">×</button>
  `;
    box.appendChild(row);
  });
  updateMealEditSummary();
}

function updateMealEditSummary() {
  const totals = calcItemsMacros(editing.tempMealItems);
  document.getElementById("mealEditSummary").textContent = "الإجمالي: " + nutrLine(totals);
}

// Called on every keystroke in a grams field. Updates only the numbers on screen and
// never rebuilds the rows, so the <input> keeps focus (and the mobile keyboard stays open).
export function updateTempIngGrams(idx, val) {
  const it = editing.tempMealItems[idx];
  if (!it) return;
  it.grams = Math.max(0, parseFloat(val) || 0);
  const calEl = document.querySelector(`#mealIngredientsList [data-ing-cal="${idx}"]`);
  if (calEl) calEl.textContent = `${Math.round((it.cal100 * it.grams) / 100)} سعرة`;
  updateMealEditSummary();
}

export function removeTempIng(idx) {
  editing.tempMealItems.splice(idx, 1);
  renderMealIngredientsEditor();
}

export function addIngredientToMeal() {
  const selVal = document.getElementById("mealAddSelect").value;
  if (selVal === "") { showToast("ما في صنف بهالاسم، جرّب كلمة تانية"); return; }
  const idx = parseInt(selVal);
  const f = ALL_FOOD_ITEMS[idx];
  const grams = parseFloat(document.getElementById("mealAddGrams").value) || 100;
  if (!f || grams <= 0) return;
  editing.tempMealItems.push(makeMealItem(f, grams));
  renderMealIngredientsEditor();
}

export function saveMealCustomization() {
  if (!editing.mealTaskId) return;
  const key = `${state.dayMode}_${editing.mealTaskId}`;
  state.customMeals[key] = editing.tempMealItems.filter(it => it.grams > 0);

  if (state.tasks[editing.mealTaskId]) {
    const t = getActiveProgram().tasks.find(x => x.id === editing.mealTaskId);
    const items = getTaskMealItems(t);
    const totals = calcItemsMacros(items);
    const existingIdx = state.meals.findIndex(m => m.taskId === editing.mealTaskId);
    if (existingIdx !== -1) {
      Object.assign(state.meals[existingIdx], totals);
      state.meals[existingIdx].name = `${t.text.replace(/^[^\s]+\s/, "")} [${formatItemsSummary(items)}]`;
    }
    renderMeals();
  }

  saveState();
  renderTasks();
  renderNextStationCard();
  closeMealEdit();
  showToast("تم تحديث أصناف وأوزان الوجبة");
}
