// Smart swap rules

export const SWAP_RULES = [
  { from: "برغل", to: "قرنبيط أرز", savePer100g: 130, note: "نفس الحجم، سعرات أقل بكثير" },
  { from: "أرز أبيض", to: "برغل", savePer100g: 44, note: "ألياف أكثر، مؤشر سكر أقل" },
  { from: "بطاطا مسلوقة", to: "قرع/كوسا", savePer100g: 65, note: "كربوهيدرات أقل" },
  { from: "جبنة بيضاء/قشقوان", to: "موتزاريلا لايت", savePer100g: 140, note: "بروتين أعلى، دهون أقل" },
  { from: "لبن رايب كامل الدسم", to: "لبن زبادي لايت", savePer100g: 30, note: "نفس الطعم تقريباً" },
  { from: "زيت زيتون", to: "رشة زيت + ماء/ليمون", savePer100g: 700, note: "للسلطات فقط" },
  { from: "مكسرات (جوز/لوز/كاجو)", to: "بذور شيا/كتان", savePer100g: 200, note: "أوميغا-3، سعرات أقل" },
  { from: "تمر/تين مجفف", to: "فواكه طازجة (فراولة/توت)", savePer100g: 200, note: "سكر طبيعي أقل تركيزاً" },
  { from: "عسل/مربى", to: "ستيفيا/سكر فواكه", savePer100g: 250, note: "صفر سعرات" },
  { from: "خبز أبيض/سميت", to: "خبز نخالة/شوفان", savePer100g: 80, note: "ألياف أكثر" }
];

export const GENERAL_SWAPS = [
  { label: "🚶‍♂️ مشي 15 دقيقة بعد الأكل", saved: 60, note: "يحرق ~60 سعرة", action: "addExerciseSwap" },
  { label: "💧 شرب 500مل ماء قبل الأكل", saved: 30, note: "يقلل الشهية ~10%", action: "addWaterSwap" },
  { label: "🥗 زيادة خضار + تقليل نشويات", saved: 100, note: "حجم أكبر، سعرات أقل", action: "addVeggieSwap" }
];
