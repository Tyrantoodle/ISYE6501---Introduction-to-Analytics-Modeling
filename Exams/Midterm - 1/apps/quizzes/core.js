(function () {
  'use strict';
  function clean(q, value) {
    if (q.type === 'blank') return typeof value === 'string' ? value.slice(0, 2000) : '';
    const allowed = q.type === 'tf' ? ['True', 'False'] : q.options.map((_, i) => String.fromCharCode(65 + i));
    const selected = Array.isArray(value) ? [...new Set(value)].filter(v => allowed.includes(v)).sort() : [];
    return q.type === 'multi' ? selected : selected.slice(0, 1);
  }
  function answered(q, value) {
    value = clean(q, value);
    return q.type === 'blank' ? !!value.trim() : value.length > 0;
  }
  function grade(q, value, key) {
    if (q.type === 'blank') return null; // Semantic equivalence requires self-checking.
    const actual = clean(q, value).join('');
    const expected = q.type === 'tf' ? key : key.split('').sort().join('');
    return actual === expected;
  }
  function draft(questions, raw) {
    const result = Object.create(null);
    const valid = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    questions.forEach(q => {result[q.id] = clean(q, valid[q.id]);});
    return result;
  }
  window.QuizCore = Object.freeze({clean, answered, grade, draft});
})();
