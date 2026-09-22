(function () {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const fieldPattern = /^(Question|Option \d+|Correct option|Correct options|Correct answer|Item \d+|Bucket \d+|Correct placement):\s*(.*)$/i;
  let activityCount = 0;

  function addField(fields, text) {
    const match = text.trim().match(fieldPattern);
    if (match) fields[match[1].toLowerCase()] = match[2].trim();
    return Boolean(match);
  }

  function choices(type, fields) {
    const options = Object.keys(fields).filter(k => /^option \d+$/.test(k)).sort((a, b) => Number(a.slice(7)) - Number(b.slice(7)));
    if (!fields.question || !options.length) return null;
    const label = type === 'predict' ? 'Predict' : 'Multiple choice';
    const correct = fields['correct option'] || fields['correct answer'] || '';
    const id = `template-${type}-${activityCount += 1}`;
    const inputType = type === 'multiple-choice' ? 'checkbox' : 'radio';
    return `<section class="block activity template-activity" data-activity-type="${type}" data-correct="${esc(correct)}"><span class="activity-label">${label}</span><h3>${esc(fields.question)}</h3><div class="activity-options">${options.map((key, index) => `<label class="activity-option"><input type="${inputType}" name="${id}" value="${index}" data-option-label="${esc(fields[key])}"><span>${esc(fields[key])}</span></label>`).join('')}</div><div class="activity-answer-row"><button class="button primary template-submit" type="button">Check answer</button></div><p class="template-feedback" aria-live="polite"></p></section>`;
  }

  function numberInput(fields) {
    if (!fields.question) return null;
    const correct = fields['correct answer'] || fields['correct option'] || '';
    return `<section class="block activity template-activity" data-activity-type="number-input" data-correct="${esc(correct)}"><span class="activity-label">Number input</span><h3>${esc(fields.question)}</h3><div class="activity-answer-row"><input class="activity-number-input" inputmode="decimal" aria-label="Your answer" placeholder="Enter your answer"><button class="button primary template-submit" type="button">Check answer</button></div><p class="template-feedback" aria-live="polite"></p></section>`;
  }

  function normalise(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function answerIsCorrect(activity, answers) {
    const expected = String(activity.dataset.correct || '').split(',').map(normalise).filter(Boolean);
    const actual = answers.map(normalise).filter(Boolean);
    if (!expected.length || !actual.length) return false;
    const options = [...activity.querySelectorAll('input[data-option-label]')];
    const resolvedExpected = expected.map(value => {
      const match = value.match(/^option\s*(\d+)$/);
      return match && options[Number(match[1]) - 1] ? normalise(options[Number(match[1]) - 1].dataset.optionLabel) : value;
    });
    if (resolvedExpected.length === 1) {
      const expectedNumber = Number(resolvedExpected[0]);
      const actualNumber = Number(actual[0]);
      if (Number.isFinite(expectedNumber) && Number.isFinite(actualNumber)) return expectedNumber === actualNumber;
    }
    return resolvedExpected.length === actual.length && resolvedExpected.every(value => actual.includes(value)) && actual.every(value => resolvedExpected.includes(value));
  }

  function publishResult(activity, isCorrect, answer) {
    activity.dispatchEvent(new CustomEvent('ace:interaction-checked', {
      bubbles: true,
      detail: { isCorrect, answer },
    }));
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.template-submit');
    if (!button) return;
    const activity = button.closest('.template-activity');
    const feedback = activity.querySelector('.template-feedback');
    if (activity.dataset.activityType === 'drag-and-drop') {
      const expected = JSON.parse(activity.dataset.correctPlacement || '{}');
      const actual = Object.fromEntries([...activity.querySelectorAll('.template-drag-bucket')].map(bucket => [bucket.dataset.bucket, [...bucket.querySelectorAll('.template-drag-item')].map(item => item.dataset.item)]));
      const normalise = values => [...values].map(normaliseValue).sort().join('|');
      const correct = Object.keys(expected).length > 0 && Object.keys(expected).every(bucket => normalise(actual[bucket] || []) === normalise(expected[bucket] || [])) && Object.values(actual).flat().length === Object.values(expected).flat().length;
      feedback.textContent = correct ? 'Correct!' : 'Not quite — check every bucket and try again.';
      publishResult(activity, correct, actual);
      return;
    }
    const selected = [...activity.querySelectorAll('input[type="radio"]:checked,input[type="checkbox"]:checked')];
    const numberInput = activity.querySelector('.activity-number-input');
    const answers = selected.map(input => input.dataset.optionLabel).filter(Boolean);
    if (numberInput?.value) answers.push(numberInput.value);
    if (!answers.length) {
      feedback.textContent = 'Choose or enter an answer first.';
      return;
    }
    const correct = answerIsCorrect(activity, answers);
    feedback.textContent = correct ? 'Correct!' : 'Not quite — try again.';
    publishResult(activity, correct, answers);
  });

  function normaliseValue(value) {
    return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function returnDragItems(activity) {
    const source = activity.querySelector('.template-drag-items');
    activity.querySelectorAll('.template-drag-bucket .template-drag-item').forEach(item => source.append(item));
    activity.querySelectorAll('.template-drag-item.is-selected').forEach(item => item.classList.remove('is-selected'));
    activity.dataset.selectedItem = '';
    const feedback = activity.querySelector('.template-feedback');
    if (feedback) feedback.textContent = '';
  }

  document.addEventListener('click', event => {
    const reset = event.target.closest('.template-reset');
    if (reset) {
      returnDragItems(reset.closest('.template-drag-drop'));
      return;
    }
    const item = event.target.closest('.template-drag-item');
    if (item) {
      const activity = item.closest('.template-drag-drop');
      activity.querySelectorAll('.template-drag-item.is-selected').forEach(other => other.classList.remove('is-selected'));
      item.classList.add('is-selected');
      activity.dataset.selectedItem = item.dataset.item;
      return;
    }
    const bucket = event.target.closest('.template-drag-bucket');
    if (bucket) {
      const activity = bucket.closest('.template-drag-drop');
      const selected = activity.querySelector('.template-drag-item.is-selected');
      if (selected) {
        bucket.querySelector('.template-drag-dropzone').append(selected);
        selected.classList.remove('is-selected');
        activity.dataset.selectedItem = '';
      }
    }
  });

  document.addEventListener('dragstart', event => {
    const item = event.target.closest('.template-drag-item');
    if (!item) return;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', item.dataset.item);
    item.closest('.template-drag-drop').dataset.draggedItem = item.dataset.item;
  });

  document.addEventListener('dragover', event => {
    if (event.target.closest('.template-drag-bucket,.template-drag-items')) event.preventDefault();
  });

  document.addEventListener('drop', event => {
    const target = event.target.closest('.template-drag-bucket,.template-drag-items');
    if (!target) return;
    event.preventDefault();
    const activity = target.closest('.template-drag-drop');
    const value = event.dataTransfer.getData('text/plain') || activity.dataset.draggedItem;
    const item = [...activity.querySelectorAll('.template-drag-item')].find(candidate => candidate.dataset.item === value);
    if (!item) return;
    (target.classList.contains('template-drag-bucket') ? target.querySelector('.template-drag-dropzone') : target).append(item);
    activity.dataset.draggedItem = '';
  });

  function dragDrop(fields) {
    if (!fields.question) return null;
    const items = Object.keys(fields).filter(k => /^item \d+$/.test(k)).sort();
    const buckets = Object.keys(fields).filter(k => /^bucket \d+$/.test(k)).sort();
    return `<section class="block activity template-activity" data-activity-type="drag-and-drop"><span class="activity-label">Drag and drop</span><h3>${esc(fields.question)}</h3><div class="drag-items">${items.map(key => `<span class="activity-option">${esc(fields[key])}</span>`).join('')}</div><div class="drag-buckets">${buckets.map(key => `<div class="drag-bucket">${esc(fields[key])}</div>`).join('')}</div></section>`;
  }

  function upgrade() {
    const blocks = [...document.querySelectorAll('#lesson-content p.block')];
    for (let index = 0; index < blocks.length; index += 1) {
      const markerBlock = blocks[index];
      if (markerBlock.dataset.upgraded) continue;
      const marker = markerBlock.textContent.match(/ACE_INTERACTION:\s*(predict|multiple-choice|number-input|drag-and-drop)\b/i);
      if (!marker) continue;

      const type = marker[1].toLowerCase();
      const fields = {};
      const consumed = [markerBlock];
      addField(fields, markerBlock.textContent.replace(marker[0], '').trim());
      for (let next = index + 1; next < blocks.length; next += 1) {
        const candidate = blocks[next];
        if (!candidate.isConnected || candidate.dataset.upgraded || !addField(fields, candidate.textContent)) break;
        consumed.push(candidate);
      }

      const html = type === 'predict' || type === 'multiple-choice' ? choices(type, fields) : type === 'number-input' ? numberInput(fields) : dragDrop(fields);
      if (!html) continue;
      markerBlock.dataset.upgraded = 'true';
      markerBlock.outerHTML = html;
      consumed.slice(1).forEach(block => block.remove());
    }
  }

  new MutationObserver(upgrade).observe(document.body, { childList: true, subtree: true });
  upgrade();
})();
