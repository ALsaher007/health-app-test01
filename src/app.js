// App entry: wires modules together, starts timers, registers the service worker.
import { checkScheduledAlarms, configureAlarms, unlockAudio, updatePermBanner } from "./logic/alarms.js";
import { syncScheduleToCloud, updateTelegramBadge } from "./logic/telegram.js";
import { isViewingToday } from "./state.js";
import { initActions } from "./ui/actions.js";
import { checkAutoDayRollover, renderAll, switchTab } from "./ui/render-all.js";
import { configureMeals, openSmartSwaps, populateFoodCategories, populateFoodSelect } from "./ui/render-meals.js";
import { completeNextStation, renderNextStationCard, renderTasks, toggleTask } from "./ui/render-tasks.js";
import { addWater, updateLockUI } from "./ui/render-water.js";
import { showToast } from "./ui/toast.js";

initActions();

// Late-bound dependencies (avoid import cycles between modules)
configureAlarms({ toggleTask, renderTasks });
configureMeals({ toggleTask });

// Init
document.body.addEventListener("pointerdown", unlockAudio, { once: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    checkAutoDayRollover();
    updateLockUI();
    renderNextStationCard();
    checkScheduledAlarms();
  }
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => { });
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist();

updatePermBanner();
updateTelegramBadge();
populateFoodCategories();
populateFoodSelect();
renderAll(true);
syncScheduleToCloud();

setInterval(() => {
  checkAutoDayRollover();
  updateLockUI();
  checkScheduledAlarms();
}, 1000);

setInterval(() => {
  renderNextStationCard();
}, 30000);

// ===== Keyboard Shortcuts =====
document.addEventListener("keydown", (e) => {
  // Ignore if typing in an input/textarea/select
  const active = document.activeElement;
  const isInput = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.tagName === "SELECT");
  if (isInput) return;

  const key = e.key.toLowerCase();

  switch (key) {
    case " ": // Space - إنجاز المهمة التالية
      e.preventDefault();
      completeNextStation();
      break;
    case "m": // M - فتح حاسبة الطعام
      e.preventDefault();
      switchTab('food', document.querySelector('.nav-btn[data-tab="food"]'));
      setTimeout(() => document.getElementById("foodSearch")?.focus(), 100);
      showToast("⌨️ حاسبة الطعام — اكتب للبحث");
      break;
    case "w": // W - إضافة ماء سريع (250 مل)
      e.preventDefault();
      if (isViewingToday()) {
        addWater(250);
        showToast("💧 +250 مل ماء");
      }
      break;
    case "s": // S - فتح بدائل ذكية
      e.preventDefault();
      openSmartSwaps();
      break;
    case "r": // R - مزامنة مع السحابة
      e.preventDefault();
      if (isViewingToday()) {
        syncScheduleToCloud(true);
        showToast("☁️ تتم المزامنة...");
      }
      break;
    case "escape": // Esc - إغلاق أي مودال
      document.querySelectorAll(".modal-overlay").forEach(m => {
        if (m.id === "alarmModal") return; // a ringing alarm must be confirmed or snoozed
        if (m.id) m.style.display = "none"; // static modals live in index.html: hide, never delete
        else m.remove();                    // dynamic ones (e.g. smart swaps)
      });
      break;
  }
});

// تلميح اختصارات عند أول تحميل (يظهر مرة واحدة)
const hintsSeen = localStorage.getItem("kb_hints_seen");
if (!hintsSeen && isViewingToday()) {
  setTimeout(() => {
    showToast("⌨️ اختصارات: Space=مهمة تالية | M=طعام | W=ماء | S=بدائل | R=مزامنة | Esc=إغلاق");
    localStorage.setItem("kb_hints_seen", "1");
  }, 3000);
}
