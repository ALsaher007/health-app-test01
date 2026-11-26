// Modal open/close + the "editing" store shared with the save handlers.
// open*/close* only touch the DOM and `editing`; save* handlers stay with their
// render code and read `editing` (a mutable object, so importers can assign to it).
import { GAS_TEMPLATE } from "../data/gas-template.js";
import { getActiveProgram, getTaskWater, getTaskMins, minsToHHMM } from "../logic/schedule.js";
import { getTelegramConfig, getWaterGoal } from "../logic/storage.js";

export const editing = {
  waterTaskId: null,
  timeTaskId: null,
  mealTaskId: null,
  tempMealItems: [],
  // program profiles
  programDraft: null,      // working copy of the template being edited (never the stored one)
  programEditMode: "gym",
  pendingApply: null       // { kind: "activate"|"deactivate"|"edit", id }
};

export function showModal(id) { document.getElementById(id).style.display = "flex"; }
export function closeProgramManager() { document.getElementById("programManagerModal").style.display = "none"; }
export function closeProgramEditor() {
  document.getElementById("programEditModal").style.display = "none";
  editing.programDraft = null;
}
export function closeProgramApply() {
  document.getElementById("programApplyModal").style.display = "none";
  editing.pendingApply = null;
}

export function openWaterEdit(e, taskId) {
  e.stopPropagation();
  editing.waterTaskId = taskId;
  const t = getActiveProgram().tasks.find(x => x.id === taskId);
  if (!t) return;
  document.getElementById("waterEditTitle").textContent = `تعديل كمية الماء: ${t.text}`;
  document.getElementById("waterEditInput").value = getTaskWater(t);
  document.getElementById("waterEditModal").style.display = "flex";
}

export function closeWaterEdit() {
  document.getElementById("waterEditModal").style.display = "none";
  editing.waterTaskId = null;
}

export function openTimeEdit(e, id) {
  e.stopPropagation();
  editing.timeTaskId = id;
  const t = getActiveProgram().tasks.find(x => x.id === id);
  document.getElementById("editTaskTitle").textContent = t ? t.text : "تعديل الوقت";
  document.getElementById("editTimeInput").value = minsToHHMM(getTaskMins(id));
  document.getElementById("timeEditModal").style.display = "flex";
}

export function closeTimeEdit() {
  document.getElementById("timeEditModal").style.display = "none";
  editing.timeTaskId = null;
}

export function openTelegramModal() {
  const cfg = getTelegramConfig();
  document.getElementById("tgBotToken").value = cfg.botToken || "";
  document.getElementById("tgChatId").value = cfg.chatId || "";
  document.getElementById("tgWebhookUrl").value = cfg.webhookUrl || "";
  document.getElementById("gasCodeSnippet").textContent = GAS_TEMPLATE;
  document.getElementById("tgModal").style.display = "flex";
}

export function closeTelegramModal() {
  document.getElementById("tgModal").style.display = "none";
}

export function openWaterGoalEdit() {
  document.getElementById("waterGoalDesc").textContent =
    `الهدف اليومي (مل) لـ: ${getActiveProgram().label}`;
  const inp = document.getElementById("waterGoalInput");
  inp.value = getWaterGoal();
  document.getElementById("waterGoalModal").style.display = "flex";
  setTimeout(() => inp.select(), 50);
}

export function closeWaterGoalEdit() {
  document.getElementById("waterGoalModal").style.display = "none";
}

export function closeNutrGoals() {
  document.getElementById("nutrGoalsModal").style.display = "none";
}

export function closeMealEdit() {
  document.getElementById("mealEditModal").style.display = "none";
  editing.mealTaskId = null;
}
