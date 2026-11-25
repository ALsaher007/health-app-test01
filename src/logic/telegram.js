// Telegram / cloud push: config badge, test message, schedule sync.
import { GAS_TEMPLATE } from "../data/gas-template.js";
import { getActiveProgram, getTaskMins, getTaskWater } from "./schedule.js";
import { getTelegramConfig } from "./storage.js";
import { currentTodayStr, isViewingToday, state } from "../state.js";
import { closeTelegramModal } from "../ui/modals.js";
import { showToast } from "../ui/toast.js";

export function updateTelegramBadge() {
  const cfg = getTelegramConfig();
  const badge = document.getElementById("tgStatusBadge");
  if (cfg.botToken && cfg.chatId && cfg.webhookUrl) {
    badge.className = "strip-btn active";
    badge.textContent = "✈️ تيليغرام متزامن";
  } else {
    badge.className = "strip-btn";
    badge.textContent = "✈️ تنبيه تيليغرام";
  }
}

export function copyGasSnippet() {
  navigator.clipboard.writeText(GAS_TEMPLATE).then(() => showToast("تم نسخ كود السكربت السحابي"));
}

export function saveTelegramConfig() {
  const cfg = {
    botToken: document.getElementById("tgBotToken").value.trim(),
    chatId: document.getElementById("tgChatId").value.trim(),
    webhookUrl: document.getElementById("tgWebhookUrl").value.trim()
  };
  localStorage.setItem("aburaslan_tg_cfg", JSON.stringify(cfg));
  updateTelegramBadge();
  syncScheduleToCloud(true);
  closeTelegramModal();
}

export function testTelegramMessage() {
  const botToken = document.getElementById("tgBotToken").value.trim();
  const chatId = document.getElementById("tgChatId").value.trim();
  if (!botToken || !chatId) {
    showToast("أدخل توكن البوت ورقم المحادثة أولاً");
    return;
  }
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: "✅ تم ربط متابع البرنامج الصحي بنجاح! ستصلك التنبيهات هنا في وقتها." })
  })
    .then(r => r.json())
    .then(res => {
      if (res.ok) showToast("✅ وصلت الرسالة التجريبية إلى تيليغرام!");
      else showToast("⚠️ تأكد من صحة التوكن و Chat ID");
    })
    .catch(() => showToast("⚠️ تعذّر الاتصال بتيليغرام"));
}

export function syncScheduleToCloud(manualNotify = false, resetSent = false) {
  if (!isViewingToday()) return;
  const cfg = getTelegramConfig();
  if (!cfg.botToken || !cfg.chatId || !cfg.webhookUrl) {
    if (manualNotify) showToast("⚠️ أدخل التوكن و Chat ID ورابط السكربت أولاً");
    return;
  }
  if (!cfg.webhookUrl.includes("/exec")) {
    if (manualNotify) showToast("⚠️ رابط السكربت يجب أن ينتهي بـ /exec");
    return;
  }

  const allTasks = getActiveProgram().tasks.map(t => {
    const w = getTaskWater(t);
    return {
      id: t.id,
      mins: getTaskMins(t.id),
      text: `${t.text}${w > 0 ? ` (${w} مل مي)` : ""}`
    };
  });

  const completedIds = getActiveProgram().tasks
    .filter(t => !!state.tasks[t.id] || !!(state.skipped && state.skipped[t.id]))
    .map(t => t.id);

  const payloadStr = JSON.stringify({
    date: currentTodayStr,
    botToken: cfg.botToken,
    chatId: cfg.chatId,
    tasks: allTasks,
    completedIds: completedIds,
    resetSent: resetSent || manualNotify
  });

  let frame = document.getElementById("tgHiddenSyncFrame");
  if (!frame) {
    frame = document.createElement("iframe");
    frame.id = "tgHiddenSyncFrame";
    frame.name = "tgHiddenSyncFrame";
    frame.style.display = "none";
    document.body.appendChild(frame);
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = cfg.webhookUrl;
  form.target = "tgHiddenSyncFrame";
  form.style.display = "none";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "data";
  input.value = payloadStr;
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  setTimeout(() => form.remove(), 2000);

  if (manualNotify) {
    showToast(`✈️ تمت مزامنة ${allTasks.length} مهمة مع السحابة`);
  }
}
