const test = require('node:test');
const assert = require('node:assert/strict');
const { bmr, calculate, bmiCategory } = require('./calc.js');

const base = { sex: 'male', age: 30, weight: 80, height: 180, activity: 'moderate', goal: 'maintain' };

test('BMR по Миффлину — Сан Жеору', () => {
  assert.equal(bmr(base), 1780); // 800 + 1125 - 150 + 5
  assert.equal(bmr({ ...base, sex: 'female' }), 1614); // 800 + 1125 - 150 - 161
});

test('расход с учётом активности и цели', () => {
  const r = calculate(base);
  assert.equal(r.ok, true);
  assert.equal(r.tdee, 2759); // 1780 * 1.55
  assert.equal(r.target, 2759);
  assert.equal(calculate({ ...base, goal: 'lose' }).target, 2207); // -20%
  assert.equal(calculate({ ...base, goal: 'gain' }).target, 3173); // +15%
});

test('БЖУ в граммах', () => {
  const { macros } = calculate(base);
  assert.deepEqual(macros, { protein: 172, fat: 92, carbs: 310 });
});

test('ИМТ', () => {
  const r = calculate(base);
  assert.equal(r.bmi, 24.7);
  assert.equal(r.bmiCategory, 'Норма');
  assert.equal(bmiCategory(17), 'Недостаточный вес');
  assert.equal(bmiCategory(32), 'Ожирение');
});

test('валидация', () => {
  const r = calculate({ ...base, age: NaN, weight: 10 });
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 2);
});
