// Date header + day-mode buttons.
import { getActiveProgram } from "../logic/schedule.js";
import { getActiveProfile } from "../logic/programs.js";
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
  renderProgramBadge();
  document.getElementById("activeTargetBadge").textContent = `${getWaterGoal().toLocaleString("en-US")} مل`;
}

/** Top-bar badge: name of the active program (or "none"); opens the program manager. */
export function renderProgramBadge() {
  const el = document.getElementById("programBadge");
  if (!el) return;
  const p = getActiveProfile();
  el.textContent = p ? `📋 ${p.name}` : "📋 بدون برنامج مفعّل";
  el.className = "strip-btn program-badge" + (p ? " active" : "");
}
