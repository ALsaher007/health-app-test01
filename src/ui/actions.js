// Delegated UI actions. index.html and the rendered templates carry
//   data-action="name"  (click)   data-change="name"  (change)   data-input="name"  (input)
// plus data-* arguments, instead of inline onclick/onchange attributes.
// tests/no-inline-handlers.test.js checks every name used in markup is registered here.
import { confirmAlarmDone, dismissLockAlarm, enableAlertsAndAudio, playSingleChime, snoozeAlarm5 } from "../logic/alarms.js";
import { copyDailyReport, exportBackupJSON, exportScheduleICS } from "../logic/reports.js";
import { copyGasSnippet, saveTelegramConfig, testTelegramMessage } from "../logic/telegram.js";
import { addIngredientToMeal, applySelectedPreset, deleteSelectedPreset, openMealEdit, removeTempIng, saveCurrentAsPreset, saveMealCustomization, updateTempIngGrams } from "./meal-editor.js";
import { closeMealEdit, closeNutrGoals, closeTelegramModal, closeTimeEdit, closeWaterEdit, closeWaterGoalEdit, openNutrGoals, openTelegramModal, openTimeEdit, openWaterEdit, openWaterGoalEdit } from "./modals.js";
import { changeViewingDate, importBackupJSON, jumpToToday, resetToday, switchDayMode, switchTab } from "./render-all.js";
import { addExerciseSwap, addFoodItem, addVeggieSwap, addWaterSwap, applySmartSwap, calcOffset, deleteMeal, deleteOffset, openSmartSwaps, populateFoodSelect, populateMealAddSelect, saveNutrGoals, setFoodCategory, updateFoodPreview } from "./render-meals.js";
import { completeNextStation, resetScheduleTimes, saveEditedTime, saveWaterEdit, scrollToNextStation, toggleSkip, toggleTask } from "./render-tasks.js";
import { addWater, cancelWaterLock, resetWaterGoal, saveWaterGoal, setQuickWaterVal, startWaterLock } from "./render-water.js";
import { saveWeightAndGoal } from "./render-weight.js";

// ----- click -----
export const CLICK = {
  "add-exercise-swap": el => addExerciseSwap(Number(el.dataset.saved)),
  "add-food-item": () => addFoodItem(),
  "add-ingredient-to-meal": () => addIngredientToMeal(),
  "add-veggie-swap": el => addVeggieSwap(Number(el.dataset.saved)),
  "add-water": el => addWater(Number(el.dataset.ml)),
  "add-water-swap": el => addWaterSwap(Number(el.dataset.saved)),
  "apply-selected-preset": () => applySelectedPreset(),
  "apply-smart-swap": el => applySmartSwap(Number(el.dataset.mealIndex), el.dataset.from, el.dataset.to, Number(el.dataset.saved)),
  "calc-offset": () => calcOffset(),
  "cancel-water-lock": () => cancelWaterLock(),
  "change-viewing-date": el => changeViewingDate(Number(el.dataset.delta)),
  "close-meal-edit": () => closeMealEdit(),
  "close-nutr-goals": () => closeNutrGoals(),
  "close-overlay": el => el.closest(".modal-overlay").remove(),
  "close-telegram-modal": () => closeTelegramModal(),
  "close-time-edit": () => closeTimeEdit(),
  "close-water-edit": () => closeWaterEdit(),
  "close-water-goal-edit": () => closeWaterGoalEdit(),
  "complete-next-station": () => completeNextStation(),
  "confirm-alarm-done": () => confirmAlarmDone(),
  "copy-daily-report": () => copyDailyReport(),
  "copy-gas-snippet": () => copyGasSnippet(),
  "delete-meal": el => deleteMeal(Number(el.dataset.index)),
  "delete-offset": el => deleteOffset(el.dataset.id),
  "delete-selected-preset": () => deleteSelectedPreset(),
  "dismiss-lock-alarm": () => dismissLockAlarm(),
  "enable-alerts-and-audio": () => enableAlertsAndAudio(),
  "export-backup-json": () => exportBackupJSON(),
  "export-schedule-ics": () => exportScheduleICS(),
  "jump-to-today": () => jumpToToday(),
  "open-meal-edit": (el, e) => openMealEdit(e, el.dataset.id),
  "open-nutr-goals": () => openNutrGoals(),
  "open-smart-swaps": () => openSmartSwaps(),
  "open-telegram-modal": () => openTelegramModal(),
  "open-time-edit": (el, e) => openTimeEdit(e, el.dataset.id),
  "open-water-edit": (el, e) => openWaterEdit(e, el.dataset.id),
  "open-water-goal-edit": () => openWaterGoalEdit(),
  "pick-backup-file": () => document.getElementById("importFileInput").click(),
  "play-single-chime": () => playSingleChime(),
  "remove-temp-ing": el => removeTempIng(Number(el.dataset.index)),
  "reset-schedule-times": () => resetScheduleTimes(),
  "reset-today": () => resetToday(),
  "reset-water-goal": () => resetWaterGoal(),
  "save-current-as-preset": () => saveCurrentAsPreset(),
  "save-edited-time": () => saveEditedTime(),
  "save-meal-customization": () => saveMealCustomization(),
  "save-nutr-goals": () => saveNutrGoals(),
  "save-telegram-config": () => saveTelegramConfig(),
  "save-water-edit": () => saveWaterEdit(),
  "save-water-goal": () => saveWaterGoal(),
  "save-weight-and-goal": () => saveWeightAndGoal(),
  "scroll-to-next-station": () => scrollToNextStation(),
  "set-quick-water-val": el => setQuickWaterVal(Number(el.dataset.ml)),
  "snooze-alarm5": () => snoozeAlarm5(),
  "start-water-lock": el => startWaterLock(Number(el.dataset.lock), Number(el.dataset.eat)),
  "switch-day-mode": el => switchDayMode(el.dataset.mode),
  "switch-tab": el => switchTab(el.dataset.tab, el),
  "test-telegram-message": () => testTelegramMessage(),
  "toggle-skip": el => toggleSkip(el.dataset.id),
  "toggle-task": el => toggleTask(el.dataset.id),
};

// ----- change -----
export const CHANGE = {
  "import-backup-json": (el, e) => importBackupJSON(e),
  "set-food-category": el => setFoodCategory(el.value),
  "update-food-preview": () => updateFoodPreview(),
};

// ----- input -----
export const INPUT = {
  "populate-food-select": () => populateFoodSelect(),
  "populate-meal-add-select": () => populateMealAddSelect(),
  "update-food-preview": () => updateFoodPreview(),
  "update-temp-ing-grams": el => updateTempIngGrams(Number(el.dataset.index), el.value),
};

function dispatch(map, attr, e) {
  // closest() so clicking an icon/text inside a button still finds the button
  const el = e.target instanceof Element ? e.target.closest(`[data-${attr}]`) : null;
  if (!el || el.disabled) return;
  const handler = map[el.dataset[attr]];
  if (handler) handler(el, e);
  else console.warn(`No handler registered for data-${attr}="${el.dataset[attr]}"`);
}

export function initActions(root = document) {
  root.addEventListener("click", e => dispatch(CLICK, "action", e));
  root.addEventListener("change", e => dispatch(CHANGE, "change", e));
  root.addEventListener("input", e => dispatch(INPUT, "input", e));
}
