// Food calculator, meals list, offsets, swaps.
import { ALL_FOOD_ITEMS, CUSTOM_FOOD, FOOD_CATEGORIES } from "../data/foods.js";
import { GENERAL_SWAPS, SWAP_RULES } from "../data/swaps.js";
import { foodNutrFor, normAr, nutrLine, sumMeals } from "../logic/nutrition.js";
import { getActiveProgram } from "../logic/schedule.js";
import { NUTR_GOAL_KEYS, getWaterGoal } from "../logic/storage.js";
import { saveState, state } from "../state.js";
import { esc } from "./dom.js";
import { closeNutrGoals } from "./modals.js";
import { renderNutritionCard } from "./render-nutrition.js";
import { renderWeeklyStats } from "./render-stats.js";
import { renderWater } from "./render-water.js";
import { showToast } from "./toast.js";

// deleteMeal needs toggleTask (render-tasks imports this module, so inject to avoid a cycle).
const hooks = { toggleTask: () => {} };
export function configureMeals(h) { Object.assign(hooks, h); }

let currentCategory = "basic";

export function setFoodCategory(cat) {
  currentCategory = cat;
  document.getElementById("foodSearch").value = "";
  populateFoodSelect();
}

export function getActiveFoodList() {
  const q = normAr(document.getElementById("foodSearch").value);
  const list = q
    ? ALL_FOOD_ITEMS.filter(f => normAr(f.name).includes(q))
    : (FOOD_CATEGORIES.find(c => c.id === currentCategory) || FOOD_CATEGORIES[0]).items;
  return [...list, CUSTOM_FOOD];
}

export function populateFoodSelect() {
  const sel = document.getElementById("foodSelect");
  sel.innerHTML = "";
  const list = getActiveFoodList();
  list.forEach((f, idx) => {
    const opt = document.createElement("option");
    opt.value = idx;
    const unit = f.category === "drinks" ? "100مل" : "100غ";
    opt.textContent = f.custom ? f.name : `${f.name} (${f.cal} سعرة / ${unit})`;
    sel.appendChild(opt);
  });
  updateFoodPreview();
}

export function updateFoodPreview() {
  const list = getActiveFoodList();
  const idx = parseInt(document.getElementById("foodSelect").value) || 0;
  const f = list[idx];
  const isDrink = f && f.category === "drinks";
  const grams = parseFloat(document.getElementById("foodGrams").value) || 0;
  const ml = parseFloat(document.getElementById("foodMl").value) || 0;
  const amount = isDrink ? ml : grams;
  if (!f) return;
  document.getElementById("customMacroInputs").style.display = f.custom ? "grid" : "none";
  document.getElementById("foodGrams").style.display = isDrink ? "none" : "block";
  document.getElementById("foodMl").style.display = isDrink ? "block" : "none";
  document.getElementById("foodPreview").textContent = "النتيجة: " + nutrLine(foodNutrFor(f, amount));
}

export function addFoodItem() {
  const list = getActiveFoodList();
  const idx = parseInt(document.getElementById("foodSelect").value) || 0;
  const f = list[idx];
  const isDrink = f && f.category === "drinks";
  const amount = isDrink ? (parseFloat(document.getElementById("foodMl").value) || 0) : (parseFloat(document.getElementById("foodGrams").value) || 0);
  if (!f || amount <= 0) return;

  const t = foodNutrFor(f, amount);
  const label = f.custom ? ((document.getElementById("custom_name").value || "").trim() || "أكلة مخصصة") : f.name;
  const unit = isDrink ? "مل" : "غ";
  state.meals.push(Object.assign({ name: `${label} (${amount}${unit})` }, t));
  saveState();
  renderMeals();
  renderWeeklyStats();
  showToast(`تمت الإضافة (+${t.cal} سعرة)`);
}

export function populateFoodCategories() {
  const sel = document.getElementById("foodCategory");
  sel.innerHTML = "";
  FOOD_CATEGORIES.forEach(c => {
    const o = document.createElement("option");
    o.value = c.id;
    o.textContent = `${c.label} (${c.items.length})`;
    sel.appendChild(o);
  });
  sel.value = currentCategory;
}

export function getUnitForCategory(catId) {
  return (catId === "drinks") ? "100مل" : "100غ";
}

export function populateMealAddSelect() {
  const q = normAr(document.getElementById("mealAddSearch").value);
  const sel = document.getElementById("mealAddSelect");
  sel.innerHTML = "";
  ALL_FOOD_ITEMS.forEach((f, idx) => {
    if (q && !normAr(f.name).includes(q)) return;
    const opt = document.createElement("option");
    opt.value = idx;
    const unit = f.category === "drinks" ? "100مل" : "100غ";
    opt.textContent = `${f.name} (${f.cal} سعرة / ${unit})`;
    sel.appendChild(opt);
  });
}

export function deleteMeal(i) {
  const removed = state.meals[i];
  if (removed && removed.taskId) { hooks.toggleTask(removed.taskId, false); return; }
  if (removed && removed.offsetId) {
    state.offsets = (state.offsets || []).filter(o => o.id !== removed.offsetId);
    renderOffsets();
  }
  state.meals.splice(i, 1);
  saveState();
  renderMeals();
  renderWeeklyStats();
}

export function renderMeals() {
  const list = document.getElementById("mealsList");
  let totalCal = 0, totalPro = 0;

  if (state.meals.length === 0) {
    list.innerHTML = `<div style="font-size:12px; color:var(--muted); text-align:center;">ضع علامة ✓ على أي وجبة بالرئيسية أو أضفها هنا</div>`;
  } else {
    list.innerHTML = "";
    state.meals.forEach((m, i) => {
      totalCal += m.cal;
      totalPro += m.pro;
      const row = document.createElement("div");
      row.className = "meal-row";
      row.innerHTML = `
      <div>
        <div style="font-weight:700;">${esc(m.name)}</div>
        <div style="font-size:11px; color:var(--muted);">${m.cal} سعرة • ${m.pro} غ بروتين</div>
        ${m.carb !== undefined ? `<div style="font-size:10px; color:var(--muted);">كارب ${m.carb}غ • دهون ${m.fat}غ • ألياف ${m.fib}غ • سكريات ${m.sug}غ • مشبعة ${m.sat}غ • صوديوم ${m.sod}مغ</div>` : ""}
      </div>
      <button class="del-btn" data-action="delete-meal" data-index="${i}">×</button>
    `;
      list.appendChild(row);
    });
  }

  const prog = getActiveProgram();
  const goal = prog.calGoal;
  document.getElementById("calGoalLabel").textContent = goal.toLocaleString("en-US");
  document.getElementById("proGoalLabel").textContent = prog.proGoal;
  document.getElementById("calVal").textContent = totalCal.toLocaleString("en-US");
  document.getElementById("calRem").textContent = (goal - totalCal).toLocaleString("en-US");
  document.getElementById("proVal").textContent = Math.round(totalPro) + " غ";
  const pct = Math.min(100, (totalCal / goal) * 100);
  const bar = document.getElementById("calBar");
  bar.style.width = pct + "%";
  bar.style.background = totalCal > goal ? "var(--red)" : "var(--green)";
  renderNutritionCard(sumMeals(state.meals));
}

export function saveNutrGoals() {
  const g = {};
  NUTR_GOAL_KEYS.forEach(k => {
    const v = parseFloat(document.getElementById("ng_" + k).value);
    if (v > 0) g[k] = v;
  });
  localStorage.setItem("aburaslan_nutr_goals", JSON.stringify(g));
  closeNutrGoals();
  renderMeals();
  showToast("تم حفظ أهدافك الغذائية");
}

export function calcOffset() {
  const nameInput = document.getElementById("extraNameInput");
  const calInput = document.getElementById("extraCalInput");
  const foodName = nameInput.value.trim() || "أكلة خارج البرنامج";
  const extra = parseFloat(calInput.value) || 0;
  const res = document.getElementById("offsetResult");
  if (extra <= 0) return;

  if (!state.offsets) state.offsets = [];
  const offsetId = "off_" + Date.now();
  const timeStr = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });

  state.offsets.push({ id: offsetId, name: foodName, cal: extra, time: timeStr });
  state.meals.push({ offsetId: offsetId, name: `🚨 طوارئ: ${foodName}`, cal: extra, pro: 0 });
  saveState();
  renderMeals();
  renderOffsets();
  renderWeeklyStats();

  nameInput.value = "";
  calInput.value = "";

  res.style.display = "block";
  let steps = [];
  let rem = extra;

  if (rem > 0) {
    steps.push("• <strong>الغداء:</strong> قلّل البرغل من 200غ إلى 50غ (يوفّر <strong>129 سعرة</strong>).");
    rem -= 129;
  }
  if (rem > 0) {
    steps.push("• <strong>المكسرات قبل النوم:</strong> ألغِ كمشة المكسرات الليلة (توفّر <strong>69 سعرة</strong>).");
    rem -= 69;
  }
  if (rem > 0) {
    steps.push("• <strong>الفواكه:</strong> اكتفي بحبة فاكهة واحدة بعد الفطور وألغِ حبة العصر والعشاء (توفّر <strong>130 سعرة</strong>).");
    rem -= 130;
  }
  if (rem > 0) {
    steps.push(`• <strong>باقي فرق (${Math.round(rem)} سعرة):</strong> زيد 15 دقيقة مشي سريع بعد التمرين.`);
  }
  res.innerHTML = `<div style="font-weight:800; color:var(--amber); margin-bottom:5px;">خطة تصفير (${foodName} - ${extra} سعرة) بدون لمس البروتين:</div>` + steps.join("<br>");
  showToast(`تم تسجيل "${foodName}" في الطوارئ والتقرير`);
}

export function renderOffsets() {
  const list = document.getElementById("offsetLogList");
  if (!list) return;
  const offsets = state.offsets || [];
  if (offsets.length === 0) {
    list.innerHTML = "";
    return;
  }
  list.innerHTML = `<div style="font-size:11px; color:var(--amber); font-weight:700; margin-bottom:5px;">سجل الطوارئ المسجّل اليوم (يظهر بالتقرير):</div>`;
  offsets.forEach(o => {
    const row = document.createElement("div");
    row.className = "meal-row";
    row.style.borderRight = "3px solid var(--amber)";
    row.innerHTML = `
    <div>
      <div style="font-weight:700;">${esc(o.name)} <span style="font-size:11px; color:var(--muted);">(${o.time})</span></div>
      <div style="font-size:11px; color:var(--amber);">+${o.cal} سعرة إضافية</div>
    </div>
    <button class="del-btn" data-action="delete-offset" data-id="${o.id}">×</button>
  `;
    list.appendChild(row);
  });
}

export function deleteOffset(id) {
  state.offsets = (state.offsets || []).filter(o => o.id !== id);
  state.meals = state.meals.filter(m => m.offsetId !== id);
  saveState();
  renderOffsets();
  renderMeals();
  renderWeeklyStats();
}

// Quick-swap data (data/swaps.js) -> registered action names (ui/actions.js)
const SWAP_ACTIONS = { addExerciseSwap: "add-exercise-swap", addWaterSwap: "add-water-swap", addVeggieSwap: "add-veggie-swap" };

export function openSmartSwaps() {
  const prog = getActiveProgram();
  const totalCal = state.meals.reduce((a, b) => a + b.cal, 0);
  const goal = prog.calGoal;
  const over = totalCal - goal;
  if (over <= 0) {
    showToast("أنت ضمن السعرات — لا حاجة لبدائل");
    return;
  }
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.style.display = "flex";
  modal.innerHTML = `
  <div class="modal-card" style="border-color: var(--amber); max-width: 420px;">
    <div class="modal-icon">💡</div>
    <div class="modal-title">بدائل ذكية لتوفير ${over} سعرة</div>
    <div class="modal-desc">أنت تجاوزت السقف بـ <strong>${over} سعرة</strong>. اختر بديلاً لتطبيق التغيير:</div>
    <div id="swapsList" style="max-height: 300px; overflow-y: auto; margin-bottom: 12px; text-align: right;"></div>
    <button class="btn" style="width:100%;" data-action="close-overlay">إغلاق</button>
  </div>
`;
  document.body.appendChild(modal);
  renderSwaps(modal, over);
}

export function renderSwaps(modal, overCal) {
  const list = modal.querySelector("#swapsList");
  const meals = state.meals.filter(m => !m.offsetId && !m.taskId);
  const swaps = [];


  meals.forEach((m, idx) => {
    const name = m.name;
    SWAP_RULES.forEach(rule => {
      if (name.includes(rule.from)) {
        const match = name.match(/\((\d+(?:\.\d+)?)غ\)/);
        const grams = match ? parseFloat(match[1]) : 100;
        const saved = Math.round((rule.savePer100g * grams) / 100);
        if (saved > 0) {
          swaps.push({
            mealIdx: idx,
            mealName: name,
            from: rule.from,
            to: rule.to,
            saved,
            note: rule.note
          });
        }
      }
    });
  });

  const generalSwaps = GENERAL_SWAPS;

  let html = "";
  if (swaps.length > 0) {
    html += `<div style="font-weight:700; color:var(--amber); margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid var(--border);">بدائل لوجباتك اليوم:</div>`;
    swaps.forEach(s => {
      html += `
        <div style="background:var(--card-2); border:1px solid var(--border); border-radius:10px; padding:10px; margin-bottom:8px;">
          <div style="font-weight:700; margin-bottom:4px;">${esc(s.mealName)}</div>
          <div style="font-size:12px; color:var(--muted); margin-bottom:6px;">استبدل <strong>${s.from}</strong> بـ <strong>${s.to}</strong></div>
          <div style="font-size:11px; color:var(--green); margin-bottom:6px;">💚 يوفر ~${s.saved} سعرة (${s.note})</div>
          <button class="btn btn-green" style="width:100%; padding:8px; font-size:12px;" data-action="apply-smart-swap" data-meal-index="${s.mealIdx}" data-from="${esc(s.from)}" data-to="${esc(s.to)}" data-saved="${s.saved}">تطبيق هذا البديل</button>
        </div>
      `;
    });
  }

  if (generalSwaps.length > 0) {
    html += `<div style="font-weight:700; color:var(--blue); margin:16px 0 8px; padding-top:8px; border-top:1px solid var(--border);">بدائل عامة سريعة:</div>`;
    generalSwaps.forEach(s => {
      html += `
        <button class="btn btn-blue" style="width:100%; margin-bottom:6px; padding:10px; text-align:right;" data-action="${SWAP_ACTIONS[s.action]}" data-saved="${s.saved}">
          ${s.label} <span style="color:var(--green);">(~${s.saved} سعرة)</span>
        </button>
      `;
    });
  }

  if (swaps.length === 0 && generalSwaps.length === 0) {
    html = `<div style="text-align:center; color:var(--muted); padding:20px;">لا توجد بدائل متاحة حالياً</div>`;
  }

  list.innerHTML = html;
}

// Close only the smart-swaps modal (the first .modal-overlay in the DOM is the static alarm modal)
function closeSwapsModal() {
  document.getElementById("swapsList")?.closest(".modal-overlay")?.remove();
}

export function applySmartSwap(mealIdx, fromItem, toItem, savedCal) {
  // منطق التطبيق: تعديل الوجبة في state.meals
  const meal = state.meals[mealIdx];
  if (!meal) return;
  // تبسيط: نطرح السعرات المحفوظة من الوجبة
  meal.cal = Math.max(0, meal.cal - savedCal);
  meal.name = meal.name.replace(fromItem, toItem);
  saveState();
  renderMeals();
  renderWeeklyStats();
  showToast(`✅ تم تطبيق البديل: وفرت ${savedCal} سعرة`);
  closeSwapsModal();
}

export function addExerciseSwap(saved) {
  state.meals.push({ name: `🚶‍♂️ تمرين إضافي (مشي 15د)`, cal: -saved, pro: 0, carb: 0, fat: 0, fib: 0, sug: 0, sat: 0, sod: 0 });
  saveState();
  renderMeals();
  renderWeeklyStats();
  showToast(`✅ أضيف تمرين: -${saved} سعرة`);
  closeSwapsModal();
}

export function addWaterSwap(saved) {
  state.water = Math.min(getWaterGoal(), state.water + 500);
  saveState();
  renderWater();
  showToast(`✅ أضيف 500مل ماء`);
  closeSwapsModal();
}

export function addVeggieSwap(saved) {
  state.meals.push({ name: `🥗 زيادة خضار`, cal: -saved, pro: 0, carb: 0, fat: 0, fib: 2, sug: 0, sat: 0, sod: 0 });
  saveState();
  renderMeals();
  renderWeeklyStats();
  showToast(`✅ تعديل: -${saved} سعرة`);
  closeSwapsModal();
}
