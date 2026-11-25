// Session-level actions: full render, day rollover, date nav, mode switch, tabs, backup restore, reset.
import { STORAGE_PREFIX } from "../config.js";
import { PROGRAMS } from "../data/programs.js";
import { getActiveProgram, getTaskWater } from "../logic/schedule.js";
import { syncScheduleToCloud } from "../logic/telegram.js";
import { currentTodayStr, getTodayDateStr, isViewingToday, reloadState, saveState, setCurrentToday, setViewingDate, state, viewingDateStr } from "../state.js";
import { renderDateHeader, renderHeaderModes } from "./render-header.js";
import { renderMeals, renderOffsets } from "./render-meals.js";
import { renderPrayers } from "./render-prayers.js";
import { renderWeeklyStats } from "./render-stats.js";
import { currentNextTaskId, renderNextStationCard, renderTasks } from "./render-tasks.js";
import { renderWater, updateLockUI } from "./render-water.js";
import { renderWeight } from "./render-weight.js";
import { showToast } from "./toast.js";

export function renderAll(shouldAutoScroll = false) {
  renderDateHeader();
  renderHeaderModes();
  renderWater();
  renderTasks();
  renderNextStationCard();
  renderMeals();
  renderPrayers();
  renderWeight();
  renderWeeklyStats();
  renderOffsets();
  updateLockUI();

  if (shouldAutoScroll && isViewingToday() && currentNextTaskId) {
    setTimeout(() => {
      const el = document.getElementById("task-row-" + currentNextTaskId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
  }
}

export function checkAutoDayRollover() {
  const realToday = getTodayDateStr();
  if (realToday !== currentTodayStr) {
    const wasOnYesterday = viewingDateStr === currentTodayStr;
    setCurrentToday(realToday);
    if (wasOnYesterday) {
      setViewingDate(realToday);
      renderAll(true);
      syncScheduleToCloud();
      showToast("🌅 بدأ يوم جديد — تم تحديث الجدول تلقائياً");
    } else {
      renderDateHeader();
    }
  }
}

export function changeViewingDate(deltaDays) {
  const [y, m, d] = viewingDateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + deltaDays);
  const nextStr = dt.toLocaleDateString("en-CA");
  if (nextStr > currentTodayStr) return;
  setViewingDate(nextStr);
  renderAll(false);
}

export function jumpToToday() {
  setViewingDate(currentTodayStr);
  renderAll(true);
}

export function switchDayMode(mode) {
  if (state.dayMode === mode) return;
  if (Object.values(state.tasks).some(Boolean) &&
    !confirm("التبديل رح يصفّر المهام المنجزة والوجبات المرتبطة فيها. متأكد؟")) return;
  getActiveProgram().tasks.forEach(t => {
    if (state.tasks[t.id]) state.water = Math.max(0, state.water - getTaskWater(t));
  });
  state.tasks = {}; state.skipped = {}; state.completedAt = {};
  state.meals = state.meals.filter(m => !m.taskId);
  state.eatEnd = null; state.lockEnd = null; state.lockOwnerTaskId = null;
  state.dayMode = mode;
  state.taskTimes = {};
  state.manualTimeSet = {};
  state.snoozeUntil = {};
  state.alarmFired = {};
  saveState();
  renderAll(false);
  syncScheduleToCloud();
  showToast(`تم التبديل إلى: ${PROGRAMS[mode].label}`);
}

export function switchTab(tab, btn) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(el => el.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  btn.classList.add("active");
  if (tab === "tools") {
    renderWeight();
    renderWeeklyStats();
  }
}

export function resetToday() {
  if (confirm("هل تريد تصفير عدّاد الماء والوجبات والصلوات لهذا اليوم؟")) {
    localStorage.removeItem(STORAGE_PREFIX + viewingDateStr);
    reloadState();
    renderAll(false);
    syncScheduleToCloud();
    showToast("تم تصفير بيانات اليوم");
  }
}

export function importBackupJSON(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    try {
      const data = JSON.parse(evt.target.result);
      let count = 0;
      Object.keys(data).forEach(k => {
        if (k.startsWith("aburaslan_") && k !== "aburaslan_tg_cfg") {
          localStorage.setItem(k, data[k]);
          count++;
        }
      });
      reloadState();
      renderAll(false);
      showToast(`✅ تمت استعادة ${count} سجل بنجاح`);
    } catch (err) {
      showToast("⚠️ ملف النسخة الاحتياطية غير صالح");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
}
