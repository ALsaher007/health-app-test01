// Water counter, goals and the smart water lock.
import { startRepeatingAlarm, unlockAudio } from "../logic/alarms.js";
import { formatMinsArabic, getTaskMins } from "../logic/schedule.js";
import { getGoals, getWaterGoal } from "../logic/storage.js";
import { isViewingToday, saveState, state } from "../state.js";
import { closeWaterGoalEdit } from "./modals.js";
import { renderHeaderModes } from "./render-header.js";
import { renderWeeklyStats } from "./render-stats.js";
import { showToast } from "./toast.js";

export function setQuickWaterVal(val) {
  document.getElementById("waterEditInput").value = val;
}

export function addWater(ml) {
  unlockAudio();
  state.water = Math.max(0, state.water + ml);
  saveState();
  renderWater();
  renderWeeklyStats();
}

export function saveWaterGoal() {
  const v = parseInt(document.getElementById("waterGoalInput").value);
  if (!(v >= 500 && v <= 10000)) { showToast("اكتب رقم بين 500 و10000 مل"); return; }
  const g = getGoals();
  g[state.dayMode] = v;
  localStorage.setItem("aburaslan_goals", JSON.stringify(g));
  renderWater(); renderHeaderModes(); renderWeeklyStats();
  closeWaterGoalEdit();
  showToast(`تم تعيين الهدف على ${v.toLocaleString("en-US")} مل`);
}

export function resetWaterGoal() {
  const g = getGoals();
  delete g[state.dayMode];
  localStorage.setItem("aburaslan_goals", JSON.stringify(g));
  renderWater(); renderHeaderModes(); renderWeeklyStats();
  closeWaterGoalEdit();
  showToast("رجع الهدف الافتراضي");
}

export function renderWater() {
  const goal = getWaterGoal();
  document.getElementById("waterGoalLabel").textContent = goal.toLocaleString("en-US");
  document.getElementById("waterVal").textContent = state.water.toLocaleString("en-US");
  document.getElementById("waterRem").textContent = Math.max(0, goal - state.water).toLocaleString("en-US");
  const pct = Math.min(100, (state.water / goal) * 100);
  document.getElementById("waterBar").style.width = pct + "%";
}

export function applySmartWaterLock(taskId, eatMins, lockMins, useStoredScheduleTime) {
  const now = new Date();
  const eatDurationMs = (eatMins || 0) * 60 * 1000;
  const lockDurationMs = lockMins * 60 * 1000;

  let baseStartMs = now.getTime();
  if (useStoredScheduleTime) {
    const schedMins = getTaskMins(taskId);
    const schedMs = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Math.floor(schedMins / 60), schedMins % 60, 0).getTime();
    if (now.getTime() >= schedMs) {
      baseStartMs = schedMs;
    }
  }

  const eatEndMs = baseStartMs + eatDurationMs;
  const lockEndMs = eatEndMs + lockDurationMs;

  if (now.getTime() >= lockEndMs) {
    state.eatEnd = null;
    state.lockEnd = null;
    state.lockOwnerTaskId = null;
    updateLockUI();
    return `✅ وقت قفل المي انتهى أصلاً`;
  }

  state.eatEnd = eatDurationMs > 0 ? eatEndMs : null;
  state.lockEnd = lockEndMs;
  updateLockUI();

  if (eatDurationMs > 0 && now.getTime() < eatEndMs) {
    return `🍽️ ${eatMins} د للأكل ثم قفل ${lockMins} د`;
  } else {
    const remMins = Math.ceil((lockEndMs - now.getTime()) / 60000);
    return `🔒 قفل مي ${remMins} د`;
  }
}

export function startWaterLock(lockMins, eatMins = 0) {
  unlockAudio();
  const now = Date.now();
  state.eatEnd = eatMins > 0 ? now + eatMins * 60 * 1000 : null;
  state.lockEnd = now + (eatMins + lockMins) * 60 * 1000;
  state.lockOwnerTaskId = null;
  saveState();
  updateLockUI();
  showToast(`🔒 تم تفعيل قفل الماء لمدة ${lockMins} دقيقة`);
}

export function cancelWaterLock() {
  state.eatEnd = null;
  state.lockEnd = null;
  state.lockOwnerTaskId = null;
  saveState();
  updateLockUI();
}

export function updateLockUI() {
  const box = document.getElementById("lockStatusBox");
  const txt = document.getElementById("lockStatusText");
  const timer = document.getElementById("lockTimerText");
  const sub = document.getElementById("lockTimerSub");
  const cancelBtn = document.getElementById("cancelLockBtn");

  if (!state.lockEnd) {
    box.className = "lock-box lock-open";
    txt.textContent = "✅ باب الماء مفتوح — اشرب رشفات هادية";
    timer.style.display = "none";
    sub.style.display = "none";
    cancelBtn.style.display = "none";
    return;
  }

  const now = Date.now();
  const totalDiff = state.lockEnd - now;
  if (totalDiff <= 0) {
    state.eatEnd = null;
    state.lockEnd = null;
    state.lockOwnerTaskId = null;
    saveState();
    updateLockUI();
    if (isViewingToday()) startRepeatingAlarm({ type: "lock" });
    return;
  }

  const endD = new Date(state.lockEnd);
  const endMins = endD.getHours() * 60 + endD.getMinutes();
  cancelBtn.style.display = "block";
  timer.style.display = "block";

  if (state.eatEnd && now < state.eatEnd) {
    const eatDiff = state.eatEnd - now;
    const m = Math.floor(eatDiff / 60000);
    const s = Math.floor((eatDiff % 60000) / 1000);
    const eatEndD = new Date(state.eatEnd);
    const eatEndMins = eatEndD.getHours() * 60 + eatEndD.getMinutes();

    box.className = "lock-box lock-eating";
    txt.textContent = "🍽️ فترة تناول الوجبة (يبدأ قفل المي بعد انتهائها)";
    timer.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    sub.style.display = "block";
    sub.textContent = `يبدأ القفل الساعة ${formatMinsArabic(eatEndMins)} ويفتح باب المي الساعة ${formatMinsArabic(endMins)}`;
    return;
  }

  const m = Math.floor(totalDiff / 60000);
  const s = Math.floor((totalDiff % 60000) / 1000);
  box.className = "lock-box lock-closed";
  txt.textContent = `🔒 ممنوع السوائل حالياً للهضم (يفتح الساعة ${formatMinsArabic(endMins)})`;
  timer.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  sub.style.display = "none";
}
