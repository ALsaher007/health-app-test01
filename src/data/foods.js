// Food database: categories, lookup tables

import { mkFood } from "./nutrition-constants.js";

// ----- Food Database -----
const SAVORY_FOODS = [
  mkFood("برغل مطبوخ سادة", [86, 3, 18.6, 0.2, 4.5, 0.1, 0, 5]),
  mkFood("بطاطا مسلوقة سادة", [87, 2, 20.1, 0.1, 1.8, 0.9, 0, 4]),
  mkFood("بياض بيض مسلوق", [52, 11, 0.7, 0.2, 0, 0.7, 0, 166]),
  mkFood("بيض كامل مسلوق", [143, 12.6, 0.7, 9.5, 0, 0.4, 3.1, 140]),
  mkFood("تونة مصفاة", { cal: 115, pro: 25, carb: 0, fat: 1, fib: 0, sug: 0, sat: 0.3, sod: 340, allergens: ["fish"], gi: 0, source: "usda", cost: 25 }),
  mkFood("حمص مطبوخ", { cal: 165, pro: 8.9, carb: 27.4, fat: 2.6, fib: 7.6, sug: 4.8, sat: 0.3, sod: 7, allergens: [], gi: 28, source: "usda", cost: 8 }),
  mkFood("زيتون أسود/أخضر", { cal: 145, pro: 1, carb: 3.8, fat: 15.3, fib: 3.3, sug: 0, sat: 2, sod: 1100, allergens: [], gi: 15, source: "usda", cost: 15 }),
  mkFood("سلطة خضراء مشكلة", { cal: 20, pro: 1, carb: 3.5, fat: 0.2, fib: 1.5, sug: 2, sat: 0, sod: 15, allergens: [], gi: 10, source: "usda", cost: 5 }),
  mkFood("صدر مطبوخ مع الكبسة", { cal: 195, pro: 29, carb: 2, fat: 7.7, fib: 0.2, sug: 0.3, sat: 2.2, sod: 380, allergens: ["gluten"], gi: 45, source: "estimated", cost: 30 }),
  mkFood("صدر مطبوخ مع المندي", { cal: 185, pro: 30, carb: 0.5, fat: 6.5, fib: 0, sug: 0, sat: 1.8, sod: 350, allergens: ["gluten"], gi: 40, source: "estimated", cost: 30 }),
  mkFood("صدور دجاج مسلوقة/مشوية", { cal: 165, pro: 31, carb: 0, fat: 3.6, fib: 0, sug: 0, sat: 1, sod: 74, allergens: [], gi: 0, source: "usda", cost: 25 }),
  mkFood("فخاد مطبوخة مع المندي أو الكبسة", { cal: 235, pro: 24, carb: 1, fat: 15, fib: 0, sug: 0, sat: 4.2, sod: 390, allergens: ["gluten"], gi: 45, source: "estimated", cost: 35 }),
  mkFood("كبسة سورية - أرز", { cal: 155, pro: 3, carb: 27, fat: 3.5, fib: 0.8, sug: 0.5, sat: 0.7, sod: 320, allergens: ["gluten"], gi: 55, source: "estimated", cost: 10 }),
  mkFood("لبن رايب", { cal: 60, pro: 3.5, carb: 4.5, fat: 3, fib: 0, sug: 4.5, sat: 1.9, sod: 45, allergens: ["dairy"], gi: 30, source: "usda", cost: 3 }),
  mkFood("لحم مشوي أو مسلوق هبر", { cal: 210, pro: 27, carb: 0, fat: 11, fib: 0, sug: 0, sat: 4.5, sod: 70, allergens: [], gi: 0, source: "usda", cost: 40 }),
  mkFood("مندي سوري - أرز", { cal: 150, pro: 2.8, carb: 28, fat: 2.5, fib: 0.7, sug: 0.3, sat: 0.5, sod: 300, allergens: ["gluten"], gi: 50, source: "estimated", cost: 10 }),
  { name: "➕ إدخال يدوي لأكلة مخصصة", cal: 0, pro: 0, custom: true }
];

const SWEET_DAIRY_FOODS = [
  mkFood("حليب كامل الدسم", { cal: 61, pro: 3.2, carb: 4.8, fat: 3.3, fib: 0, sug: 4.8, sat: 1.9, sod: 43, allergens: ["dairy"], gi: 30, source: "usda", cost: 2 }),
  mkFood("عسل نحل", { cal: 304, pro: 0.3, carb: 82.4, fat: 0, fib: 0.2, sug: 82.1, sat: 0, sod: 4, allergens: [], gi: 55, source: "usda", cost: 30 }),
  mkFood("قشطة البيم الجاهزة - كايماك", { cal: 580, pro: 2.5, carb: 3, fat: 60, fib: 0, sug: 3, sat: 38, sod: 30, allergens: ["dairy"], gi: 15, source: "custom", cost: 50 }),
  mkFood("قشطة الحليب المغلي على الوجه", { cal: 340, pro: 2.5, carb: 3.5, fat: 35, fib: 0, sug: 3.5, sat: 22, sod: 30, allergens: ["dairy"], gi: 20, source: "custom", cost: 25 })
];

const FRUITS_MORE = [
  mkFood("رمان", [83, 1.7, 18.7, 1.2, 4, 13.7, 0.1, 3]),
  mkFood("غريب فروت", [42, 0.8, 10.7, 0.1, 1.6, 6.9, 0, 0]),
  mkFood("ليمون", [29, 1.1, 9.3, 0.3, 2.8, 2.5, 0, 2]),
  mkFood("فراولة", [32, 0.7, 7.7, 0.3, 2, 4.9, 0, 1]),
  mkFood("كرز حلو", [63, 1.1, 16, 0.2, 2.1, 12.8, 0, 0]),
  mkFood("كرز حامض (فيشنة)", [50, 1, 12.2, 0.3, 1.6, 8.5, 0.1, 3]),
  mkFood("خوخ", [39, 0.9, 9.5, 0.3, 1.5, 8.4, 0, 0]),
  mkFood("دراق", [39, 0.9, 9.5, 0.3, 1.5, 8.4, 0, 0]),
  mkFood("نكتارين", [44, 1.1, 10.6, 0.3, 1.7, 7.9, 0, 0]),
  mkFood("مشمش طازج", [48, 1.4, 11.1, 0.4, 2, 9.2, 0, 1]),
  mkFood("بطيخ أحمر", [30, 0.6, 7.6, 0.2, 0.4, 6.2, 0, 1]),
  mkFood("بطيخ أصفر", [30, 0.6, 7.6, 0.2, 0.4, 6.2, 0, 1]),
  mkFood("قاون تركي (شمام تركي)", [34, 0.8, 8.2, 0.2, 0.9, 7.9, 0.1, 16]),
  mkFood("شمام (كنتالوب)", [34, 0.8, 8.2, 0.2, 0.9, 7.9, 0.1, 16]),
  mkFood("تين طازج", [74, 0.8, 19.2, 0.3, 2.9, 16.3, 0.1, 1]),
  mkFood("سفرجل", [57, 0.4, 15.3, 0.1, 1.9, 7, 0, 4]),
  mkFood("توت شجر (أبيض/أسود)", [43, 1.4, 9.8, 0.4, 1.7, 8.1, 0.1, 10]),
  mkFood("توت عليق أسود", [43, 1.4, 9.6, 0.5, 5.3, 4.9, 0, 1]),
  mkFood("توت عليق أحمر (راسبيري)", [52, 1.2, 11.9, 0.7, 6.5, 4.4, 0, 1]),
  mkFood("توت أزرق", [57, 0.7, 14.5, 0.3, 2.4, 10, 0, 1]),
  mkFood("كاكا (خرمة/منغا سوري)", [70, 0.6, 18.6, 0.2, 3.6, 12.5, 0, 1]),
  mkFood("أناناس", [50, 0.5, 13.1, 0.1, 1.4, 9.9, 0, 1]),
  mkFood("مانجو", [60, 0.8, 15, 0.4, 1.6, 13.7, 0.1, 1]),
  mkFood("تين شوكي", [41, 0.7, 9.6, 0.5, 3.6, 5.9, 0.1, 5]),
  mkFood("أكدنيا (إسكدنيا)", [47, 0.4, 12.1, 0.2, 1.7, 8.3, 0, 1]),
  mkFood("جانرك (برقوق أخضر)", [46, 0.7, 11.4, 0.3, 1.4, 9.9, 0, 0]),
  // per 100 g edible portion (USDA FoodData Central; black grapes estimated from the grape entry)
  mkFood("يوسفي", { cal: 53, pro: 0.8, carb: 13.3, fat: 0.3, fib: 1.8, sug: 10.6, sat: 0, sod: 2, allergens: [], gi: 42, source: "usda" }),
  mkFood("تفاح", { cal: 52, pro: 0.3, carb: 13.8, fat: 0.2, fib: 2.4, sug: 10.4, sat: 0, sod: 1, allergens: [], gi: 36, source: "usda" }),
  mkFood("برتقال", { cal: 47, pro: 0.9, carb: 11.8, fat: 0.1, fib: 2.4, sug: 9.4, sat: 0, sod: 0, allergens: [], gi: 43, source: "usda" }),
  mkFood("عنب أخضر", { cal: 69, pro: 0.7, carb: 18.1, fat: 0.2, fib: 0.9, sug: 15.5, sat: 0.1, sod: 2, allergens: [], gi: 53, source: "usda" }),
  mkFood("عنب أسود", { cal: 69, pro: 0.7, carb: 18.1, fat: 0.2, fib: 0.9, sug: 15.5, sat: 0.1, sod: 2, allergens: [], gi: 53, source: "estimated" }),
  mkFood("إجاص", { cal: 57, pro: 0.4, carb: 15.2, fat: 0.1, fib: 3.1, sug: 9.8, sat: 0, sod: 1, allergens: [], gi: 38, source: "usda" })
];

const VEGETABLES = [
  // per 100 g (USDA FoodData Central)
  mkFood("جزر", { cal: 41, pro: 0.9, carb: 9.6, fat: 0.2, fib: 2.8, sug: 4.7, sat: 0, sod: 69, allergens: [], gi: 35, source: "usda" }),
  mkFood("خيار", { cal: 15, pro: 0.7, carb: 3.6, fat: 0.1, fib: 0.5, sug: 1.7, sat: 0, sod: 2, allergens: [], gi: 15, source: "usda" }),
  mkFood("شوندر سكري نيء", { cal: 43, pro: 1.6, carb: 9.6, fat: 0.2, fib: 2.8, sug: 6.8, sat: 0, sod: 78, allergens: [], gi: 64, source: "usda" }),
  mkFood("شوندر سكري مسلوق", { cal: 44, pro: 1.7, carb: 10, fat: 0.2, fib: 2, sug: 8, sat: 0, sod: 77, allergens: [], gi: 64, source: "usda" })
];

const STAPLES = [
  mkFood("أرز أبيض مسلوق", [130, 2.7, 28.2, 0.3, 0.4, 0.1, 0.1, 1]),
  mkFood("أرز أسمر مسلوق", [123, 2.7, 25.6, 1, 1.6, 0.2, 0.2, 4]),
  mkFood("معكرونة مسلوقة", [158, 5.8, 30.9, 0.9, 1.8, 0.6, 0.2, 1]),
  mkFood("عدس مسلوق", [116, 9, 20.1, 0.4, 7.9, 1.8, 0.1, 2]),
  mkFood("فاصولياء بيضاء مسلوقة", [139, 9.7, 25, 0.4, 6.3, 0.3, 0.1, 6]),
  mkFood("فول مدمس سادة مسلوق", [110, 7.6, 19.7, 0.4, 5.4, 1.8, 0.1, 5]),
  mkFood("فريكة مطبوخة سادة", [125, 5, 24, 1.1, 4.5, 0.5, 0.2, 5]),
  mkFood("سكر أبيض", [387, 0, 100, 0, 0, 100, 0, 1])
];

const FATS_OILS = [
  mkFood("صحينة السمسم (طحينة)", [595, 17, 21.2, 53.8, 9.3, 0.5, 7.5, 115]),
  mkFood("زبدة", [717, 0.9, 0.1, 81.1, 0, 0.1, 51.4, 643]),
  mkFood("زيت زيتون", [884, 0, 0, 100, 0, 0, 13.8, 2]),
  mkFood("زيت نباتي (دوار الشمس/ذرة)", [884, 0, 0, 100, 0, 0, 11, 0])
];

const DAIRY_MORE = [
  mkFood("لبن زبادي كامل الدسم", [61, 3.5, 4.7, 3.3, 0, 4.7, 2.1, 46]),
  mkFood("لبنة", [170, 6.5, 4, 14, 0, 4, 9, 400]),
  mkFood("حلوم", [320, 21, 2, 25, 0, 1, 16, 1100]),
  mkFood("جبنة بيضاء مالحة (عكاوي/بيضاء)", [264, 14, 4, 21, 0, 4, 14.9, 1100]),
  mkFood("شنكليش", [280, 18, 3, 22, 0, 2, 14, 1300]),
  mkFood("Kaşar Peyniri - قشقوان", [320, 21, 2, 25, 0, 1, 16, 1100]),
  mkFood("Taze Kaşar Peyniri - قشقوان طازج", [300, 22, 2.5, 22, 0, 1, 14, 900]),
  mkFood("Mozzarella Peyniri - موتزاريلا", [280, 28, 3.1, 17, 0, 1, 10, 600]),
  mkFood("Light Mozzarella Peyniri - موتزاريلا لايت", [180, 30, 3, 6, 0, 1, 3.5, 500]),
  mkFood("Kahvaltı Sosu (BIM) - صوص فطور (بيم)", [150, 3, 12, 10, 0.5, 10, 4, 400]),
  // cottage cheese: USDA creamed, 4% fat. Lor: low-fat Turkish whey cheese, estimated (brands vary)
  mkFood("جبنة قريش", { cal: 98, pro: 11.1, carb: 3.4, fat: 4.3, fib: 0, sug: 2.7, sat: 1.7, sod: 364, allergens: ["dairy"], gi: 30, source: "usda" }),
  mkFood("Lor Peyniri - لور (جبنة مصل تركية قليلة الدسم)", { cal: 125, pro: 11, carb: 3.5, fat: 7, fib: 0, sug: 3, sat: 4.5, sod: 250, allergens: ["dairy"], gi: 30, source: "estimated" })
];

const NUTS_SEEDS = [
  mkFood("جوز نيء", [654, 15, 13.7, 65.2, 6.7, 2.6, 6.1, 2]),
  mkFood("كاجو نيء", [553, 18, 30.2, 43.9, 3.3, 5.9, 7.8, 12]),
  mkFood("لوز نيء", [579, 21, 21.6, 49.9, 12.5, 4.4, 3.8, 1]),
  mkFood("بذر يقطين", [559, 30, 10.7, 49, 6, 1.4, 8.7, 18]),
  mkFood("بذر عباد الشمس محمص بالملح", [584, 21, 20, 51, 8.6, 2.6, 4.5, 1500]),
  mkFood("بذر عباد الشمس نيء", [584, 21, 20, 51, 8.6, 2.6, 4.5, 5]),
  mkFood("فول سوداني محمص بالملح", [587, 24, 16, 49, 8.5, 4.7, 6.8, 900]),
  mkFood("فول سوداني محمص بدون ملح", [567, 26, 16, 49, 8.5, 4.7, 6.8, 5]),
  mkFood("فول سوداني نيء", [567, 26, 16, 49, 8.5, 4.7, 6.8, 5]),
  mkFood("بذور الشيا", [486, 17, 42, 31, 34, 0, 3.3, 16]),
  mkFood("بذور الكتان", [534, 18, 29, 42, 27, 1.6, 3.7, 30]),
  mkFood("بذور الكينوا", [368, 14, 64, 6, 7, 0, 0.7, 5]),
  mkFood("سمسم نيء", [573, 18, 23, 50, 12, 0.3, 7, 11]),
  mkFood("سمسم محمص", [565, 18, 25, 48, 12, 0.3, 6.7, 12]),
  mkFood("حبة سوداء (حبة البركة/السمرة)", [345, 16, 52, 15, 10, 0, 0.5, 17]),
  mkFood("كاكاو باودر خام غير محلى", [228, 20, 58, 14, 33, 1.8, 8.1, 21]),
  mkFood("شوفان", [389, 17, 66, 7, 10, 1, 1.2, 2]),
  mkFood("شوكولا دارك كاكاو 85%", [598, 12, 30, 46, 11, 14, 27, 20]),
  mkFood("زبدة فول سوداني", [588, 25, 20, 50, 6, 9, 10, 450]),
  mkFood("زبدة لوز", [614, 21, 19, 56, 10, 4, 4.5, 1]),
  mkFood("زبدة كاجو", [587, 18, 28, 49, 3.3, 6, 9, 15]),
  mkFood("زبيب (Kuru Üzüm)", [299, 3.1, 79.2, 0.5, 3.7, 59.2, 0.1, 11]),
  mkFood("تين مجفف (Kuru İncir)", [249, 3.3, 63.9, 0.9, 9.8, 47.9, 0.1, 10]),
  mkFood("مشمش مجفف برتقالي (Kuru Kayısı - Portakal)", [241, 3.4, 62.6, 0.5, 7.3, 53.4, 0, 10]),
  mkFood("مشمش مجفف أسود/بني (Kuru Kayısı - Koyu)", [230, 3.5, 60, 0.5, 7.5, 50, 0, 12]),
  mkFood("برقوق مجفف (Kuru Erik)", [240, 2.2, 63.9, 0.4, 7.1, 38.1, 0, 2]),
  mkFood("تمر (Hurma)", [280, 2.5, 75, 0.4, 6.7, 66, 0, 2]),
  mkFood("كرز مجفف (Kuru Kiraz)", [325, 1.5, 78, 0.5, 2.5, 67, 0, 10]),
  mkFood("فراولة مجففة (Kuru Çilek)", [320, 3, 75, 1, 7, 65, 0, 15]),
  mkFood("تفاح مجفف (Kuru Elma)", [243, 0.9, 66, 0.3, 8.7, 57, 0, 40]),
  mkFood("موز مجفف (Kuru Muz)", [346, 3.9, 78, 1.8, 2.6, 47, 0.8, 30]),
  mkFood("أناناس مجفف (Kuru Ananas)", [319, 2, 79, 0.5, 2, 70, 0.1, 10]),
  mkFood("مانجو مجفف (Kuru Mango)", [314, 2.5, 76, 1.2, 2.4, 68, 0.2, 20]),
  mkFood("تين شوكي مجفف (Kuru Hındistan İnciri)", [280, 3, 65, 1, 8, 55, 0.2, 25])
];

const SYRIAN_FOODS = [
  mkFood("مجدّرة (عدس وبرغل مع بصل مقلي)", [150, 6, 22, 4, 4.5, 1, 0.6, 300]),
  mkFood("مسقعة باذنجان بالبندورة والزيت", [110, 2, 9, 7.5, 3, 5, 1, 260]),
  mkFood("فاصولياء خضراء بالزيت", [70, 2, 8, 3.5, 3, 3.5, 0.5, 250]),
  mkFood("فاصولياء بيضاء بالبندورة", [105, 6, 16, 2, 5.5, 2.5, 0.4, 280]),
  mkFood("بازلاء بالجزر مع لحم", [100, 6, 11, 3.5, 3.5, 4, 1.3, 270]),
  mkFood("بامية باللحم", [90, 6, 6, 5, 2.5, 2.5, 1.8, 300]),
  mkFood("ملوخية بالدجاج (بدون أرز)", [75, 7, 4, 3.5, 2.5, 0.8, 0.9, 280]),
  mkFood("يبرق (ورق عنب بالأرز واللحم)", [150, 4, 20, 6, 1.5, 2, 1.3, 400]),
  mkFood("ورق عنب بالزيت (يالنجي)", [130, 2.5, 19, 5, 2, 2, 0.7, 380]),
  mkFood("كوسا محشي بالأرز واللحم", [110, 6, 11, 4.5, 2, 3, 1.5, 320]),
  mkFood("باذنجان محشي بالزيت", [95, 2, 12, 4.5, 3.5, 4, 0.7, 300]),
  mkFood("شاكرية (لحم باللبن)", [140, 11, 5, 8.5, 0.2, 4, 4.5, 290]),
  mkFood("كبة مقلية", [250, 11, 20, 14, 2.5, 1, 4, 450]),
  mkFood("كبة مشوية بالصينية", [220, 12, 18, 11, 2.5, 1, 3.5, 420]),
  mkFood("كبة نيّة", [180, 15, 15, 7, 3, 1, 3, 380]),
  mkFood("مقلوبة باذنجان ولحم", [170, 7, 22, 6, 2, 2, 1.8, 350]),
  mkFood("أرز مفلفل بالشعيرية", [150, 3, 28, 3, 0.8, 0.4, 0.5, 280]),
  mkFood("فريكة بالدجاج", [170, 9, 22, 5, 3, 1, 1.2, 330]),
  mkFood("كباب حلبي مشوي", [250, 17, 4, 18, 0.8, 1.5, 7, 480]),
  mkFood("شيش طاووق", [150, 24, 2.5, 5, 0.3, 1.5, 1.2, 420]),
  mkFood("شاورما دجاج (لحم فقط)", [190, 22, 3, 10, 0.3, 1, 2.8, 480]),
  mkFood("شاورما لحم (لحم فقط)", [250, 21, 2, 18, 0.2, 1, 7, 450]),
  mkFood("فلافل مقلية", [330, 13.3, 31.8, 17.8, 4.9, 2.4, 2.4, 400]),
  mkFood("حمص بطحينة", [190, 7, 15, 11.5, 5, 0.6, 1.6, 300]),
  mkFood("متبل باذنجان", [140, 2.5, 8, 11.5, 3.5, 3.5, 1.6, 330]),
  mkFood("محمرة", [280, 5, 18, 21, 3, 8, 3, 450]),
  mkFood("تبولة", [95, 2, 10, 5.5, 3, 1.5, 0.8, 250]),
  mkFood("فتوش (بدون خبز مقلي)", [85, 1.5, 8, 5.5, 2, 3.5, 0.8, 200]),
  mkFood("سلطة عربية بزيت الزيتون", [55, 1, 5.5, 3.5, 1.5, 3, 0.5, 120]),
  mkFood("سلطة زبادي بالخيار", [55, 3, 4, 3, 0.4, 3.5, 1.9, 150]),
  mkFood("فتة حمص بالزبادي", [195, 8, 20, 9, 3.5, 3, 2.5, 330]),
  mkFood("مكدوس باذنجان", [240, 4, 7, 22, 3, 3, 3.4, 800]),
  mkFood("مخلل خيار", [12, 0.5, 2.3, 0.1, 1.2, 1.1, 0, 1100]),
  mkFood("مخلل لفت", [25, 1, 5, 0.1, 2, 3, 0, 1200]),
  mkFood("شوربة عدس", [65, 4, 10, 1, 2.5, 1.2, 0.2, 300]),
  mkFood("شوربة خضار", [35, 1, 6, 0.8, 1.5, 2.5, 0.1, 280]),
  mkFood("شوربة دجاج بالشعيرية", [40, 3, 4, 1, 0.3, 0.5, 0.3, 350]),
  mkFood("سمك مشوي (دنيس/قاروص)", [125, 22, 0, 3.5, 0, 0, 0.8, 90]),
  mkFood("سمك سلمون مشوي", [206, 22, 0, 12.4, 0, 0, 2.5, 60]),
  mkFood("فروج مشوي مع الجلد", [220, 26, 0, 12.5, 0, 0, 3.5, 85]),
  mkFood("فخاذ دجاج مشوية بدون جلد", [175, 25, 0, 8, 0, 0, 2.2, 90]),
  mkFood("لحم غنم مشوي", [250, 25, 0, 16, 0, 0, 7, 70]),
  mkFood("لحمة مفرومة مطبوخة بالبصل", [230, 22, 2, 15, 0.3, 1, 6, 400]),
  mkFood("مسخن (دجاج وبصل وخبز)", [230, 14, 22, 9, 2, 3, 2, 420]),
  mkFood("شكشوكة (بيض بالبندورة)", [110, 6.5, 5, 7, 1.2, 3.5, 2, 330]),
  mkFood("عدس بحامض", [70, 4.5, 11, 1.2, 3, 1.5, 0.2, 280]),
  mkFood("فول مدمس بالزيت والكمون", [130, 7, 16.5, 4.5, 5, 1.5, 0.7, 320]),
  mkFood("بيض مقلي", [196, 13.6, 0.8, 14.8, 0, 0.4, 4.2, 207]),
  mkFood("عجة بيض بالبقدونس", [175, 11, 3, 13, 0.5, 1, 3.5, 320]),
  mkFood("سمبوسك لحم مقلي", [280, 9, 25, 16, 1.5, 1, 4.5, 400])
];

const TURKISH_SAVORY = [
  mkFood("Bulgur Pilavı (Domatesli) - برغل ببندورة تركي", [115, 3.2, 19, 3.2, 3.5, 1.5, 0.5, 280]),
  mkFood("Nohut Yemeği (Yağlı) - حمص مطبوخ بالزيت", [165, 8.9, 27.4, 2.6, 7.6, 4.8, 0.3, 7]),
  mkFood("Nohut Yemeği (Etli) - حمص مطبوخ باللحمة", [195, 11, 22, 8, 6, 3, 2, 350]),
  mkFood("Kuru Fasulye Yemeği (Yağlı) - فاصولياء بيضاء بالزيت", [139, 9.7, 25, 0.4, 6.3, 0.3, 0.1, 6]),
  mkFood("Kuru Fasulye Yemeği (Etli) - فاصولياء بيضاء باللحمة", [155, 12, 20, 5, 5, 1, 2, 320]),
  mkFood("Patates Kızartması - بطاطا مقلية تركية", [312, 3.4, 41, 15, 3.8, 0.3, 2.3, 210]),
  mkFood("Karnıyarık - قر محشي باللحم", [120, 7, 10, 7, 3, 4, 2.5, 280]),
  mkFood("İmam Bayıldı - إمام بايلدي (باذنجان بالزيت)", [110, 2, 11, 7, 4, 5, 1, 250]),
  mkFood("Mücver - كوسا مبشورة مقلية", [140, 4, 12, 9, 2, 3, 2, 280]),
  mkFood("Kısır - كيسير (برغل بالبندورة والنعناع)", [130, 4, 22, 4, 3, 3, 0.5, 300]),
  mkFood("Mercimek Köftesi - كرات عدس حمراء", [145, 6, 20, 5, 5, 1, 0.7, 320]),
  mkFood("Etli Ekmek - عجين باللحم (أورفا)", [240, 10, 28, 10, 1.5, 2, 3.5, 400]),
  mkFood("Lahmacun - لحمة بعجين رقيق", [220, 9, 25, 10, 1.5, 1.5, 3.5, 380]),
  mkFood("Tavuk Şiş - شيش طاووق", [150, 24, 2.5, 5, 0.3, 1.5, 1.2, 420]),
  mkFood("Köfte (Izgara) - كفتة مشوية", [250, 17, 4, 18, 0.8, 1.5, 7, 480]),
  mkFood("Kuzu Tandır - لحم خروف تنور", [250, 25, 0, 16, 0, 0, 7, 70]),
  mkFood("Balık Izgara - سمك مشوي (دنيس/قاروص)", [125, 22, 0, 3.5, 0, 0, 0.8, 90]),
  mkFood("Hamsi Tava - أنشوجة مقلية", [180, 18, 8, 11, 0, 0, 2.5, 350]),
  mkFood("Simit - سميت تركي", [250, 7, 45, 5, 2, 1, 1, 400]),
  mkFood("Peynirli Poğaça - بوغاشا بالجبن", [280, 10, 30, 14, 1.5, 2, 8, 350]),
  mkFood("Kremalı Poğaça - بوغاشا بالكريمة", [310, 6, 35, 16, 0.5, 12, 9, 200]),
  mkFood("Kıymalı Poğaça - بوغاشا باللحم", [260, 12, 28, 12, 1.5, 1.5, 5, 380]),
  mkFood("Ispanaklı Peynirli Börek - بورك بسبانخ وجبن", [220, 8, 22, 12, 2, 1, 6, 400]),
  mkFood("Kıymalı Börek - بورك بلحم", [250, 11, 22, 14, 1.5, 1, 7, 420]),
  mkFood("Patatesli Börek - بورك بطاطس", [230, 5, 28, 12, 2, 1, 5, 350]),
  mkFood("Sucuklu Börek (Gül Böreği) - جول بورك (سجق)", [320, 10, 22, 22, 1, 1, 9, 550]),
  mkFood("Su Böreği - صفيحة بورك (بيد)", [240, 8, 32, 10, 1.5, 1.5, 4, 380]),
  mkFood("Peynirli Pide - بيد بالجبن", [270, 12, 30, 12, 1.5, 2, 7, 450]),
  mkFood("Kıymalı Pide (Kıymalı) - بيد باللحم", [260, 14, 28, 11, 1.5, 1.5, 5, 420]),
  mkFood("Sucuklu Pide - بيد بالسجق", [290, 11, 28, 16, 1, 1, 7, 500]),
  mkFood("Sebzeli Pide - بيد بالخضار", [230, 7, 32, 9, 2, 2, 3, 350]),
  mkFood("Ekmek (Akmaç) - أكماك (خبز تركي أبيض)", [265, 8, 52, 3, 2.5, 2, 0.5, 480]),
  mkFood("Bazlama - بازلاما (خبز رقيق)", [250, 7, 48, 4, 2, 1, 0.5, 450]),
  mkFood("Yufka - يوفكا (عجين رقيق)", [290, 9, 55, 5, 2.5, 1, 1, 350]),
  mkFood("Katımer / Katmer - قطايف تركية (قمح)", [280, 8, 50, 6, 2, 3, 2, 300]),
  mkFood("Ispanaklı Çiğ Börek / Haşhaşlı - فطائر سبانخ صغيرة", [210, 6, 25, 10, 2, 1, 4, 350]),
  mkFood("Peynirli Tepsi Böreği (Küçük) - فطائر جبن صغيرة", [240, 8, 24, 13, 1, 1, 7, 400]),
  mkFood("Zeytinyağlı / Kekikli Poğaça - فطائر زعتر", [270, 6, 32, 14, 3, 1, 3, 450]),
  mkFood("Zeytinli / Peynirli Pide Dilimleri - مناقيش زعتر", [250, 7, 35, 11, 3.5, 1, 2, 400]),
  mkFood("Peynirli Pide - مناقيش جبن", [280, 10, 30, 15, 2, 2, 8, 450]),
  mkFood("Kıymalı Pide - مناقيش لحمة", [270, 12, 28, 14, 1.5, 1.5, 6, 420]),
  mkFood("Humus (Türk Tarzı) - حمص بالطحينة (مسبحة تركية)", [166, 8, 14, 9.6, 6, 0, 1.3, 300]),
  mkFood("Acılı Ezme - إزمي حار (بندورة فلفل)", [55, 1.5, 7, 2.5, 2, 4, 0.3, 300]),
  mkFood("Haydari - هيداري (لبن نعناع ثوم)", [85, 4, 3, 6, 0.5, 2, 3.5, 180]),
  mkFood("Cacık - جاجيك (خيار لبن نعناع)", [45, 2, 3, 3, 0.5, 2, 1.8, 150]),
  mkFood("Muhammara - محمرة (فلفل جوز)", [140, 3, 10, 10, 2, 4, 1.5, 350]),
  mkFood("Baba Ghanoush - متبل باذنجان", [110, 2, 7, 8, 2.5, 3, 1.2, 280]),
  mkFood("Zeytin (Yeşil/Siyah) - زيتون أخضر/أسود", [145, 1, 3.8, 15.3, 3.3, 0, 2, 1100]),
  mkFood("Peynir Beyaz - جبنة بيضاء مالحة", [264, 14, 4, 21, 0, 4, 14.9, 1100]),
  mkFood("Lor Peyniri - لور (جبن قريش تركي)", [170, 18, 2, 10, 0, 2, 6, 300]),
  mkFood("Sucuk - سجق تركي", [420, 18, 2, 38, 0, 1, 14, 1200]),
  mkFood("Pastırma - باسترمة", [280, 32, 0.5, 16, 0, 0.5, 6, 1800]),
  mkFood("Kavurma - قورمة (لحم محفوظ)", [350, 25, 0, 28, 0, 0, 11, 800])
];

const SWEETS = [
  mkFood("Antep Fıstıklı Baklava - بقلاوة بالفستق", [430, 6, 45, 25, 2, 22, 8, 150]),
  mkFood("Cevizli Baklava - بقلاوة بالجوز", [410, 7, 44, 23, 3, 20, 7, 120]),
  mkFood("Künefe (Peynirli) - كنافة نابلسي بالجبن", [320, 8, 40, 15, 1, 25, 9, 300]),
  mkFood("Tel Kadayıf - كنافة خشنة (شعيرية)", [340, 6, 42, 17, 1.5, 28, 10, 200]),
  mkFood("Kadayıf Dolması (Ceviz/Kaymak) - قطايف محشية جوز/قشطة", [280, 5, 38, 12, 1.5, 20, 7, 180]),
  mkFood("Kızarmış Kadayıf - قطايف مقلية بالسكر", [310, 4, 42, 14, 1, 25, 8, 150]),
  mkFood("Lokma - شوبك بالسكر (لقيمات)", [350, 5, 45, 17, 1, 22, 9, 200]),
  mkFood("Lokma Tatlısı - لقيمات بالقطر", [330, 4, 48, 15, 0.5, 28, 8, 120]),
  mkFood("Awameh - عوامة (لقيمات شامية)", [320, 4, 46, 14, 0.5, 26, 8, 100]),
  mkFood("Zalabia - زلابيا", [340, 5, 50, 14, 1, 25, 8, 150]),
  mkFood("Peynirli Künefe - حلوى الجبن (كنافة جبن)", [290, 10, 35, 13, 0.5, 18, 8, 320]),
  mkFood("Şöbiyet - شعيبيات كريمة", [300, 5, 38, 15, 0.5, 20, 9, 180]),
  mkFood("Bademli Şam Tatlısı - بادملي شام تاتليسي (لوز+سميد+قشطة)", [350, 6, 42, 18, 1.5, 22, 8, 180]),
  mkFood("Barazeq (Suriye) - برازق سورية بالسمسم", [420, 7, 50, 22, 3.5, 20, 4, 200]),
  mkFood("Kuru Kaymaklı / Güllac - غريبة سمنة", [480, 5, 55, 27, 1, 25, 16, 80]),
  mkFood("Hurma Dolmalı Ma'amoul - معمول تمر", [320, 4, 50, 12, 3, 30, 6, 100]),
  mkFood("Fıstıklı Ma'amoul - معمول فستق", [380, 6, 42, 22, 2.5, 18, 8, 80]),
  mkFood("Cevizli Ma'amoul - معمول جوز", [360, 5, 44, 20, 3, 22, 7, 90]),
  mkFood("Kleicha - كليجة عراقية/تركية", [340, 5, 48, 15, 2.5, 25, 7, 120]),
  mkFood("Tahin Helvası (Sade) - حلاوة طحينية سادة", [510, 13, 30, 38, 4, 28, 6, 200]),
  mkFood("Tahin Helvası (Fıstıklı) - حلاوة طحينية فستق", [520, 14, 28, 39, 3.5, 25, 7, 180]),
  mkFood("Tahin Helvası (Kakaolu) - حلاوة طحينية كاكاو", [500, 12, 35, 35, 3, 30, 8, 150]),
  mkFood("Rahat Helvası - طحينة بالسكر (راهات)", [480, 12, 32, 36, 3.5, 28, 7, 180]),
  mkFood("Lokum (Sade) - راحة حلقوم سادة", [370, 0.5, 90, 0.2, 0, 85, 0, 50]),
  mkFood("Lokum (Fıstıklı) - راحة حلقوم فستق", [380, 2, 88, 5, 0.5, 80, 1, 60]),
  mkFood("Lokum (Cevizli) - راحة حلقوم جوز", [390, 3, 86, 6, 0.5, 78, 1, 70]),
  mkFood("Şekerpare - شكر باره", [380, 4, 55, 16, 1, 30, 6, 150]),
  mkFood("Sütlaç - مهلبية أرز / سوتلاچ", [110, 2.5, 18, 3, 0.2, 14, 1.5, 50]),
  mkFood("Muhallebi (Niğeli) - مهلبية نشا", [100, 2, 18, 2.5, 0, 15, 1.5, 45]),
  mkFood("Çikolatalı Muhallebi - مهلبية شوكولاتة", [130, 2.5, 20, 4.5, 0.5, 18, 2.5, 50]),
  mkFood("Krema / Pastane Kreması - كسترد (كريمة باتيسيري)", [140, 3, 18, 6, 0, 16, 3.5, 60]),
  mkFood("Tavuk Göğsü - أرز بحليب / طاووق غوغسو", [120, 3, 20, 3.5, 0.3, 16, 2, 55]),
  mkFood("Kazandibi - كازاندبي (قشطة محروقة)", [180, 3, 25, 7, 0.2, 22, 4, 70]),
  mkFood("Tavuk Göğsü Üzeri Kaymak - طربوش (قشطة بالسكر)", [200, 3, 22, 11, 0, 20, 6, 60]),
  mkFood("Kaymaklı Tatlı - قشطة بالقشطة (قشطة عربية)", [340, 2.5, 3.5, 35, 0, 3.5, 22, 30]),
  mkFood("Sütlaç Şerbetli - مغلي حليب بالسكر", [130, 3, 18, 5, 0, 17, 3, 50]),
  mkFood("Lorlu Cheesecake - تشيز كيك تركي (لور باير)", [280, 6, 30, 16, 0.5, 22, 9, 200]),
  mkFood("Trileçe - ترايلوفا (كعكة 3 ألبان)", [250, 5, 32, 12, 0.3, 28, 7, 150]),
  mkFood("San Sebastian Cheesecake - سان سيباستيان تشيز كيك", [320, 5, 25, 24, 0.2, 22, 14, 180]),
  mkFood("Çikolatalı Mus - موس شوكولاتة", [220, 3, 22, 14, 1, 20, 8, 50]),
  mkFood("Meyveli Mus - موس فواكه", [180, 2, 28, 7, 1, 25, 4, 30]),
  mkFood("Tiramisu (Türk Tarzı) - تيراميسو تركي", [290, 4, 30, 17, 0.5, 24, 10, 100]),
  mkFood("Profiterol - بروكلير (فطائر كريمة)", [260, 4, 28, 16, 0.5, 18, 9, 150]),
  mkFood("Ekler - إكلير كريمة", [250, 4, 26, 15, 0.5, 16, 8, 120]),
  mkFood("Mille-feuille - ميل فوي (أوراق عجين بالكريمة)", [340, 5, 32, 22, 1, 18, 12, 180]),
  mkFood("Dondurma (Maraş Dondurması) - آيس كريم تركي (دوندرما)", [180, 3.5, 22, 8, 0, 20, 5, 60]),
  mkFood("Fıstıklı Dondurma - آيس كريم فستق", [200, 4, 20, 11, 0.5, 18, 6, 50]),
  mkFood("Salep Dondurma - آيس كريم سحلب", [170, 3, 24, 7, 0, 22, 4, 50]),
  mkFood("Bayram Kurabiyesi (Büyük Ma'amoul) - كعك عيد (معمول كبير)", [350, 5, 48, 16, 2.5, 22, 7, 120]),
  mkFood("Susamlı Kurabiye - كعك بالسمسم (كعك عجلون)", [340, 6, 46, 15, 3, 18, 5, 200]),
  mkFood("Çay Kurabiyesi - بسكويت شاي تركي", [420, 6, 60, 18, 2, 25, 8, 250]),
  mkFood("Tereyağlı Kurabiye - بسكويت زبدة", [480, 5, 58, 25, 1.5, 28, 15, 200]),
  mkFood("Çikolatalı Kurabiye - كوكيز شوكولاتة", [460, 5, 55, 24, 2, 30, 13, 180]),
  mkFood("كنافة سورية", [310, 7, 38, 16, 1, 24, 8, 280]),
  mkFood("قطايف سورية", [270, 5, 35, 13, 1.5, 18, 6, 150]),
  mkFood("عوامة سورية", [310, 4, 44, 14, 0.5, 24, 7, 100]),
  mkFood("زلابيا سورية", [330, 5, 48, 14, 1, 26, 8, 120]),
  mkFood("Kadayıf (Hurmalı) - قطايف بالعجوة", [260, 4, 48, 7, 3, 30, 3, 100]),
  mkFood("Ramazan Zalabiyesi - زلابيا رمضان", [330, 5, 52, 13, 1, 28, 7, 150]),
  mkFood("Hoşaf - خشاف (فواكه مجففة منقوعة)", [180, 2, 45, 0.5, 4, 40, 0, 15])
];

const DRINKS = [
  mkFood("Türk Kahvesi (Sade) - قهوة تركية (سادة)", [2, 0.1, 0, 0, 0, 0, 0, 2]),
  mkFood("Türk Kahvesi (Orta Şekerli) - قهوة تركية بالسكر (متوسط)", [40, 0.1, 10, 0, 0, 10, 0, 2]),
  mkFood("Çay (Sade) - شاي تركي (كوب سادة)", [1, 0, 0.3, 0, 0, 0, 0, 1]),
  mkFood("Çay (Şekerli) - شاي تركي بالسكر (ملعقة)", [35, 0, 9, 0, 0, 9, 0, 1]),
  mkFood("Salep (Sıcak) - سحلب ساخن", [140, 3, 22, 4.5, 0.5, 18, 2.5, 60]),
  mkFood("Salep Tozu (Hazır) - سحلب بودرة جاهز (100غ)", [360, 2, 85, 2, 1, 80, 1, 300]),
  mkFood("Kakao Tozu (Şekersiz) - كاكاو باودر خام غير محلى", [228, 20, 58, 14, 33, 1.8, 8.1, 21]),
  mkFood("قمر الدين (مشروب)", [220, 1, 53, 0.2, 2, 48, 0, 10]),
  mkFood("تمر هندي", [60, 0.5, 15, 0, 1, 13, 0, 20]),
  mkFood("عرق سوس", [20, 0.2, 4.5, 0, 0.5, 4, 0, 5]),
  mkFood("جلياب", [180, 1, 44, 0, 0.5, 42, 0, 15]),
  mkFood("ليموناضة", [40, 0.2, 10, 0, 0.2, 9, 0, 5]),
  mkFood("عصير برتقال طازج", [45, 0.7, 10.4, 0.2, 0.3, 8.4, 0, 1]),
  mkFood("عصير رمان", [54, 0.3, 13, 0.1, 0.1, 11, 0, 2]),
  mkFood("عصير جزر", [40, 0.9, 9, 0.2, 2.8, 3.9, 0, 30]),
  mkFood("أمريكانو سادة", [2, 0, 0, 0, 0, 0, 0, 2]),
  mkFood("قهوة عربية سادة", [1, 0.1, 0, 0, 0, 0, 0, 2]),
  mkFood("نسكافيه سادة", [2, 0.1, 0.5, 0, 0, 0.5, 0, 3]),
  mkFood("شاي أخضر", [1, 0, 0.3, 0, 0, 0, 0, 1]),
  mkFood("شاي أعشاب (نعنع/بابونج)", [0, 0, 0, 0, 0, 0, 0, 1]),
  mkFood("ماء", [0, 0, 0, 0, 0, 0, 0, 1]),
  mkFood("ماء معدني", [0, 0, 0, 0, 0, 0, 0, 2]),
  mkFood("مشروب طاقة (بدون سكر)", [5, 0, 1, 0, 0, 0, 0, 10]),
  mkFood("مشروب رياضي", [25, 0, 6, 0, 0, 6, 0, 150])
];

const DAIRY_HONEY_NAMES = ["حليب كامل الدسم", "عسل نحل", "قشطة البيم الجاهزة - كايماك", "قشطة الحليب المغلي على الوجه"];

// Build categories
function byAr(a, b) { return a.name.localeCompare(b.name, "ar"); }
const BASE_SAVORY = SAVORY_FOODS.filter(x => !x.custom);
export const CUSTOM_FOOD = SAVORY_FOODS.find(x => x.custom);

// "أكلاتي": the user's saved custom foods (per 100 g). Filled at runtime by syncMyFoods().
const MY_CATEGORY = { id: "mine", label: "⭐ أكلاتي", items: [] };

export const FOOD_CATEGORIES = [
  MY_CATEGORY,
  { id: "basic", label: "🍗 أطعمة أساسية", items: [...BASE_SAVORY, ...STAPLES].sort(byAr) },
  { id: "syrian", label: "🥘 أكلات سورية", items: [...SYRIAN_FOODS].sort(byAr) },
  { id: "turkish", label: "🇹🇷 أكلات تركية (مالح فقط)", items: [...TURKISH_SAVORY].sort(byAr) },
  { id: "fruit", label: "🍎 الفواكه", items: [...SWEET_DAIRY_FOODS.filter(f => !DAIRY_HONEY_NAMES.includes(f.name)), ...FRUITS_MORE].sort(byAr) },
  { id: "vegetables", label: "🥕 الخضار", items: [...VEGETABLES].sort(byAr) },
  { id: "dairy", label: "🥛 ألبان وأجبان وعسل وقشطة", items: [...SWEET_DAIRY_FOODS.filter(f => DAIRY_HONEY_NAMES.includes(f.name)), ...DAIRY_MORE].sort(byAr) },
  { id: "nuts_seeds", label: "🌰 مكسرات وبذور ومنتجات", items: [...NUTS_SEEDS].sort(byAr) },
  { id: "fats_oils", label: "🧈 دهون وزيوت وزبدة", items: [...FATS_OILS].sort(byAr) },
  { id: "sweets", label: "🍬 حلويات (شاملة)", items: [...SWEETS].sort(byAr) },
  { id: "drinks", label: "☕ مشروبات (شاملة)", items: [...DRINKS].sort(byAr) }
];

FOOD_CATEGORIES.forEach(c => c.items.forEach(f => { f.category = c.id; }));
export const ALL_FOOD_ITEMS = FOOD_CATEGORIES.flatMap(c => c.items).sort(byAr);
export const FOOD_BY_NAME = {};
ALL_FOOD_ITEMS.forEach(f => { FOOD_BY_NAME[f.name] = f; });

const MY_KEYS = ["cal", "pro", "carb", "fat", "fib", "sug", "sat", "sod"];

/**
 * Rebuilds the "أكلاتي" category from saved entries ({name, cal, pro, ... per 100 g}).
 * Mutates ALL_FOOD_ITEMS / FOOD_BY_NAME / the category in place, so every module that
 * imported them (calculator, meal editor, program editor) sees the update.
 * A saved food never shadows a built-in food of the same name in FOOD_BY_NAME.
 */
export function syncMyFoods(list) {
  MY_CATEGORY.items.forEach(f => { if (FOOD_BY_NAME[f.name] === f) delete FOOD_BY_NAME[f.name]; });
  const rest = ALL_FOOD_ITEMS.filter(f => !f.mine);
  const items = list.map(x => {
    const v = { mine: true, category: "mine", allergens: [], source: "custom" };
    MY_KEYS.forEach(k => { v[k] = x[k] || 0; });
    return mkFood(x.name, v);
  }).sort(byAr);
  MY_CATEGORY.items.splice(0, MY_CATEGORY.items.length, ...items);
  ALL_FOOD_ITEMS.splice(0, ALL_FOOD_ITEMS.length, ...rest, ...items);
  ALL_FOOD_ITEMS.sort(byAr);
  items.forEach(f => { if (!FOOD_BY_NAME[f.name]) FOOD_BY_NAME[f.name] = f; });
}
