// 7-day adherence stats.
import { STORAGE_PREFIX } from "../config.js";
import { resolveProgramForDay } from "../logic/programs.js";
import { getWaterGoal } from "../logic/storage.js";
import { getLocalDateString } from "../state.js";

export function renderWeeklyStats() {
  const box = document.getElementById("weeklyStatsBox");
  if (!box) return;

  const last7Days = [];
  let totalWaterPct = 0, totalTaskPct = 0, calTargetDays = 0, activeDays = 0;

  for (let i = 6; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const dStr = getLocalDateString(dt);
    const raw = localStorage.getItem(STORAGE_PREFIX + dStr);
    if (!raw) {
      last7Days.push({ day: dStr.slice(5), cal: 0, water: 0, task: 0 });
      continue;
    }

    try {
      const s = JSON.parse(raw);
      const prog = resolveProgramForDay(s);
      const doneTasksCount = prog.tasks.filter(t => s.tasks && s.tasks[t.id]).length;
      const skippedN = prog.tasks.filter(t => s.skipped && s.skipped[t.id]).length;
      const denom = prog.tasks.length - skippedN;
      const taskPct = denom > 0 ? Math.round((doneTasksCount / denom) * 100) : 0;
      const waterPct = Math.min(100, Math.round((s.water / getWaterGoal(s.dayMode, prog)) * 100));
      const dayCal = (s.meals || []).reduce((a, b) => a + b.cal, 0);

      last7Days.push({ day: dStr.slice(5), cal: dayCal, water: waterPct, task: taskPct });

      if (dayCal > 0 || s.water > 0 || doneTasksCount > 0) {
        activeDays++;
        totalWaterPct += waterPct;
        totalTaskPct += taskPct;
        if (dayCal > 0 && dayCal <= prog.calGoal + 100) calTargetDays++;
      }
    } catch (e) { last7Days.push({ day: dStr.slice(5), cal: 0, water: 0, task: 0 }); }
  }

  // تحليل الأنماط
  let patternText = "ممتاز، استمر بالالتزام!";
  if (activeDays > 0) {
      if (totalTaskPct / activeDays < 60) patternText = "لاحظت انخفاض بإنجاز المهام، حاول التركيز على المحطات الأساسية.";
      else if (totalWaterPct / activeDays < 70) patternText = "شرب الماء يحتاج تحسين، جرب تزيد رشفاتك.";
  }

  const W = 320, H = 100, padX = 30, padY = 20;
  const getX = (i) => padX + (i / 6) * (W - padX * 2);
  const getY = (val) => H - padY - (val / 100) * (H - padY * 2);

  let points = "";
  last7Days.forEach((d, i) => points += `${getX(i)},${getY(d.task)} `);

  box.innerHTML = `
    <div class="macro-grid" style="margin-bottom:12px;">
      <div class="macro-box"><div class="macro-val" style="color:var(--blue);">${activeDays ? Math.round(totalWaterPct/activeDays) : 0}%</div><div class="macro-lbl">متوسط الماء</div></div>
      <div class="macro-box"><div class="macro-val" style="color:var(--green);">${calTargetDays}/${activeDays || 1}</div><div class="macro-lbl">أيام ضمن السعرات</div></div>
      <div class="macro-box"><div class="macro-val" style="color:var(--amber);">${activeDays ? Math.round(totalTaskPct/activeDays) : 0}%</div><div class="macro-lbl">إنجاز المهام</div></div>
    </div>
    <div class="chart-wrap" style="padding:10px 5px;">
       <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:80px;">
         <polyline fill="none" stroke="#f59e0b" stroke-width="3" points="${points.trim()}" />
         ${last7Days.map((d, i) => `<text x="${getX(i)}" y="${H-5}" fill="var(--muted)" font-size="8" text-anchor="middle">${d.day}</text>`).join('')}
       </svg>
    </div>
    <div style="font-size:12px; color:var(--muted); margin-top:8px; text-align:center;">${patternText}</div>
  `;
}
