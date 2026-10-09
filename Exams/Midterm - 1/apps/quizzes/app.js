(function () {
  'use strict';
  const el = id => document.getElementById(id);
  let quiz = 0, answers, reviewing = false, busy = false;
  const core = window.QuizCore;
  const data = window.QUIZ_QUESTIONS;
  let answerPromise = null;
  const drafts = Object.create(null);
  function error(message) { el('error').textContent = message; el('error').hidden = !message; }
  function loadAnswers() {
    if (window.QUIZ_ANSWERS) return Promise.resolve(window.QUIZ_ANSWERS);
    if (answerPromise) return answerPromise;
    answerPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'answers.js';
      const timer = setTimeout(() => {script.remove(); reject(new Error('Answer key timed out'));}, 15000);
      script.onload = () => {clearTimeout(timer); script.remove(); window.QUIZ_ANSWERS ? resolve(window.QUIZ_ANSWERS) : reject(new Error('Missing answer key'));};
      script.onerror = () => {clearTimeout(timer); script.remove(); reject(new Error('Answer key could not load'));};
      document.head.appendChild(script);
    }).catch(e => {answerPromise = null; throw e;});
    return answerPromise;
  }
  function readDraft() {
    if (drafts[quiz]) return core.draft(data[quiz], drafts[quiz]);
    try {return core.draft(data[quiz], JSON.parse(localStorage.getItem('isye6501-mt1-quiz-v2-' + quiz)));}
    catch (_) {return core.draft(data[quiz], null);}
  }
  function save() {
    drafts[quiz] = core.draft(data[quiz], answers);
    try {
      localStorage.setItem('isye6501-mt1-quiz-v2-' + quiz, JSON.stringify(answers));
      el('save-status').textContent = 'Draft saved in this browser.';
    } catch (_) {el('save-status').textContent = 'Browser storage is unavailable. Your draft stays here until this page closes.';}
    const count = data[quiz].filter(q => core.answered(q, answers[q.id])).length;
    el('progress').textContent = count + ' of 50 answered. Unanswered questions may be submitted.';
  }
  function render() {
    reviewing = false; error(''); answers = readDraft();
    el('quiz-form').hidden = false; el('results').hidden = true; el('reviews').replaceChildren();
    el('questions').replaceChildren();
    data[quiz].forEach((q, index) => {
      const field = document.createElement('fieldset');
      const legend = document.createElement('legend'); legend.textContent = (index + 1) + '. ' + q.topic + ' · ' + ({multi:'Select all that apply',single:'Select one',tf:'True or false',blank:'Fill in the blank'}[q.type]);
      field.appendChild(legend);
      const stem = document.createElement('p'); stem.textContent = q.stem; field.appendChild(stem);
      if (q.type === 'blank') {
        const label = document.createElement('label'); label.textContent = 'Your answer';
        const input = document.createElement('input'); input.type = 'text'; input.className = 'blank'; input.maxLength = 2000; input.value = answers[q.id]; input.autocomplete = 'off'; input.id = q.id;
        label.htmlFor = input.id; field.append(label, input);
        input.addEventListener('input', () => {answers[q.id] = input.value; save();});
      } else {
        const options = q.type === 'tf' ? ['True', 'False'] : q.options;
        options.forEach((option, i) => {
          const value = q.type === 'tf' ? option : String.fromCharCode(65 + i);
          const label = document.createElement('label'); label.className = 'choice';
          const input = document.createElement('input'); input.type = q.type === 'multi' ? 'checkbox' : 'radio'; input.name = q.id; input.value = value; input.checked = answers[q.id].includes(value);
          const span = document.createElement('span'); span.textContent = q.type === 'tf' ? option : value + '. ' + option;
          label.append(input, span); field.appendChild(label);
          input.addEventListener('change', () => {
            answers[q.id] = [...field.querySelectorAll('input:checked')].map(n => n.value); save();
          });
        });
      }
      el('questions').appendChild(field);
    });
    save();
  }
  function setBusy(value) {
    busy = value; el('submit').disabled = value; el('quiz').disabled = value; el('reset').disabled = value;
    el('submit').textContent = value ? 'Loading separate answer key…' : 'Submit and review';
  }
  async function submit(event) {
    event.preventDefault(); if (busy || reviewing) return;
    save(); error(''); setBusy(true);
    // Freeze a copy of the responses at submission; editing while loading cannot change the score.
    const submitted = core.draft(data[quiz], answers);
    try {
      const keys = await loadAnswers();
      for (const q of data[quiz]) if (!keys[q.id] || typeof keys[q.id].key !== 'string' || typeof keys[q.id].html !== 'string') throw new Error('Incomplete key');
      let correct = 0, objective = 0; const checked = new Set();
      el('reviews').replaceChildren();
      function score() {el('score').textContent = correct + ' / ' + objective + ' automatically scored; ' + checked.size + ' / 3 blanks self-checked correct. Total: ' + (correct + checked.size) + ' / 50.';}
      data[quiz].forEach(q => {
        const result = core.grade(q, submitted[q.id], keys[q.id].key);
        if (result !== null) {objective++; if (result) correct++;}
        const article = document.createElement('article'); article.className = 'review ' + (result === null ? '' : result ? 'correct' : 'incorrect');
        const status = document.createElement('p'); status.className = 'badge'; status.textContent = result === null ? 'Self-check this blank' : result ? 'Correct' : 'Incorrect';
        const response = document.createElement('p'); response.textContent = 'Your answer: ' + (core.answered(q, submitted[q.id]) ? (Array.isArray(submitted[q.id]) ? submitted[q.id].join(', ') : submitted[q.id]) : '(unanswered)');
        const explanation = document.createElement('div'); explanation.className = 'answer'; explanation.innerHTML = keys[q.id].html;
        article.append(status, response, explanation);
        if (result === null) {
          const label = document.createElement('label'); label.className = 'choice'; const check = document.createElement('input'); check.type = 'checkbox';
          label.append(check, document.createTextNode('My submitted answer is correct'));
          check.addEventListener('change', () => {check.checked ? checked.add(q.id) : checked.delete(q.id); score();}); article.appendChild(label);
        }
        el('reviews').appendChild(article);
      });
      reviewing = true; el('quiz-form').hidden = true; el('results').hidden = false; score(); el('result-title').focus(); el('results').scrollIntoView({block:'start'});
    } catch (_) {error('The separate answer key could not load. Your draft is preserved. Check that answers.js is beside this page, then try Submit again.');}
    finally {setBusy(false);}
  }
  function reset() {
    if (busy || !window.confirm('Clear this quiz’s responses and start a new attempt?')) return;
    drafts[quiz] = core.draft(data[quiz], null);
    try {localStorage.removeItem('isye6501-mt1-quiz-v2-' + quiz);} catch (_) {}
    render(); el('quiz-form').scrollIntoView({block:'start'});
  }
  try {
    if (!core || !Array.isArray(data) || data.length !== 5 || data.some(q => q.length !== 50)) throw new Error('Missing questions');
    render();
    el('print-questions').addEventListener('click', () => window.print());
    el('quiz').addEventListener('change', () => {if (busy) return; quiz = Number(el('quiz').value); render();});
    el('quiz-form').addEventListener('submit', submit);
    // Enter in a text blank should not accidentally submit the entire quiz.
    el('quiz-form').addEventListener('keydown', e => {if (e.key === 'Enter' && e.target.matches('input[type=text]')) e.preventDefault();});
    el('reset').addEventListener('click', reset); el('retry').addEventListener('click', reset);
  } catch (_) {error('Quiz questions could not load. Reload, or use the printable questions.'); el('submit').disabled = true;}
})();
