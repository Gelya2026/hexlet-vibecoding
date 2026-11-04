// Логика расчёта калорий. Работает и в браузере (window.CalorieCalc), и в Node (module.exports).
(function (root) {
  const ACTIVITY_LEVELS = {
    sedentary: { factor: 1.2, label: 'Минимальная (сидячая работа, нет тренировок)' },
    light: { factor: 1.375, label: 'Низкая (тренировки 1–3 раза в неделю)' },
    moderate: { factor: 1.55, label: 'Средняя (тренировки 3–5 раз в неделю)' },
    high: { factor: 1.725, label: 'Высокая (тренировки 6–7 раз в неделю)' },
    extreme: { factor: 1.9, label: 'Очень высокая (физическая работа + спорт)' },
  };

  const GOALS = {
    lose: { delta: -0.2, label: 'Похудение' },
    maintain: { delta: 0, label: 'Поддержание веса' },
    gain: { delta: 0.15, label: 'Набор массы' },
  };

  // Доля калорий: белки / жиры / углеводы
  const MACRO_SPLIT = {
    lose: { protein: 0.3, fat: 0.3, carbs: 0.4 },
    maintain: { protein: 0.25, fat: 0.3, carbs: 0.45 },
    gain: { protein: 0.25, fat: 0.25, carbs: 0.5 },
  };

  const KCAL_PER_GRAM = { protein: 4, fat: 9, carbs: 4 };

  function validate({ sex, age, weight, height, activity, goal }) {
    const errors = [];
    if (sex !== 'male' && sex !== 'female') errors.push('Укажите пол');
    if (!Number.isFinite(age) || age < 14 || age > 100) errors.push('Возраст должен быть от 14 до 100 лет');
    if (!Number.isFinite(weight) || weight < 30 || weight > 300) errors.push('Вес должен быть от 30 до 300 кг');
    if (!Number.isFinite(height) || height < 100 || height > 250) errors.push('Рост должен быть от 100 до 250 см');
    if (!ACTIVITY_LEVELS[activity]) errors.push('Выберите уровень активности');
    if (!GOALS[goal]) errors.push('Выберите цель');
    return errors;
  }

  // Формула Миффлина — Сан Жеора
  function bmr({ sex, age, weight, height }) {
    const base = 10 * weight + 6.25 * height - 5 * age;
    return sex === 'male' ? base + 5 : base - 161;
  }

  function calculate(input) {
    const errors = validate(input);
    if (errors.length > 0) return { ok: false, errors };

    const basal = bmr(input);
    const tdee = basal * ACTIVITY_LEVELS[input.activity].factor;
    const target = tdee * (1 + GOALS[input.goal].delta);

    const split = MACRO_SPLIT[input.goal];
    const macros = {};
    for (const key of Object.keys(split)) {
      macros[key] = Math.round((target * split[key]) / KCAL_PER_GRAM[key]);
    }

    const heightM = input.height / 100;
    const bmi = input.weight / (heightM * heightM);

    return {
      ok: true,
      bmr: Math.round(basal),
      tdee: Math.round(tdee),
      target: Math.round(target),
      macros,
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory: bmiCategory(bmi),
    };
  }

  function bmiCategory(bmi) {
    if (bmi < 18.5) return 'Недостаточный вес';
    if (bmi < 25) return 'Норма';
    if (bmi < 30) return 'Избыточный вес';
    return 'Ожирение';
  }

  const api = { ACTIVITY_LEVELS, GOALS, MACRO_SPLIT, validate, bmr, calculate, bmiCategory };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.CalorieCalc = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
