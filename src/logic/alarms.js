// Alarms: audio chime, repeating alarm modal, system notifications, scheduled checks.
import { state, saveState, isViewingToday } from "../state.js";
import { showToast } from "../ui/toast.js";
import { getActiveProgram, getTaskMins, formatMinsArabic, getNowMins } from "./schedule.js";

let audioCtx = null;
let alarmInterval = null;
let activeAlarm = null;

// Things that still live in app.js (UI). Injected once at startup via
// configureAlarms() so this module never imports app.js (no cycles).
const hooks = {
  toggleTask: () => {},
  renderTasks: () => {}
};
export function configureAlarms(h) { Object.assign(hooks, h); }

/** True while the repeating alarm is ringing for this task (used by toggleTask). */
export function isAlarmActiveForTask(taskId) {
  return !!(activeAlarm && activeAlarm.type === "task" && activeAlarm.taskId === taskId);
}

export function unlockAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch (e) { }
}

export function enableAlertsAndAudio() {
  unlockAudio();
  playSingleChime();
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then(perm => {
      if (perm === "granted") {
        updatePermBanner();
        showToast("تم تفعيل الصوت والإشعارات");
      }
    });
  } else {
    updatePermBanner();
    showToast("تم تفعيل نغمة التنبيه");
  }
}

export function updatePermBanner() {
  const banner = document.getElementById("permBanner");
  if ("Notification" in window && Notification.permission === "granted") {
    banner.className = "strip-btn active";
    banner.textContent = "✅ الصوت مفعّل";
  }
}

export function playSingleChime() {
  try {
    unlockAudio();
    const notes = [587.33, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.22);
      gain.gain.setValueAtTime(0.001, audioCtx.currentTime + i * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + i * 0.22 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + i * 0.22 + 0.75);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.22);
      osc.stop(audioCtx.currentTime + i * 0.22 + 0.8);
    });
    if (navigator.vibrate) navigator.vibrate([300, 120, 300]);
  } catch (e) { }
}

export function startRepeatingAlarm(payload) {
  if (activeAlarm) return;
  activeAlarm = payload;
  const modal = document.getElementById("alarmModal");
  const taskActions = document.getElementById("alarmTaskActions");
  const lockActions = document.getElementById("alarmLockActions");

  if (payload.type === "task") {
    const t = getActiveProgram().tasks.find(x => x.id === payload.taskId);
    if (!t) { activeAlarm = null; return; }
    document.getElementById("alarmIcon").textContent = "⏰";
    document.getElementById("alarmTitle").textContent = `${formatMinsArabic(getTaskMins(t.id))} — حان الموعد`;
    document.getElementById("alarmDesc").textContent = t.text;
    taskActions.style.display = "grid";
    lockActions.style.display = "none";
    sendSystemNotification("⏰ موعد بالبرنامج الصحي", t.text);
  } else if (payload.type === "lock") {
    document.getElementById("alarmIcon").textContent = "💧";
    document.getElementById("alarmTitle").textContent = "انتهى وقت قفل الماء!";
    document.getElementById("alarmDesc").textContent = "اكتمل وقت الهضم — تقدر تشرب رشفات مي هلا.";
    taskActions.style.display = "none";
    lockActions.style.display = "block";
    sendSystemNotification("💧 باب الماء مفتوح الآن", "انتهى مؤقت قفل الماء وتقدر تشرب هلا.");
  }

  modal.style.display = "flex";
  playSingleChime();
  alarmInterval = setInterval(playSingleChime, 3500);
}

export function stopRepeatingAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  activeAlarm = null;
  document.getElementById("alarmModal").style.display = "none";
}

export async function sendSystemNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const reg = navigator.serviceWorker ? await navigator.serviceWorker.getRegistration() : null;
    if (reg) {
      await reg.showNotification(title, {
        body: body,
        tag: "aburaslan-fit-alarm",
        renotify: true,
        requireInteraction: true,
        vibrate: [300, 150, 300],
        icon: "bell-192.png",   // coloured icon shown inside the notification
        badge: "badge-96.png"   // white-on-transparent glyph for the Android status bar
      });
    } else {
      new Notification(title, { body: body });
    }
  } catch (e) { }
}

export function confirmAlarmDone() {
  if (!activeAlarm || activeAlarm.type !== "task") return;
  const taskId = activeAlarm.taskId;
  stopRepeatingAlarm();
  delete state.snoozeUntil[taskId];
  if (!state.tasks[taskId]) {
    hooks.toggleTask(taskId, true);
  }
}

export function snoozeAlarm5() {
  if (!activeAlarm || activeAlarm.type !== "task") return;
  const taskId = activeAlarm.taskId;
  stopRepeatingAlarm();
  state.snoozeUntil[taskId] = Date.now() + 5 * 60 * 1000;
  saveState();
  hooks.renderTasks();
  showToast("💤 غفوة 5 دقائق — رح يرجع يرن");
}

/**
 * Active program changed (activated / deactivated / edited and applied to today):
 * a ringing alarm and its snooze/fired flags belonged to the old task ids, so drop them.
 * Callers then re-render, refresh the water lock and push the schedule to Telegram.
 */
export function resyncAlarmsForProgramChange() {
  stopRepeatingAlarm();
  state.snoozeUntil = {};
  state.alarmFired = {};
}

export function dismissLockAlarm() {
  stopRepeatingAlarm();
}

export function checkScheduledAlarms() {
  if (!isViewingToday()) return;
  const now = Date.now();
  const nowMins = getNowMins();
  const tasks = getActiveProgram().tasks;

  for (const t of tasks) {
    if (state.tasks[t.id] || (state.skipped && state.skipped[t.id])) continue;

    if (state.snoozeUntil[t.id]) {
      if (now >= state.snoozeUntil[t.id]) {
        delete state.snoozeUntil[t.id];
        saveState();
        startRepeatingAlarm({ type: "task", taskId: t.id });
        return;
      }
      continue;
    }

    const schedMins = getTaskMins(t.id);
    if (!state.alarmFired[t.id] && nowMins >= schedMins && (nowMins - schedMins) <= 5) {
      state.alarmFired[t.id] = true;
      saveState();
      startRepeatingAlarm({ type: "task", taskId: t.id });
      return;
    }
  }
}
