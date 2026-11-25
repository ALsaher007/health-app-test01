// Date header + day-mode buttons.
import { getActiveProgram } from "../logic/schedule.js";
import { getWaterGoal } from "../logic/storage.js";
import { isViewingToday, state, viewingDateStr } from "../state.js";

export function renderDateHeader() {
  const [y, m, d] = viewingDateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const formatted = dt.toLocaleDateString("ar-EG", { weekday: "long", month: "short", day: "numeric" });
  const label = isViewingToday() ? `اليوم • ${formatted}` : `سجل سابق • ${formatted}`;
  document.getElementById("dateDisplay").textContent = label;
  document.getElementById("todayJumpBtn").style.display = isViewingToday() ? "none" : "inline-block";
  document.getElementById("nextDayBtn").disabled = isViewingToday();
}

export function renderHeaderModes() {
  ["gym", "sat", "rest"].forEach(m => {
    document.getElementById("mode-" + m).classList.toggle("active", state.dayMode === m);
  });
  const prog = getActiveProgram();
  document.getElementById("activeTargetBadge").textContent = `${getWaterGoal().toLocaleString("en-US")} مل`;
}
