// Telegram / cloud push: config badge, test message, schedule sync.
import { GAS_TEMPLATE } from "../data/gas-template.js";
import { getEffectiveSchedule, getLockAlarmEntry } from "./schedule.js";
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

/** True when token, chat id and a /exec script URL are all saved (background sync can run). */
export function isTelegramConfigured() {
  const cfg = getTelegramConfig();
  return !!(cfg.botToken && cfg.chatId && cfg.webhookUrl && cfg.webhookUrl.includes("/exec"));
}

/**
 * Exactly what is sent to Google Apps Script: today's EFFECTIVE schedule (manual/shifted times,
 * edited water amounts, today's water-lock alarm), never the fixed template.
 */
export function buildTelegramPayload(cfg, resetSent = false) {
  const schedule = getEffectiveSchedule();
  const tasks = schedule.map(t => ({
    id: t.id,
    mins: t.mins,
    text: `${t.text}${t.water > 0 ? ` (${t.water} مل مي)` : ""}`
  }));
  const lock = getLockAlarmEntry();
  if (lock) tasks.push(lock);
  let tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { }
  return {
    date: currentTodayStr,
    botToken: cfg.botToken,
    chatId: cfg.chatId,
    tasks,
    completedIds: schedule.filter(t => t.done || t.skipped).map(t => t.id),
    resetSent,
    updatedAt: Date.now(), // lets the script ignore an older payload that arrives late
    tz                      // the script compares times in the phone's time zone
  };
}

let syncSeq = 0;

/** Returns true when a payload was actually posted. */
export function syncScheduleToCloud(manualNotify = false, resetSent = false) {
  if (!isViewingToday()) return false;
  const cfg = getTelegramConfig();
  if (!cfg.botToken || !cfg.chatId || !cfg.webhookUrl) {
    if (manualNotify) showToast("⚠️ أدخل التوكن و Chat ID ورابط السكربت أولاً");
    return false;
  }
  if (!cfg.webhookUrl.includes("/exec")) {
    if (manualNotify) showToast("⚠️ رابط السكربت يجب أن ينتهي بـ /exec");
    return false;
  }

  const payload = buildTelegramPayload(cfg, resetSent || manualNotify);

  // one hidden iframe per request: a shared one cancels the previous POST when two syncs follow each other
  const frameName = "tgSyncFrame" + (++syncSeq);
  const frame = document.createElement("iframe");
  frame.id = frameName;
  frame.name = frameName;
  frame.style.display = "none";
  document.body.appendChild(frame);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = cfg.webhookUrl;
  form.target = frameName;
  form.style.display = "none";

  const input = document.createElement("input");
  input.type = "hidden";
  input.name = "data";
  input.value = JSON.stringify(payload);
  form.appendChild(input);

  document.body.appendChild(form);
  form.submit();
  const later = (fn, ms) => { const t = setTimeout(fn, ms); if (t && t.unref) t.unref(); };
  later(() => form.remove(), 2000);
  later(() => frame.remove(), 30000);

  if (manualNotify) {
    showToast(`✈️ تمت مزامنة ${payload.tasks.length} مهمة مع السحابة`);
  }
  return true;
}
