// Date header + day-mode buttons.
import { getActiveProgram } from "../logic/schedule.js";
import { getActiveProfile, getProfile, modeKeys, modeName } from "../logic/programs.js";
import { getWaterGoal } from "../logic/storage.js";
import { isViewingToday, state, viewingDateStr } from "../state.js";
import { esc } from "./dom.js";

export function renderDateHeader() {
  const [y, m, d] = viewingDateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const formatted = dt.toLocaleDateString("ar-EG", { weekday: "long", month: "short", day: "numeric" });
  const label = isViewingToday() ? `اليوم • ${formatted}` : `سجل سابق • ${formatted}`;
  document.getElementById("dateDisplay").textContent = label;
  document.getElementById("todayJumpBtn").style.display = isViewingToday() ? "none" : "inline-block";
  document.getElementById("nextDayBtn").disabled = isViewingToday();
}

/** Profile whose modes the switch shows: the one today's day runs on, else the active program. */
function modeSwitchProfile() {
  const id = state.programSnap && state.programSnap.profileId;
  return (id && getProfile(id)) || getActiveProfile();
}

export function renderHeaderModes() {
  const box = document.getElementById("modePills");
  const p = modeSwitchProfile();
  if (box) {
    const keys = p ? modeKeys(p) : [];
    box.style.display = keys.length ? "grid" : "none";
    box.style.gridTemplateColumns = keys.length > 3 ? "repeat(auto-fit, minmax(84px, 1fr))" : `repeat(${Math.max(keys.length, 1)}, 1fr)`;
    box.innerHTML = keys.map(k =>
      `<button id="mode-${esc(k)}" class="mode-btn${state.dayMode === k ? " active" : ""}" data-action="switch-day-mode" data-mode="${esc(k)}">${esc(modeName(p, k))}</button>`
    ).join("");
  }
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
