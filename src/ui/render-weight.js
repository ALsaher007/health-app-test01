// Weight entry, target and SVG chart.
import { getTargetWeight, getWeightHistory } from "../logic/storage.js";
import { saveState, state, viewingDateStr } from "../state.js";
import { showToast } from "./toast.js";

export function saveWeightAndGoal() {
  const w = parseFloat(document.getElementById("weightInput").value);
  const target = parseFloat(document.getElementById("targetWeightInput").value);

  if (target > 0) {
    localStorage.setItem("aburaslan_target_weight", target);
  }

  if (w > 0) {
    state.weight = w;
    localStorage.setItem("aburaslan_last_weight", w);
    saveState();

    let hist = getWeightHistory();
    const idx = hist.findIndex(item => item.date === viewingDateStr);
    if (idx !== -1) hist[idx].weight = w;
    else hist.push({ date: viewingDateStr, weight: w });
    hist.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem("aburaslan_weight_history", JSON.stringify(hist));
  }

  renderWeight();
  showToast("تم حفظ الوزن والهدف");
}

export function renderWeight() {
  const target = getTargetWeight();
  document.getElementById("targetWeightInput").value = target;
  const latestW = state.weight || localStorage.getItem("aburaslan_last_weight") || "";
  if (latestW) {
    document.getElementById("weightInput").value = latestW;
    const diff = (parseFloat(latestW) - target).toFixed(1);
    const el = document.getElementById("weightDiffText");
    if (diff > 0) {
      el.innerHTML = `الوزن المسجّل: <strong>${latestW} كغ</strong> — باقي <strong style="color:var(--amber);">${diff} كغ</strong> للوصول للهدف (${target} كغ).`;
    } else {
      el.innerHTML = `الوزن المسجّل: <strong style="color:var(--green);">${latestW} كغ</strong> — حققت الهدف (${target} كغ)!`;
    }
  }
  renderWeightChart();
}

export function renderWeightChart() {
  const box = document.getElementById("weightChartBox");
  const hist = getWeightHistory().slice(-10);
  const target = getTargetWeight();

  if (hist.length === 0) {
    box.innerHTML = `<div style="font-size:11px; color:var(--muted); text-align:center; padding:16px 0;">سجّل وزنك الصباحي ليظهر الرسم البياني لتطورك هنا</div>`;
    return;
  }

  const W = 320, H = 135, padX = 28, padY = 22;
  const allVals = hist.map(h => h.weight).concat([target]);
  const minVal = Math.min(...allVals) - 0.5;
  const maxVal = Math.max(...allVals) + 0.5;
  const range = Math.max(0.5, maxVal - minVal);

  const getX = (i) => hist.length === 1 ? W / 2 : padX + (i / (hist.length - 1)) * (W - padX * 2);
  const getY = (val) => H - padY - ((val - minVal) / range) * (H - padY * 2);

  const targetY = getY(target);
  let pointsStr = "";
  let dotsHtml = "";

  hist.forEach((pt, i) => {
    const cx = getX(i);
    const cy = getY(pt.weight);
    pointsStr += `${cx},${cy} `;
    const shortDate = pt.date.slice(5);
    dotsHtml += `
    <circle cx="${cx}" cy="${cy}" r="4.5" fill="#10b981" stroke="#0b0f17" stroke-width="1.5" />
    <text x="${cx}" y="${cy - 8}" fill="#f1f5f9" font-size="9" font-weight="bold" text-anchor="middle">${pt.weight}</text>
    <text x="${cx}" y="${H - 4}" fill="#94a3b8" font-size="8" text-anchor="middle">${shortDate}</text>
  `;
  });

  box.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; display:block;">
    <line x1="${padX}" y1="${targetY}" x2="${W - padX}" y2="${targetY}" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="4,3" />
    <text x="${W - padX}" y="${targetY - 4}" fill="#f59e0b" font-size="8" text-anchor="end">الهدف ${target}</text>
    ${hist.length > 1 ? `<polyline fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${pointsStr.trim()}" />` : ""}
    ${dotsHtml}
  </svg>
`;
}
