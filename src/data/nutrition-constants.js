// Nutrition constants + food factory (no dependencies)

export const NUTR_KEYS = ["cal", "pro", "carb", "fat", "fib", "sug", "sat", "sod"];
export const NUTR_LABELS = { cal: "السعرات", pro: "البروتين", carb: "الكربوهيدرات", fat: "الدهون", fib: "الألياف", sug: "السكريات", sat: "الدهون المشبعة", sod: "الصوديوم" };
export const NUTR_UNITS = { cal: "سعرة", pro: "غ", carb: "غ", fat: "غ", fib: "غ", sug: "غ", sat: "غ", sod: "مغ" };
export const NUTR_TYPE = { cal: "max", pro: "min", carb: "max", fat: "max", fib: "min", sug: "max", sat: "max", sod: "max" };

// حقول البيانات الجديدة الاختيارية
export const EXTRA_FIELDS = ["allergens", "gi", "source", "cost"];
export const ALLERGEN_LABELS = { gluten: "جلوتين", dairy: "ألبان", nuts: "مكسرات", soy: "صويا", eggs: "بيض", fish: "سمك", shellfish: "قشريات", sesame: "سمسم" };
export const SOURCE_LABELS = { usda: "USDA", tubitak: "TÜBİTAK", custom: "مخصص", estimated: "تقديري" };

// mkFood تدعم التنسيق القديم (مصفوفة) والجديد (كائن مع حقول إضافية)
export function mkFood(name, v) {
  if (Array.isArray(v)) {
    return { name, cal: v[0], pro: v[1], carb: v[2], fat: v[3], fib: v[4], sug: v[5], sat: v[6], sod: v[7] };
  }
  return { name, ...v };
}
