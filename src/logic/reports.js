// Exports: .ics schedule, JSON backup, daily text report.
import { FARD_PRAYERS, SUNNAH_CONFIRMED, SUNNAH_EXTRA } from "../data/prayers.js";
import { nutrLine, sumMeals } from "./nutrition.js";
import { formatMinsArabic, getActiveProgram, getNowMins, getTaskMins, getTaskWater } from "./schedule.js";
import { getTargetWeight, getWaterGoal } from "./storage.js";
import { currentTodayStr, isViewingToday, state, viewingDateStr } from "../state.js";
import { showToast } from "../ui/toast.js";

export function exportScheduleICS() {
  const [y, m, d] = viewingDateStr.split("-").map(Number);
  const datePrefix = `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
  const nowMins = isViewingToday() ? getNowMins() : 0;
  const tasks = getActiveProgram().tasks;

  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AbuRaslan//HealthProgram//AR",
    "CALSCALE:GREGORIAN"
  ];

  let count = 0;
  tasks.forEach(t => {
    if (state.tasks[t.id] || (state.skipped && state.skipped[t.id])) return;
    const mins = getTaskMins(t.id);
    if (mins < nowMins - 5) return;

    const norm = ((mins % 1440) + 1440) % 1440;
    const hh = String(Math.floor(norm / 60)).padStart(2, "0");
    const minStr = String(norm % 60).padStart(2, "0");
    const endNorm = norm + (t.eatMins || 10);
    const endHh = String(Math.floor(endNorm / 60) % 24).padStart(2, "0");
    const endMinStr = String(endNorm % 60).padStart(2, "0");

    const w = getTaskWater(t);
    const summary = `${t.text}${w > 0 ? ` (${w} مل مي)` : ""}`;

    icsLines.push(
      "BEGIN:VEVENT",
      `UID:${datePrefix}-${t.id}-${Date.now()}@aburaslan.fit`,
      `DTSTAMP:${datePrefix}T${hh}${minStr}00`,
      `DTSTART:${datePrefix}T${hh}${minStr}00`,
      `DTEND:${datePrefix}T${endHh}${endMinStr}00`,
      `SUMMARY:${summary}`,
      "BEGIN:VALARM",
      "TRIGGER:PT0M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${summary}`,
      "END:VALARM",
      "END:VEVENT"
    );
    count++;
  });

  if (count === 0) {
    showToast("لا توجد مهام قادمة متبقية للتصدير");
    return;
  }

  icsLines.push("END:VCALENDAR");
  const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `program_${datePrefix}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`تم تنزيل ${count} تنبيهات للتقويم`);
}

export function exportBackupJSON() {
  const dump = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("aburaslan_") && k !== "aburaslan_tg_cfg") {
      dump[k] = localStorage.getItem(k);
    }
  }
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aburaslan_health_backup_${currentTodayStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("📥 تم تصدير النسخة الاحتياطية بنجاح");
}

export function copyDailyReport() {
  const prog = getActiveProgram();
  const totalCal = state.meals.reduce((a, b) => a + b.cal, 0);
  const totalPro = Math.round(state.meals.reduce((a, b) => a + b.pro, 0));
  const doneTasks = prog.tasks.filter(t => state.tasks[t.id]).map(t => {
    const w = getTaskWater(t);
    return `${formatMinsArabic(getTaskMins(t.id))} — ${t.text}${w > 0 ? ` (${w} مل)` : ""}`;
  }).join("\n- ") || "لا يوجد";
  const fardDone = FARD_PRAYERS.filter(p => state.prayers[p.id]).length;
  const rawatibDone = [...SUNNAH_CONFIRMED, ...SUNNAH_EXTRA].filter(p => state.prayers[p.id]).length;
  const regularMeals = state.meals.filter(m => !m.offsetId);
  const mealsTxt = regularMeals.map(m => `- ${m.name} (${m.cal} سعرة | ${m.pro}غ بروتين)`).join("\n") || "- لا يوجد";
  const offsets = state.offsets || [];
  const offsetsTxt = offsets.map(o => `- ${o.name}: ${o.cal} سعرة (الساعة ${o.time})`).join("\n") || "- لا يوجد (التزام كامل)";

  const skippedTxt = prog.tasks.filter(t => state.skipped && state.skipped[t.id]).map(t => `- ${t.text}`).join("\n") || "- لا يوجد";
  const report = `تقرير يوم (${viewingDateStr}) — [${prog.label}]:
💧 الماء: ${state.water} / ${getWaterGoal().toLocaleString("en-US")} مل
🔥 السعرات: ${totalCal} / ${prog.calGoal.toLocaleString("en-US")} سعرة | البروتين: ${totalPro} / ${prog.proGoal} غ
🥗 القيم الغذائية: ${nutrLine(sumMeals(state.meals))}
⚖️ الوزن: ${state.weight ? state.weight + " كغ" : "غير مسجّل"} (الهدف: ${getTargetWeight()} كغ)
🕌 الصلاة: الفروض (${fardDone}/5) | السنن الرواتب والوتر (${rawatibDone}/12)
✅ المهام المنجزة وأوقاتها:\n- ${doneTasks}
🍽️ الوجبات والأوزان المحسوبة:\n${mealsTxt}
🚨 سجل الطوارئ (خارج البرنامج):\n${offsetsTxt}
⏭️ مهام متخطاة:\n${skippedTxt}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(report).then(() => showToast("تم نسخ التقرير! الصقه بالمحادثة"));
  } else {
    const ta = document.createElement("textarea");
    ta.value = report;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("تم نسخ التقرير! الصقه بالمحادثة");
  }
}
