// Task list, next-station card, schedule shifting, task toggling.
import { isAlarmActiveForTask, stopRepeatingAlarm, unlockAudio } from "../logic/alarms.js";
import { calcItemsMacros } from "../logic/nutrition.js";
import { formatItemsSummary, formatMinsArabic, getActiveProgram, getNowMins, getTaskMealItems, getTaskMins, getTaskWater, hhmmToMins } from "../logic/schedule.js";
import { syncScheduleToCloud } from "../logic/telegram.js";
import { isViewingToday, saveState, state } from "../state.js";
import { closeTimeEdit, closeWaterEdit, editing } from "./modals.js";
import { renderMeals } from "./render-meals.js";
import { renderWeeklyStats } from "./render-stats.js";
import { applySmartWaterLock, renderWater, updateLockUI } from "./render-water.js";
import { showToast } from "./toast.js";

export let currentNextTaskId = null;

export function renderNextStationCard() {
  const card = document.getElementById("nextStationCard");
  if (!isViewingToday()) {
    card.style.display = "none";
    return;
  }
  const tasks = getActiveProgram().tasks;
  const nextTask = tasks.find(t => !state.tasks[t.id] && !(state.skipped && state.skipped[t.id]))
  if (!nextTask) {
    currentNextTaskId = null;
    card.style.display = "block";
    document.getElementById("nextStationBadge").textContent = "🎉 اكتمل اليوم";
    document.getElementById("nextStationCountdown").textContent = "100%";
    document.getElementById("nextStationTitle").textContent = "أنجزت جميع محطات اليوم بنجاح!";
    document.getElementById("nextStationSub").textContent = "تقدر تنسخ تقريرك اليومي من تبويب الوزن والتقرير.";
    document.getElementById("nextStationDoneBtn").style.display = "none";
    document.getElementById("nextStationScrollBtn").style.display = "none";
    return;
  }

  currentNextTaskId = nextTask.id;
  card.style.display = "block";
  document.getElementById("nextStationDoneBtn").style.display = "inline-flex";
  document.getElementById("nextStationScrollBtn").style.display = "inline-flex";

  const schedMins = getTaskMins(nextTask.id);
  const nowMins = getNowMins();
  const diff = schedMins - nowMins;
  let countdownTxt = formatMinsArabic(schedMins);
  if (diff > 0) {
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    countdownTxt = `${formatMinsArabic(schedMins)} (بعد ${hrs > 0 ? hrs + " س و " : ""}${mins} د)`;
  } else if (diff === 0) {
    countdownTxt = `${formatMinsArabic(schedMins)} (الآن!)`;
  } else {
    countdownTxt = `${formatMinsArabic(schedMins)} (متأخر ${Math.abs(diff)} د)`;
  }

  const w = getTaskWater(nextTask);
  let subTxt = nextTask.sub || "";
  if (nextTask.defaultItems) {
    const items = getTaskMealItems(nextTask);
    const totals = calcItemsMacros(items);
    subTxt = `${formatItemsSummary(items)} (${totals.cal} سعرة)`;
  } else if (w > 0) {
    subTxt = `الكمية المحددة: ${w} مل ماء` + (subTxt ? ` • ${subTxt}` : "");
  }

  document.getElementById("nextStationBadge").textContent = "⚡ المحطة القادمة";
  document.getElementById("nextStationCountdown").textContent = countdownTxt;
  document.getElementById("nextStationTitle").textContent = nextTask.text;
  document.getElementById("nextStationSub").textContent = subTxt;
}

export function completeNextStation() {
  if (currentNextTaskId) {
    toggleTask(currentNextTaskId, true);
  }
}

export function scrollToNextStation() {
  if (!currentNextTaskId) return;
  const el = document.getElementById("task-row-" + currentNextTaskId);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("highlight-pulse");
    setTimeout(() => el.classList.remove("highlight-pulse"), 1800);
  }
}

export function shiftTaskAndFollowing(taskId, newMins, isManual = false) {
  const tasks = getActiveProgram().tasks;
  const idx = tasks.findIndex(t => t.id === taskId);
  if (idx === -1) return;
  const oldMins = getTaskMins(taskId);
  const delta = newMins - oldMins;
  state.taskTimes[taskId] = newMins;
  if (isManual) state.manualTimeSet[taskId] = true;

  if (delta !== 0) {
    for (let j = idx + 1; j < tasks.length; j++) {
      const nextId = tasks[j].id;
      if (state.tasks[nextId]) continue;
      const shifted = getTaskMins(nextId) + delta;
      state.taskTimes[nextId] = shifted;
      if (shifted > getNowMins()) {
        state.alarmFired[nextId] = false;
      }
    }
  }
  saveState();
  renderTasks();
  renderNextStationCard();
  syncScheduleToCloud();
  if (delta > 0) showToast(`تم تزحيف باقي البرنامج +${delta} دقيقة`);
  else if (delta < 0) showToast(`تم تقديم باقي البرنامج ${Math.abs(delta)} دقيقة`);
}

export function resetScheduleTimes() {
  if (confirm("إرجاع جميع مواعيد اليوم للساعات الأصلية؟")) {
    state.taskTimes = {};
    state.manualTimeSet = {};
    state.snoozeUntil = {};
    state.alarmFired = {};
    saveState();
    renderTasks();
    renderNextStationCard();
    syncScheduleToCloud();
    showToast("تمت إعادة الساعات الأصلية");
  }
}

export function saveEditedTime() {
  if (!editing.timeTaskId) return;
  const val = document.getElementById("editTimeInput").value;
  if (val) {
    const newMins = hhmmToMins(val);
    state.manualTimeSet[editing.timeTaskId] = true;
    shiftTaskAndFollowing(editing.timeTaskId, newMins, true);
    syncScheduleToCloud(false, true);

    const t = getActiveProgram().tasks.find(x => x.id === editing.timeTaskId);
    if (t && t.lock && state.tasks[editing.timeTaskId]) {
      state.lockOwnerTaskId = editing.timeTaskId;
      applySmartWaterLock(editing.timeTaskId, t.eatMins || 0, t.lock, true);
    }
    showToast(`تم تثبيت الوقت على ${formatMinsArabic(newMins)}`);
  }
  closeTimeEdit();
}

export function saveWaterEdit() {
  if (!editing.waterTaskId) return;
  const t = getActiveProgram().tasks.find(x => x.id === editing.waterTaskId);
  const newVal = Math.max(0, parseInt(document.getElementById("waterEditInput").value) || 0);
  const oldVal = getTaskWater(t);
  const key = `${state.dayMode}_${editing.waterTaskId}`;
  state.customWater[key] = newVal;

  if (state.tasks[editing.waterTaskId]) {
    state.water = Math.max(0, state.water + (newVal - oldVal));
    renderWater();
  }

  saveState();
  renderTasks();
  renderNextStationCard();
  closeWaterEdit();
  showToast(`تم تحديث كمية الماء إلى ${newVal} مل`);
}

export function toggleTask(id, forceDone = null) {
  unlockAudio();
  const newState = forceDone !== null ? forceDone : !state.tasks[id];
  state.tasks[id] = newState;
  if (newState && state.skipped) delete state.skipped[id];
  if (newState) delete state.snoozeUntil[id];

  const taskObj = getActiveProgram().tasks.find(t => t.id === id);
  const taskWater = getTaskWater(taskObj);
  let toastParts = [];

  if (newState) {
    const nowMins = getNowMins();
    state.completedAt[id] = formatMinsArabic(nowMins);

    if (isViewingToday() && !state.manualTimeSet[id]) {
      shiftTaskAndFollowing(id, nowMins, false);
    }

    if (taskObj && taskObj.defaultItems) {
      const items = getTaskMealItems(taskObj);
      const totals = calcItemsMacros(items);
      const mealLabel = `${taskObj.text.replace(/^[^\s]+\s/, "")} [${formatItemsSummary(items)}]`;
      const exists = state.meals.some(m => m.taskId === id);
      if (!exists) {
        state.meals.push(Object.assign({ taskId: id, name: mealLabel }, totals));
        toastParts.push(`+${totals.cal} سعرة`);
      }
      renderMeals();
    }

    if (taskWater > 0) {
      state.water = Math.max(0, state.water + taskWater);
      toastParts.push(`+${taskWater} مل مي`);
      renderWater();
    }

    if (isViewingToday() && taskObj && taskObj.lock) {
      state.lockOwnerTaskId = id;
      const lockMsg = applySmartWaterLock(id, taskObj.eatMins || 0, taskObj.lock, !!state.manualTimeSet[id]);
      toastParts.push(lockMsg);
    }

    if (toastParts.length > 0) {
      showToast(`تم (${toastParts.join(" | ")})`);
    }
  } else {
    delete state.completedAt[id];
    if (taskObj && taskObj.defaultItems) {
      state.meals = state.meals.filter(m => m.taskId !== id);
      renderMeals();
    }
    if (taskWater > 0) {
      state.water = Math.max(0, state.water - taskWater);
      renderWater();
    }
    if (taskObj && taskObj.lock && (!state.lockOwnerTaskId || state.lockOwnerTaskId === id)) {
      state.eatEnd = null;
      state.lockEnd = null;
      state.lockOwnerTaskId = null;
      updateLockUI();
      toastParts.push("🔓 تم إلغاء قفل المي");
    }
    if (toastParts.length > 0) {
      showToast(toastParts.join(" | "));
    }
  }

  saveState();
  renderTasks();
  renderNextStationCard();
  renderWeeklyStats();
  syncScheduleToCloud();
}

export function toggleSkip(id) {
  unlockAudio();
  if (!state.skipped) state.skipped = {};
  if (state.skipped[id]) {
    delete state.skipped[id];
    showToast("↩️ رجعت المهمة للجدول");
  } else {
    if (state.tasks[id]) toggleTask(id, false);   // يلغي أثر الإنجاز أول
    state.skipped[id] = true;
    delete state.snoozeUntil[id];
    if (isAlarmActiveForTask(id)) stopRepeatingAlarm();
    showToast("✕ تم تخطي المهمة اليوم (اضغط ✕ مرة تانية للتراجع)");
  }
  saveState();
  renderTasks();
  renderNextStationCard();
  renderWeeklyStats();
  syncScheduleToCloud();
}

export function renderTasks() {
  const list = document.getElementById("tasksList");
  list.innerHTML = "";
  const tasks = getActiveProgram().tasks;
  let doneCount = 0; let skippedCount = 0;

  tasks.forEach(t => {
    const isDone = !!state.tasks[t.id];
    const isSnoozed = !!state.snoozeUntil[t.id];
    if (isDone) doneCount++;
    const isSkipped = !!(state.skipped && state.skipped[t.id]);
    if (isSkipped) skippedCount++;
    const schedMins = getTaskMins(t.id);
    const timeLabel = formatMinsArabic(schedMins);
    const w = getTaskWater(t);

    let waterBtnHtml = w > 0 ? `<button class="edit-water-btn" data-action="open-water-edit" data-id="${t.id}">💧 ${w} مل ✏️</button>` : "";
    let lockBadgeHtml = "";
    if (t.lock) {
      lockBadgeHtml = t.eatMins
        ? `<span class="pill-tag pill-lock">🍽️ ${t.eatMins} د أكل + 🔒 قفل ${t.lock} د</span>`
        : `<span class="pill-tag pill-lock">🔒 قفل مي ${t.lock} د</span>`;
    }

    let bodyHtml = "";
    if (t.defaultItems) {
      const items = getTaskMealItems(t);
      const totals = calcItemsMacros(items);
      bodyHtml = `
      <span class="task-sub">${formatItemsSummary(items)}</span>
      <div class="task-badges">
        <span class="pill-tag pill-cal">${totals.cal} سعرة • ${totals.pro}غ بروتين</span>
        ${waterBtnHtml}
        ${lockBadgeHtml}
        <button class="edit-meal-btn" data-action="open-meal-edit" data-id="${t.id}">✏️ تعديل الوجبة</button>
      </div>
    `;
    } else {
      bodyHtml = `
      ${t.sub ? `<span class="task-sub">${t.sub}</span>` : ""}
      ${(waterBtnHtml || lockBadgeHtml) ? `<div class="task-badges">${waterBtnHtml}${lockBadgeHtml}</div>` : ""}
    `;
    }

    const div = document.createElement("div");
    div.id = "task-row-" + t.id;
    div.className = "task-item" + (t.defaultItems ? " meal-task" : "") + (isDone ? " done" : "") + (isSkipped ? " skipped" : "");
    div.innerHTML = `
    <div class="checks-col">
      <div class="checkbox" data-action="toggle-task" data-id="${t.id}">${isDone ? "✓" : ""}</div>
      <div class="skipbox" data-action="toggle-skip" data-id="${t.id}" title="تخطي المهمة اليوم">✕</div>
    </div>
    <div class="time-col">
      <span class="task-time ${isSnoozed ? "snoozed" : ""}" data-action="open-time-edit" data-id="${t.id}" title="اضغط لتعديل الوقت">${timeLabel}${isSnoozed ? " 💤" : ""}</span>
    </div>
    <div class="task-body">
      <span class="task-text" data-action="toggle-task" data-id="${t.id}">${t.text}</span>
      ${bodyHtml}
    </div>
  `;
    list.appendChild(div);
  });

  document.getElementById("tasksProgress").textContent =
    `${doneCount}/${tasks.length - skippedCount}` + (skippedCount ? ` • ${skippedCount} متخطاة` : "");
}
