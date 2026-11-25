// Daily programs (gym / rest / sat)

export const PROGRAMS = {
  gym: {
    label: "أيام النادي (تمرين 7:05 م)",
    waterGoal: 3250,
    calGoal: 1850,
    proGoal: 140,
    tasks: [
      { id: "p1", baseMins: 8 * 60 + 0, text: "💊 الدواء الصباحي: بينتاسا + مي صافية", water: 250 },
      { id: "m1", baseMins: 8 * 60 + 30, text: "🍵 المشروب الصباحي الدافئ", sub: "ماء دافئ + نصف ليمونة + نصف م.ص زنجبيل + قرفة + كركم", water: 200, eatMins: 0, lock: 30 },
      { id: "bf", baseMins: 9 * 60 + 0, text: "🍽️ وجبة الفطور", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "بيض كامل مسلوق", grams: 110, cal100: 143, pro100: 12.6 },
          { name: "بياض بيض مسلوق", grams: 66, cal100: 52, pro100: 11 },
          { name: "بطاطا مسلوقة سادة", grams: 150, cal100: 87, pro100: 2 },
          { name: "لبن رايب", grams: 150, cal100: 60, pro100: 3.5 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 },
          { name: "يوسفي", grams: 125, cal100: 53, pro100: 0.8 }
        ]
      },
      { id: "w_10", baseMins: 10 * 60 + 0, text: "💧 فتح باب المي: رشفات هادية", water: 250 },
      { id: "c1", baseMins: 11 * 60 + 0, text: "☕ كافيين (1): أمريكانو 100 مل + مي فوراً", water: 150 },
      { id: "w_12", baseMins: 12 * 60 + 15, text: "💧 ترطيب الظهر: مي صافية", water: 200 },
      { id: "w_13", baseMins: 13 * 60 + 25, text: "💧 ترطيب ما قبل الغداء (بدون دواء)", water: 200, eatMins: 0, lock: 35 },
      { id: "ln", baseMins: 14 * 60 + 0, text: "🍽️ وجبة الغداء (الحصة الكاملة)", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "برغل مطبوخ سادة", grams: 200, cal100: 86, pro100: 3 },
          { name: "صدور دجاج مسلوقة/مشوية", grams: 200, cal100: 165, pro100: 31 },
          { name: "سلطة خضراء مشكلة", grams: 200, cal100: 20, pro100: 1 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 },
          { name: "تفاح", grams: 125, cal100: 52, pro100: 0.3 }
        ]
      },
      { id: "w_15", baseMins: 15 * 60 + 5, text: "💧 فتح باب المي: رشفات هادية", water: 250 },
      { id: "c2", baseMins: 16 * 60 + 0, text: "☕ كافيين (2): أمريكانو 100 مل + مي (آخر كافيين)", water: 150 },
      { id: "w_17", baseMins: 17 * 60 + 0, text: "💧 ترطيب العصر: مي صافية", water: 200 },
      { id: "w_work", baseMins: 17 * 60 + 50, text: "💧 تقفيلة مي الشغل", water: 150, eatMins: 0, lock: 30 },
      { id: "gym_snack", baseMins: 18 * 60 + 20, text: "🥔 وجبة قبل التمرين", eatMins: 10, lock: 45,
        defaultItems: [
          { name: "بطاطا مسلوقة سادة", grams: 110, cal100: 87, pro100: 2 },
          { name: "تمر", grams: 24, cal100: 280, pro100: 2.5 },
          { name: "جوز نيء", grams: 15, cal100: 654, pro100: 15 }
        ]
      },
      { id: "gym", baseMins: 19 * 60 + 5, text: "💪 تمرين النادي + مي رشفات (بعد 10 د إحماء)", water: 850 },
      { id: "p2", baseMins: 20 * 60 + 50, text: "💊 الدواء المسائي: بينتاسا + مي صافية", water: 200 },
      { id: "dn", baseMins: 21 * 60 + 10, text: "🍽️ العشاء / بعد التمرين", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "تونة مصفاة", grams: 104, cal100: 115, pro100: 25 },
          { name: "سلطة خضراء مشكلة", grams: 250, cal100: 20, pro100: 1 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 },
          { name: "كيوي", grams: 100, cal100: 61, pro100: 1.1 }
        ]
      },
      { id: "night_snack", baseMins: 22 * 60 + 5, text: "🥜 تقفيلة المي والمكسرات التكميلية", water: 250,
        defaultItems: [
          { name: "لوز نيء", grams: 12, cal100: 579, pro100: 21 }
        ]
      },
      { id: "mes", baseMins: 22 * 60 + 50, text: "🛌 تفريغ الأمعاء والمثانة + حقنة الميسوسيل والنوم" }
    ]
  },

  sat: {
    label: "برنامج السبت (تمرين 2:00 ظ)",
    waterGoal: 3250,
    calGoal: 1850,
    proGoal: 140,
    tasks: [
      { id: "p1", baseMins: 8 * 60 + 0, text: "💊 الدواء الصباحي: بينتاسا + مي صافية", water: 250 },
      { id: "m1", baseMins: 8 * 60 + 30, text: "🍵 المشروب الصباحي الدافئ", sub: "ماء دافئ + نصف ليمونة + زنجبيل + قرفة + كركم", water: 200, eatMins: 0, lock: 30 },
      { id: "bf", baseMins: 9 * 60 + 0, text: "🍽️ وجبة الفطور", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "بيض كامل مسلوق", grams: 110, cal100: 143, pro100: 12.6 },
          { name: "بياض بيض مسلوق", grams: 66, cal100: 52, pro100: 11 },
          { name: "بطاطا مسلوقة سادة", grams: 150, cal100: 87, pro100: 2 },
          { name: "لبن رايب", grams: 150, cal100: 60, pro100: 3.5 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 },
          { name: "يوسفي", grams: 125, cal100: 53, pro100: 0.8 }
        ]
      },
      { id: "w_10", baseMins: 10 * 60 + 0, text: "💧 فتح باب المي: رشفات هادية", water: 250 },
      { id: "c1", baseMins: 11 * 60 + 0, text: "☕ كافيين (1): أمريكانو 100 مل + مي صافية", water: 150 },
      { id: "w_12", baseMins: 12 * 60 + 0, text: "💧 ترطيب ما قبل الوجبة", water: 200, eatMins: 0, lock: 30 },
      { id: "gym_snack", baseMins: 12 * 60 + 30, text: "🥔 وجبة قبل التمرين (قبل النادي بـ 90 د)", eatMins: 10, lock: 45,
        defaultItems: [
          { name: "بطاطا مسلوقة سادة", grams: 110, cal100: 87, pro100: 2 },
          { name: "تمر", grams: 24, cal100: 280, pro100: 2.5 },
          { name: "جوز نيء", grams: 15, cal100: 654, pro100: 15 }
        ]
      },
      { id: "w_pre_gym", baseMins: 13 * 60 + 15, text: "💧 تجهيز التمرين: مي قبل النزول عالنادي", water: 150 },
      { id: "gym", baseMins: 14 * 60 + 0, text: "💪 تمرين النادي + مي رشفات (بعد 10 د إحماء)", water: 850 },
      { id: "ln", baseMins: 15 * 60 + 45, text: "🍽️ الوجبة الرئيسية (بعد التمرين)", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "برغل مطبوخ سادة", grams: 200, cal100: 86, pro100: 3 },
          { name: "صدور دجاج مسلوقة/مشوية", grams: 200, cal100: 165, pro100: 31 },
          { name: "سلطة خضراء مشكلة", grams: 200, cal100: 20, pro100: 1 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 },
          { name: "تفاح", grams: 125, cal100: 52, pro100: 0.3 }
        ]
      },
      { id: "c2", baseMins: 16 * 60 + 50, text: "💧 فتح المي + كافيين (2) أمريكانو 100 مل", water: 250 },
      { id: "w_18", baseMins: 18 * 60 + 15, text: "💧 ترطيب المسا (1): مي صافية", water: 250 },
      { id: "w_19", baseMins: 19 * 60 + 30, text: "💧 ترطيب المسا (2): مي صافية", water: 250 },
      { id: "p2", baseMins: 20 * 60 + 50, text: "💊 الدواء المسائي: بينتاسا + مي صافية", water: 200 },
      { id: "dn", baseMins: 21 * 60 + 10, text: "🍽️ وجبة العشاء", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "تونة مصفاة", grams: 104, cal100: 115, pro100: 25 },
          { name: "سلطة خضراء مشكلة", grams: 250, cal100: 20, pro100: 1 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 },
          { name: "كيوي", grams: 100, cal100: 61, pro100: 1.1 }
        ]
      },
      { id: "night_snack", baseMins: 22 * 60 + 5, text: "🥜 تقفيلة المي والمكسرات التكميلية", water: 250,
        defaultItems: [
          { name: "لوز نيء", grams: 12, cal100: 579, pro100: 21 }
        ]
      },
      { id: "mes", baseMins: 22 * 60 + 50, text: "🛌 تفريغ الأمعاء والمثانة + حقنة الميسوسيل والنوم" }
    ]
  },

  rest: {
    label: "يوم راحة (الخميس والأحد)",
    waterGoal: 3000,
    calGoal: 1650,
    proGoal: 135,
    tasks: [
      { id: "p1", baseMins: 8 * 60 + 0, text: "💊 الدواء الصباحي: بينتاسا + مي صافية", water: 250 },
      { id: "m1", baseMins: 8 * 60 + 30, text: "🍵 المشروب الصباحي الدافئ", sub: "ماء دافئ + نصف ليمونة + زنجبيل + قرفة + كركم", water: 200, eatMins: 0, lock: 30 },
      { id: "bf", baseMins: 9 * 60 + 0, text: "🍽️ الفطور المعتاد", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "بيض كامل مسلوق", grams: 110, cal100: 143, pro100: 12.6 },
          { name: "بياض بيض مسلوق", grams: 66, cal100: 52, pro100: 11 },
          { name: "بطاطا مسلوقة سادة", grams: 150, cal100: 87, pro100: 2 },
          { name: "لبن رايب", grams: 150, cal100: 60, pro100: 3.5 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 }
        ]
      },
      { id: "fr1", baseMins: 10 * 60 + 0, text: "🍊 فتح باب المي + فاكهة (1)", water: 250,
        defaultItems: [
          { name: "يوسفي", grams: 125, cal100: 53, pro100: 0.8 }
        ]
      },
      { id: "c1", baseMins: 11 * 60 + 0, text: "☕ كافيين (1): أمريكانو 100 مل + مي فوراً", water: 150 },
      { id: "w_12", baseMins: 12 * 60 + 15, text: "💧 ترطيب الظهر: مي صافية", water: 250 },
      { id: "w_13", baseMins: 13 * 60 + 25, text: "💧 ترطيب ما قبل الغداء (بدون دواء)", water: 200, eatMins: 0, lock: 35 },
      { id: "ln", baseMins: 14 * 60 + 0, text: "🍽️ الغداء (معدّل ليوم الراحة: 150غ برغل)", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "برغل مطبوخ سادة", grams: 150, cal100: 86, pro100: 3 },
          { name: "صدور دجاج مسلوقة/مشوية", grams: 200, cal100: 165, pro100: 31 },
          { name: "سلطة خضراء مشكلة", grams: 200, cal100: 20, pro100: 1 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 }
        ]
      },
      { id: "fr2", baseMins: 15 * 60 + 0, text: "🍏 فتح باب المي + فاكهة (2)", water: 250,
        defaultItems: [
          { name: "تفاح", grams: 125, cal100: 52, pro100: 0.3 }
        ]
      },
      { id: "c2", baseMins: 16 * 60 + 0, text: "☕ كافيين (2): أمريكانو 100 مل + مي (آخر كافيين)", water: 150 },
      { id: "w_17", baseMins: 17 * 60 + 0, text: "💧 ترطيب العصر: مي صافية", water: 250, eatMins: 0, lock: 30 },
      { id: "rest_snack", baseMins: 17 * 60 + 30, text: "🍌 سناك العصر (يوم الراحة — بدون بطاطا)", eatMins: 10, lock: 45,
        defaultItems: [
          { name: "تمر", grams: 24, cal100: 280, pro100: 2.5 },
          { name: "جوز نيء", grams: 15, cal100: 654, pro100: 15 },
          { name: "موز", grams: 80, cal100: 89, pro100: 1.1 }
        ]
      },
      { id: "w_18", baseMins: 18 * 60 + 45, text: "💧 ترطيب المسا (1): مي رشفات هادية", water: 300 },
      { id: "w_19", baseMins: 19 * 60 + 50, text: "💧 ترطيب المسا (2): مي صافية", water: 250 },
      { id: "p2", baseMins: 20 * 60 + 50, text: "💊 الدواء المسائي: بينتاسا + مي صافية", water: 250 },
      { id: "dn", baseMins: 21 * 60 + 10, text: "🍽️ العشاء + فاكهة (3)", eatMins: 15, lock: 45,
        defaultItems: [
          { name: "تونة مصفاة", grams: 104, cal100: 115, pro100: 25 },
          { name: "سلطة خضراء مشكلة", grams: 250, cal100: 20, pro100: 1 },
          { name: "زيت زيتون", grams: 5, cal100: 884, pro100: 0 },
          { name: "كيوي", grams: 100, cal100: 61, pro100: 1.1 }
        ]
      },
      { id: "night_snack", baseMins: 22 * 60 + 5, text: "🥜 تقفيلة المي والمكسرات (10–15غ)", water: 250,
        defaultItems: [
          { name: "لوز نيء", grams: 12, cal100: 579, pro100: 21 }
        ]
      },
      { id: "mes", baseMins: 22 * 60 + 50, text: "🛌 تفريغ الأمعاء والمثانة + حقنة الميسوسيل والنوم" }
    ]
  }
};
