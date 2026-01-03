import { parseDate } from '../domain/date.js';
import { fmtNumber } from './format.js';

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const dateDelta = parseDate(b.date) - parseDate(a.date);
    if (dateDelta !== 0) return dateDelta;
    return (b.id || 0) - (a.id || 0);
  });
}

export function setupHoursModal(elements, taskById) {
  const hide = () => elements.hoursModal.classList.add('hidden');
  const show = () => elements.hoursModal.classList.remove('hidden');

  const render = (task) => {
    const entries = sortEntries(task.entries || []);
    elements.hoursTitle.textContent = `Horas · ${task.title || 'Tarea'}`;
    elements.hoursBody.innerHTML = '';

    const summary = document.createElement('div');
    summary.className = 'hours-summary';
    summary.textContent = `${fmtNumber(task.hours)} h · ${entries.length} registro${entries.length === 1 ? '' : 's'}`;
    elements.hoursBody.appendChild(summary);

    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'hours-empty';
      empty.textContent = 'No hay registros de horas para esta tarea.';
      elements.hoursBody.appendChild(empty);
      return;
    }

    const list = document.createElement('ul');
    list.className = 'hours-list';
    entries.forEach((entry) => {
      const item = document.createElement('li');
      item.className = 'hours-item';

      const date = document.createElement('div');
      date.className = 'hours-date';
      date.textContent = entry.date || 'Sin fecha';

      const meta = document.createElement('div');
      meta.className = 'hours-meta';
      meta.textContent = `${fmtNumber(entry.hours || 0)} h`;

      const note = document.createElement('div');
      note.className = 'hours-note';
      note.textContent = entry.note || 'Sin nota';

      item.appendChild(date);
      item.appendChild(meta);
      item.appendChild(note);
      list.appendChild(item);
    });
    elements.hoursBody.appendChild(list);
  };

  document.addEventListener('click', (event) => {
    const btn = event.target.closest('.hours-link');
    if (btn) {
      event.preventDefault();
      const taskId = Number(btn.dataset.taskId);
      const task = taskById.get(taskId);
      if (!task) return;
      render(task);
      show();
      return;
    }
    if (event.target.classList.contains('modal-backdrop')) {
      hide();
    }
  });

  elements.hoursClose.addEventListener('click', hide);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
}
