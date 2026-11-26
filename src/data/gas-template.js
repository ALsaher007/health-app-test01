// Google Apps Script template for Telegram cloud push
// (plain Apps Script: no "export" keyword; re-deploy as a NEW VERSION after pasting it)

export const GAS_TEMPLATE = `function doPost(e) {
  var raw = (e.parameter && e.parameter.data) || (e.postData && e.postData.contents);
  if (!raw) return ContentService.createTextOutput("EMPTY");
  var props = PropertiesService.getScriptProperties();
  var incoming = JSON.parse(raw);
  var oldRaw = props.getProperty("SCHEDULE_PAYLOAD");
  if (oldRaw) {
    var old = JSON.parse(oldRaw);
    // a slower, older request must never overwrite a newer schedule
    if (old.updatedAt && incoming.updatedAt && incoming.updatedAt < old.updatedAt) {
      return ContentService.createTextOutput("STALE");
    }
  }
  props.setProperty("SCHEDULE_PAYLOAD", raw);
  return ContentService.createTextOutput("OK");
}

function checkAlarms() {
  var props = PropertiesService.getScriptProperties();
  var raw = props.getProperty("SCHEDULE_PAYLOAD");
  if (!raw) return;
  var p = JSON.parse(raw);
  var now = new Date();
  var tz = p.tz || Session.getScriptTimeZone();
  var today = Utilities.formatDate(now, tz, "yyyy-MM-dd");
  if (p.date !== today) return;
  var nowMins = parseInt(Utilities.formatDate(now, tz, "H"), 10) * 60 + parseInt(Utilities.formatDate(now, tz, "m"), 10);
  var sent = JSON.parse(props.getProperty("SENT_" + today) || "{}");
  var done = p.completedIds || [];
  (p.tasks || []).forEach(function(t) {
    var key = t.id + "_" + t.mins;
    if (sent[key] || done.indexOf(t.id) !== -1) return;
    if (nowMins >= t.mins && nowMins - t.mins <= 2) {
      UrlFetchApp.fetch("https://api.telegram.org/bot" + p.botToken + "/sendMessage", {
        method: "post", contentType: "application/json",
        payload: JSON.stringify({ chat_id: p.chatId, text: "⏰ موعدك الآن:\\n" + t.text })
      });
      sent[key] = true;
    }
  });
  props.setProperty("SENT_" + today, JSON.stringify(sent));
}`;
