// Google Apps Script template for Telegram cloud push

export const GAS_TEMPLATE = `function doPost(e) {
var raw = (e.parameter && e.parameter.data) || (e.postData && e.postData.contents);
PropertiesService.getScriptProperties().setProperty("SCHEDULE_PAYLOAD", raw);
return ContentService.createTextOutput("OK");
}

export function checkAlarms() {
var props = PropertiesService.getScriptProperties();
var raw = props.getProperty("SCHEDULE_PAYLOAD");
if (!raw) return;
var p = JSON.parse(raw);
var now = new Date();
var today = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd");
if (p.date !== today) return;
var nowMins = now.getHours() * 60 + now.getMinutes();
var sent = JSON.parse(props.getProperty("SENT_" + today) || "{}");
var done = p.completedIds || [];
p.tasks.forEach(function(t) {
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
