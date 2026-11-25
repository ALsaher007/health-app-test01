// Prayers & rawatib.
import { FARD_PRAYERS, SUNNAH_CONFIRMED, SUNNAH_EXTRA } from "../data/prayers.js";
import { saveState, state } from "../state.js";

export function togglePrayer(id) {
  state.prayers[id] = !state.prayers[id];
  saveState();
  renderPrayers();
}

export function renderPrayerGroup(items, containerId, progressId) {
  const box = document.getElementById(containerId);
  box.innerHTML = "";
  let done = 0;
  items.forEach(item => {
    const isDone = !!state.prayers[item.id];
    if (isDone) done++;
    const div = document.createElement("div");
    div.className = "task-item prayer-task" + (isDone ? " done" : "");
    div.onclick = () => togglePrayer(item.id);
    div.innerHTML = `
    <div class="checkbox">${isDone ? "✓" : ""}</div>
    <div class="task-body"><span class="task-text">${item.text}</span></div>
  `;
    box.appendChild(div);
  });
  document.getElementById(progressId).textContent = `${done}/${items.length}`;
}

export function renderPrayers() {
  renderPrayerGroup(FARD_PRAYERS, "fardList", "fardProgress");
  renderPrayerGroup(SUNNAH_CONFIRMED, "sunnahConfirmedList", "sunnahConfirmedProgress");
  renderPrayerGroup(SUNNAH_EXTRA, "sunnahExtraList", "sunnahExtraProgress");
}
