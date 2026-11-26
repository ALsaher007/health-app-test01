// Program profiles UI: manager window, activation flow, master-template editor.
// Rule: nothing here is reached from the day's own edits. Day edits live in `state`;
// the stored templates change only through the editor below (or create/delete/activate).
import { STORAGE_PREFIX } from "../config.js";
import { ALL_FOOD_ITEMS } from "../data/foods.js";
import { resyncAlarmsForProgramChange } from "../logic/alarms.js";
import { makeMealItem, normAr } from "../logic/nutrition.js";
import {
  buildProfileFromDay, createProfile, deepClone, deleteProfile, getActiveProfileId, getProfile, getProfiles,
  MODE_KEYS, saveProfile, setActiveProfile, snapshotActiveProgram
} from "../logic/programs.js";
import { getActiveProgram, getTaskMealItems, getTaskMins, getTaskWater, hhmmToMins, minsToHHMM, resetDayProgress } from "../logic/schedule.js";
import { syncScheduleToCloud } from "../logic/telegram.js";
import { createEmptyDayState, currentTodayStr, isViewingToday, saveState, setViewingDate, state, viewingDateStr } from "../state.js";
import { esc } from "./dom.js";
import { closeProgramApply, closeProgramEditor, editing, showModal } from "./modals.js";
import { renderAll } from "./render-all.js";
import { renderHeaderModes } from "./render-header.js";
import { updateLockUI } from "./render-water.js";
import { showToast } from "./toast.js";

const MODE_LABELS = { gym: "💪 النادي", sat: "🏋️ السبت", rest: "🛌 راحة" };

// ===================== manager window =====================

export function openProgramManager() {
  renderProgramManager();
  showModal("programManagerModal");
}

export function renderProgramManager() {
  const activeId = getActiveProfileId();
  const profiles = getProfiles();
  const box = document.getElementById("programListBox");
  box.innerHTML = profiles.length === 0
    ? `<div class="pm-empty">لا توجد برامج محفوظة. أنشئ برنامجاً من الأسفل.</div>`
    : profiles.map(p => {
      const isActive = p.id === activeId;
      const n = p.modes.gym.tasks.length;
      return `
      <div class="pm-row${isActive ? " pm-active" : ""}">
        <div class="pm-name">📋 ${esc(p.name)}${isActive ? ` <span class="pill-tag pill-lock">✅ نشط</span>` : ""}</div>
        <div class="pm-meta">${n} مهمة في أيام النادي</div>
        <div class="pm-btns">
          <button class="btn ${isActive ? "btn-amber" : "btn-green"}" data-action="program-toggle-active" data-id="${esc(p.id)}">${isActive ? "⏹ إلغاء التفعيل" : "▶ تفعيل"}</button>
          <button class="btn btn-blue" data-action="program-edit" data-id="${esc(p.id)}">✏️ تعديل القالب الأساسي</button>
          <button class="btn btn-red" data-action="program-delete" data-id="${esc(p.id)}">🗑️ حذف</button>
        </div>
      </div>`;
    }).join("");

  const dayName = state.programSnap ? state.programSnap.profileName : null;
  const activeName = (profiles.find(p => p.id === activeId) || {}).name || null;
  const note = document.getElementById("programDayNote");
  const differs = (state.programSnap ? state.programSnap.profileId : null) !== activeId;
  note.textContent = differs
    ? `اليوم المعروض يعمل بنسخة: ${dayName || "بدون برنامج"} — الأيام الجديدة ستأخذ: ${activeName || "بدون برنامج"}.`
    : "";
  note.style.display = differs ? "block" : "none";

  const sel = document.getElementById("pmCreateFrom");
  sel.innerHTML = `<option value="">برنامج فارغ</option>` +
    profiles.map(p => `<option value="${esc(p.id)}">نسخ من: ${esc(p.name)}</option>`).join("");
}

function refreshAfterProgramChange() {
  renderHeaderModes();
  if (document.getElementById("programManagerModal").style.display === "flex") renderProgramManager();
}

/** Writes today's state (with its snapshot) if it was never saved, so a store change can't flip it. */
function pinToday() {
  const key = STORAGE_PREFIX + currentTodayStr;
  if (localStorage.getItem(key)) return;
  const day = isViewingToday() ? state : null;
  if (day) { localStorage.setItem(key, JSON.stringify(day)); return; }
  // viewing a past day: pin a fresh today on the template that is still active
  const fresh = createEmptyDayState(currentTodayStr);
  fresh.programSnap = snapshotActiveProgram(fresh.dayMode);
  localStorage.setItem(key, JSON.stringify(fresh));
}

function dayHasProgress() {
  return Object.values(state.tasks).some(Boolean);
}

/** "Apply to today" = today restarts from the (new) active template. */
function applyActiveProgramToToday() {
  if (!isViewingToday()) setViewingDate(currentTodayStr);
  resetDayProgress();
  state.customMeals = {};
  state.customWater = {};
  state.programSnap = snapshotActiveProgram(state.dayMode);
  resyncAlarmsForProgramChange();
  saveState();
  updateLockUI();
  renderAll(false);
}

function afterActiveChanged() {
  syncScheduleToCloud(false, true);
  updateLockUI();
  refreshAfterProgramChange();
}

// ----- activation flow -----

export function toggleProgramActive(id) {
  const isActive = getActiveProfileId() === id;
  requestApply(isActive ? "deactivate" : "activate", id);
}

function requestApply(kind, id) {
  editing.pendingApply = { kind, id };
  const p = getProfile(id);
  const name = p ? p.name : "";
  const warn = dayHasProgress() ? "\n⚠️ تطبيقه على اليوم الحالي يصفّر إنجاز اليوم (المهام المنجزة والوجبات المرتبطة بها)." : "";
  const title = { activate: `تفعيل «${name}»`, deactivate: `إلغاء تفعيل «${name}»`, edit: `تم حفظ «${name}»` }[kind];
  const ask = {
    activate: "هل تريد تطبيقه على اليوم الحالي أيضاً، أم بدءاً من الغد فقط؟",
    deactivate: "هل تريد إفراغ اليوم الحالي أيضاً، أم يبدأ الإلغاء من الغد فقط؟",
    edit: "هل تريد تطبيق التعديلات على اليوم الحالي أيضاً، أم بدءاً من الغد فقط؟"
  }[kind];
  document.getElementById("programApplyTitle").textContent = title;
  document.getElementById("programApplyDesc").textContent = ask + warn;
  document.getElementById("programApplyCancel").style.display = kind === "edit" ? "none" : "";
  showModal("programApplyModal");
}

export function programApply(now) {
  const pending = editing.pendingApply;
  if (!pending) return;
  closeProgramApply();
  if (pending.kind === "edit") {
    if (now) { applyActiveProgramToToday(); showToast("✅ طُبّق القالب المعدّل على اليوم الحالي"); }
    else showToast("✅ حُفظ القالب — يسري من الغد");
    afterActiveChanged();
    return;
  }
  pinToday(); // keep today on its current program unless the user chose "today"
  const newActive = setActiveProfile(pending.kind === "activate" ? pending.id : null);
  if (now) applyActiveProgramToToday();
  const p = newActive ? getProfile(newActive) : null;
  showToast(p
    ? `✅ تم تفعيل «${p.name}» ${now ? "على اليوم الحالي" : "بدءاً من الغد"}`
    : `⏹ أُلغي التفعيل ${now ? "— اليوم فارغ الآن" : "بدءاً من الغد"}`);
  afterActiveChanged();
}

// ----- create / save-today / delete -----

function readNewName() {
  const inp = document.getElementById("pmNewName");
  const name = inp.value.trim();
  if (!name) { showToast("اكتب اسماً للبرنامج أولاً"); inp.focus(); return null; }
  return name;
}

export function createProgramFromForm() {
  const name = readNewName();
  if (name === null) return;
  const from = document.getElementById("pmCreateFrom").value || null;
  const p = createProfile(name, from);
  document.getElementById("pmNewName").value = "";
  renderProgramManager();
  showToast(`تم إنشاء «${p.name}» — عدّل قالبه الآن`);
  openProgramEdit(p.id);
}

export function saveTodayAsProgram() {
  const name = readNewName();
  if (name === null) return;
  const p = buildProfileFromDay(name, state, {
    program: getActiveProgram(),
    minsOf: t => getTaskMins(t.id),
    waterOf: t => getTaskWater(t),
    itemsOf: t => getTaskMealItems(t).filter(it => it.grams > 0)
  });
  document.getElementById("pmNewName").value = "";
  renderProgramManager();
  showToast(`💾 حُفظ يوم ${viewingDateStr} كقالب ثابت «${p.name}» (غير مفعّل)`);
}

export function deleteProgramById(id) {
  const p = getProfile(id);
  if (!p) return;
  const wasActive = getActiveProfileId() === id;
  const msg = wasActive
    ? `«${p.name}» هو البرنامج النشط. سيُحذف نهائياً وتبقى الأيام القادمة بدون برنامج حتى تفعّل برنامجاً آخر (اليوم الحالي يكمل بنسخته). متأكد؟`
    : `حذف البرنامج «${p.name}» نهائياً؟`;
  if (!confirm(msg)) return;
  pinToday();
  deleteProfile(id);
  showToast(wasActive ? "🗑️ حُذف البرنامج النشط — لا يوجد برنامج مفعّل" : "🗑️ تم حذف البرنامج");
  afterActiveChanged();
}

// ===================== master template editor =====================

export function openProgramEdit(id) {
  const p = getProfile(id);
  if (!p) return;
  editing.programDraft = deepClone(p);
  editing.programEditMode = "gym";
  renderProgramEditor();
  showModal("programEditModal");
}

function draftTasks() {
  return editing.programDraft.modes[editing.programEditMode].tasks;
}

function foodOptionsHtml(q) {
  const nq = normAr(q);
  const out = [];
  for (let i = 0; i < ALL_FOOD_ITEMS.length && out.length < 60; i++) {
    const f = ALL_FOOD_ITEMS[i];
    if (nq && !normAr(f.name).includes(nq)) continue;
    out.push(`<option value="${i}">${esc(f.name)} (${f.cal} سعرة)</option>`);
  }
  return out.join("");
}

export function renderProgramEditor() {
  const d = editing.programDraft;
  if (!d) return;
  const mode = editing.programEditMode;
  const m = d.modes[mode];
  const tasks = m.tasks.map((t, i) => {
    const isMeal = Array.isArray(t.defaultItems);
    const items = isMeal ? t.defaultItems.map((it, j) => `
      <div class="pe-item">
        <span>${esc(it.name)}</span>
        <input type="number" min="0" inputmode="decimal" value="${it.grams}" data-input="program-edit-grams" data-index="${i}" data-item="${j}" />
        <span>غ</span>
        <button class="del-btn" data-action="program-edit-del-item" data-index="${i}" data-item="${j}">×</button>
      </div>`).join("") : "";
    const adder = isMeal ? `
      <div class="pe-add">
        <input type="search" placeholder="🔍 صنف" data-input="program-edit-food-search" data-index="${i}" />
        <select id="pe-food-${i}">${foodOptionsHtml("")}</select>
        <input type="number" min="0" inputmode="decimal" placeholder="غرام" id="pe-grams-${i}" />
        <button class="btn btn-blue" data-action="program-edit-add-item" data-index="${i}">+ صنف</button>
      </div>` : "";
    return `
    <div class="pe-task${isMeal ? " pe-meal" : ""}">
      <div class="pe-task-head">
        <input type="time" value="${minsToHHMM(t.baseMins)}" data-input="program-edit-task" data-index="${i}" data-field="time" />
        <input type="text" value="${esc(t.text)}" data-input="program-edit-task" data-index="${i}" data-field="text" />
        <button class="del-btn" data-action="program-edit-del-task" data-index="${i}" title="حذف المهمة">×</button>
      </div>
      <div class="pe-task-water">💧 <input type="number" min="0" step="50" value="${t.water || 0}" data-input="program-edit-task" data-index="${i}" data-field="water" /> مل</div>
      ${items}${adder}
    </div>`;
  }).join("");

  document.getElementById("programEditBody").innerHTML = `
    <label class="pe-label">اسم البرنامج</label>
    <input type="text" maxlength="40" value="${esc(d.name)}" data-input="program-edit-name" />
    <div class="mode-pills" style="margin:10px 0;">
      ${MODE_KEYS.map(k => `<button class="mode-btn${k === mode ? " active" : ""}" data-action="program-edit-mode" data-mode="${k}">${MODE_LABELS[k]}</button>`).join("")}
    </div>
    <div class="pe-goals">
      <div><label class="pe-label">ماء (مل)</label><input type="number" min="0" value="${m.waterGoal}" data-input="program-edit-goal" data-goal="waterGoal" /></div>
      <div><label class="pe-label">سعرات</label><input type="number" min="0" value="${m.calGoal}" data-input="program-edit-goal" data-goal="calGoal" /></div>
      <div><label class="pe-label">بروتين (غ)</label><input type="number" min="0" value="${m.proGoal}" data-input="program-edit-goal" data-goal="proGoal" /></div>
    </div>
    ${tasks || `<div class="pm-empty">لا توجد مهام في هذا النمط بعد.</div>`}
    <div class="btn-grid-2" style="margin-top:8px;">
      <button class="btn btn-blue" data-action="program-edit-add-task">+ مهمة / دواء / تنبيه</button>
      <button class="btn btn-green" data-action="program-edit-add-meal">+ وجبة</button>
    </div>`;
}

// ----- editor handlers (draft only; the stored template changes on save) -----

export function programEditSetMode(mode) {
  if (!editing.programDraft || !MODE_KEYS.includes(mode)) return;
  editing.programEditMode = mode;
  renderProgramEditor();
}

export function programEditName(v) {
  if (editing.programDraft) editing.programDraft.name = v;
}

export function programEditGoal(goal, v) {
  const n = parseFloat(v);
  if (editing.programDraft && n >= 0) editing.programDraft.modes[editing.programEditMode][goal] = n;
}

export function programEditTaskField(i, field, v) {
  const t = editing.programDraft && draftTasks()[i];
  if (!t) return;
  if (field === "time" && /^\d{1,2}:\d{2}$/.test(v)) t.baseMins = hhmmToMins(v);
  else if (field === "text") t.text = v;
  else if (field === "water") t.water = Math.max(0, parseInt(v) || 0);
}

export function programEditGrams(i, j, v) {
  const t = editing.programDraft && draftTasks()[i];
  if (t && t.defaultItems && t.defaultItems[j]) t.defaultItems[j].grams = Math.max(0, parseFloat(v) || 0);
}

export function programEditFoodSearch(i, q) {
  const sel = document.getElementById("pe-food-" + i);
  if (sel) sel.innerHTML = foodOptionsHtml(q);
}

export function programEditAddItem(i) {
  const t = editing.programDraft && draftTasks()[i];
  if (!t || !t.defaultItems) return;
  const sel = document.getElementById("pe-food-" + i);
  const gramsEl = document.getElementById("pe-grams-" + i);
  const f = sel && sel.value !== "" ? ALL_FOOD_ITEMS[parseInt(sel.value)] : null;
  if (!f) { showToast("ما في صنف بهالاسم، جرّب كلمة تانية"); return; }
  const grams = parseFloat(gramsEl.value);
  if (!(grams > 0)) { showToast("أدخل الوزن بالغرام أولاً"); gramsEl.focus(); return; }
  t.defaultItems.push(makeMealItem(f, grams));
  renderProgramEditor();
}

export function programEditDelItem(i, j) {
  const t = editing.programDraft && draftTasks()[i];
  if (t && t.defaultItems) { t.defaultItems.splice(j, 1); renderProgramEditor(); }
}

export function programEditDelTask(i) {
  if (!editing.programDraft) return;
  draftTasks().splice(i, 1);
  renderProgramEditor();
}

function newTaskId() {
  return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

export function programEditAddTask(isMeal) {
  if (!editing.programDraft) return;
  const t = isMeal
    ? { id: newTaskId(), baseMins: 12 * 60, text: "🍽️ وجبة جديدة", eatMins: 15, lock: 45, defaultItems: [] }
    : { id: newTaskId(), baseMins: 12 * 60, text: "⏰ مهمة جديدة", water: 0 };
  draftTasks().push(t);
  renderProgramEditor();
}

export function saveProgramEdit() {
  const d = editing.programDraft;
  if (!d) return;
  if (!d.name.trim()) { showToast("اكتب اسماً للبرنامج"); return; }
  MODE_KEYS.forEach(k => {
    const m = d.modes[k];
    m.tasks.forEach(t => {
      t.text = String(t.text || "").trim() || "مهمة";
      if (!(t.water > 0)) delete t.water;
      if (t.defaultItems) t.defaultItems = t.defaultItems.filter(it => it.grams > 0);
    });
    m.tasks = m.tasks.map((t, i) => ({ t, i })).sort((a, b) => a.t.baseMins - b.t.baseMins || a.i - b.i).map(x => x.t);
  });
  const wasActive = getActiveProfileId() === d.id;
  pinToday(); // today keeps the version it already runs on
  if (!saveProfile(d)) { showToast("⚠️ تعذّر حفظ القالب"); return; }
  const id = d.id;
  closeProgramEditor();
  renderProgramManager();
  if (wasActive) requestApply("edit", id);
  else showToast("✅ تم حفظ القالب الأساسي");
}
