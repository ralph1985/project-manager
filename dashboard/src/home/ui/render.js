import { fmtCurrency, fmtNumber, formatTickTickDate } from './format.js';
import { phaseClass, projectClass, statusClass } from './classes.js';
import { isTodoDone } from '../domain/todo.js';

const escAttr = (str = '') =>
  str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function renderStats(elements, stats) {
  const cards = [
    { label: 'Tareas totales', value: stats.totalTasks },
    { label: 'Tareas completadas', value: stats.completedTasks },
    { label: 'Tareas en curso', value: stats.inProgressTasks },
    { label: 'Tareas Bloqueadas', value: stats.blockedTasks },
    { label: 'Horas registradas', value: fmtNumber(stats.totalHours) },
    { label: 'Coste bruto (50€/h)', value: fmtCurrency(stats.totalCost) },
  ];
  elements.stats.innerHTML = cards
    .map(
      (card) => `
        <pm-card>
          <div class="stat-label">${card.label}</div>
          <div class="stat-value">${card.value}</div>
        </pm-card>
      `
    )
    .join('');
}

export function renderProjectPhases(elements, projectPhases, hourlyRate) {
  const projects = Object.entries(projectPhases.projects).sort((a, b) => b[1] - a[1]);
  const maxProjectHours = projects[0]?.[1] || 1;

  elements.projectPhases.innerHTML = projects
    .map(([project, hours]) => {
      const phases = Object.entries(projectPhases.phases)
        .filter(([key]) => key.startsWith(`${project}::`))
        .map(([key, phaseHours]) => ({ phase: key.split('::')[1], hours: phaseHours }))
        .sort((a, b) => b.hours - a.hours);
      const maxPhase = phases[0]?.hours || 1;
      const totalCost = hours * hourlyRate;

      return `
        <div class="project-phase-item">
          <div class="project-phase-header">
            <span class="project-name">${project}</span>
            <span class="project-hours">${fmtNumber(hours)} h <small style="color:var(--muted);font-weight:500;">· ${fmtCurrency(totalCost)}</small></span>
          </div>
          <div class="bar-row overall">
            <div class="phase-label">Total</div>
            <div class="bar"><span style="width:${(hours / maxProjectHours) * 100}%"></span></div>
            <div class="phase-hours">${fmtNumber(hours)} h <small style="color:var(--muted);font-weight:500;">· ${fmtCurrency(totalCost)}</small></div>
          </div>
          ${phases
            .map(
              (phase) => `
                <div class="bar-row">
                  <div class="phase-label">${phase.phase}</div>
                  <div class="bar"><span style="width:${(phase.hours / maxPhase) * 100}%"></span></div>
                  <div class="phase-hours">${fmtNumber(phase.hours)} h</div>
                </div>
              `
            )
            .join('')}
        </div>
      `;
    })
    .join('');
}

export function renderFilters(elements, options) {
  const setOptions = (el, values) => {
    el.innerHTML = [`<option value="">Todos</option>`, ...values.map((v) => `<option value="${v}">${v}</option>`)].join('');
  };
  setOptions(elements.statusFilter, options.statuses);
  setOptions(elements.ownerFilter, options.owners);
  setOptions(elements.phaseFilter, options.phases);
  setOptions(elements.projectFilter, options.projects);
}

export function renderProjectFilters(elements, options) {
  const setOptions = (el, values) => {
    el.innerHTML = [`<option value="">Todos</option>`, ...values.map((v) => `<option value="${v}">${v}</option>`)].join('');
  };
  setOptions(elements.statusFilter, options.statuses);
  setOptions(elements.ownerFilter, options.owners);
  setOptions(elements.phaseFilter, options.phases);
}

export function renderTable(elements, tasks) {
  elements.tasksTableBody.innerHTML = tasks
    .map(
      (task) => `
        <tr>
          <td>${task.id}</td>
          <td>${task.title}</td>
          <td><pm-badge class="${projectClass(task.project)} pill-status">${task.project || '—'}</pm-badge></td>
          <td><pm-badge class="${phaseClass(task.phase)} pill-status">${task.phase || '—'}</pm-badge></td>
          <td>${task.owner || '—'}</td>
          <td><pm-badge class="${statusClass(task.status)} pill-status">${task.status}</pm-badge></td>
          <td>${task.startDate || '—'}</td>
          <td>${task.endDate || '—'}</td>
          <td>${renderNoteCell(task.notes)}</td>
          <td class="num">${fmtNumber(task.hours)}</td>
        </tr>
      `
    )
    .join('');
}

export function renderProjectTable(elements, tasks) {
  elements.tasksTableBody.innerHTML = tasks
    .map(
      (task) => `
        <tr>
          <td>${task.id}</td>
          <td>${task.title}</td>
          <td><pm-badge class="${phaseClass(task.phase)} pill-status">${task.phase || '—'}</pm-badge></td>
          <td>${task.owner || '—'}</td>
          <td><pm-badge class="${statusClass(task.status)} pill-status">${task.status}</pm-badge></td>
          <td>${task.startDate || '—'}</td>
          <td>${task.endDate || '—'}</td>
          <td>${renderNoteCell(task.notes)}</td>
          <td class="num">${fmtNumber(task.hours)}</td>
        </tr>
      `
    )
    .join('');
}

export function updateSortIndicators(currentSort) {
  const headers = document.querySelectorAll('#tasksTable thead th.sortable');
  headers.forEach((th) => {
    const key = th.dataset.sort;
    const indicator = th.querySelector('.sort-indicator');
    th.classList.toggle('active', currentSort.key === key);
    if (indicator) {
      indicator.textContent =
        currentSort.key === key ? (currentSort.dir === 'asc' ? '▲' : '▼') : '';
    }
  });
}

export function renderTickTickStatus(elements, label, className) {
  elements.ticktickStatus.textContent = label;
  elements.ticktickStatus.className = `badge ${className}`;
}

export function renderTickTickMessage(elements, message) {
  elements.ticktickMessage.textContent = message || '';
  elements.ticktickMessage.style.display = message ? 'block' : 'none';
}

export function renderTickTickTasks(elements, tasks) {
  elements.ticktickTasks.innerHTML = '';
  if (!tasks.length) {
    const empty = document.createElement('li');
    empty.className = 'ticktick-empty';
    empty.textContent = 'No hay tareas abiertas para este proyecto.';
    elements.ticktickTasks.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = `ticktick-item${task.ticktickStatus === 'overdue' ? ' ticktick-item--overdue' : ''}`;
    const title = document.createElement('span');
    title.className = 'ticktick-title';
    title.textContent = task.title || 'Sin título';
    const meta = document.createElement('span');
    meta.className = 'ticktick-meta';
    meta.textContent = formatTickTickDate(task.dueDate);
    item.appendChild(title);
    item.appendChild(meta);
    elements.ticktickTasks.appendChild(item);
  });
}

export function renderProjectSummaries(elements, summaries) {
  if (!summaries.length) {
    elements.projectSummary.innerHTML = '<p class="ticktick-message">Sin proyectos todavía.</p>';
    return;
  }
  elements.projectSummary.innerHTML = summaries
    .map((summary) => {
      const href = `/project.html?project=${encodeURIComponent(summary.projectId)}`;
      return `
        <pm-project-summary href="${href}">
          <div>
            <div class="project-summary-title">${summary.project}</div>
            <div class="project-summary-meta">${summary.count} tareas · ${summary.inProgress} en curso</div>
          </div>
          <div class="project-summary-hours">${fmtNumber(summary.hours)} h</div>
        </pm-project-summary>
      `;
    })
    .join('');
}

export function renderRecentTasks(elements, tasks) {
  if (!tasks.length) {
    elements.recentTasks.innerHTML = '<li class="ticktick-empty">Sin actividad reciente.</li>';
    return;
  }
  elements.recentTasks.innerHTML = tasks
    .map(
      (task) => `
        <pm-recent-task>
          <div>
            <div class="recent-task-title">${task.title}</div>
            <div class="recent-task-meta">${task.project || '—'} · ${task.phase || '—'}</div>
          </div>
          <pm-badge class="${statusClass(task.status)} pill-status">${task.status}</pm-badge>
        </pm-recent-task>
      `
    )
    .join('');
}

export function renderProjectStats(elements, stats, hourlyRate) {
  const cards = [
    { label: 'Tareas', value: stats.totalTasks },
    { label: 'En curso', value: stats.inProgressTasks },
    { label: 'Completadas', value: stats.completedTasks },
    { label: 'Bloqueadas', value: stats.blockedTasks },
    { label: 'Horas', value: fmtNumber(stats.totalHours) },
    { label: 'Coste', value: fmtCurrency(stats.totalHours * hourlyRate) },
  ];
  elements.projectStats.innerHTML = cards
    .map(
      (card) => `
        <pm-card>
          <div class="stat-label">${card.label}</div>
          <div class="stat-value">${card.value}</div>
        </pm-card>
      `
    )
    .join('');
}

export function renderProjectTodos(elements, todos) {
  elements.projectTodos.innerHTML = '';
  if (!todos.length) {
    const empty = document.createElement('li');
    empty.className = 'ticktick-empty';
    empty.textContent = 'No hay to-dos definidos para este proyecto.';
    elements.projectTodos.appendChild(empty);
    return;
  }

  todos.forEach((todo) => {
    const item = document.createElement('li');
    const isDone = isTodoDone(todo);
    item.className = `ticktick-item${isDone ? ' ticktick-item--done' : ''}`;
    const title = document.createElement('span');
    title.className = 'ticktick-title';
    title.textContent = todo.title || 'Sin título';
    const meta = document.createElement('span');
    meta.className = 'ticktick-meta';
    meta.textContent = todo.dueDate ? formatTickTickDate(todo.dueDate) : 'Sin fecha';
    item.appendChild(title);
    item.appendChild(meta);
    elements.projectTodos.appendChild(item);
  });
}

export function renderProjectMilestones(elements, milestones) {
  elements.projectMilestones.innerHTML = '';
  if (!milestones.length) {
    const empty = document.createElement('li');
    empty.className = 'ticktick-empty';
    empty.textContent = 'Sin hitos todavía.';
    elements.projectMilestones.appendChild(empty);
    return;
  }

  milestones.forEach((milestone, index) => {
    const item = document.createElement('li');
    item.className = 'ticktick-item';

    const title = document.createElement('span');
    title.className = 'ticktick-title';
    title.textContent = `${index + 1}. ${milestone.title}`;

    const meta = document.createElement('span');
    meta.className = 'ticktick-meta';
    meta.textContent = milestone.status || 'Planned';

    const detailsBtn = document.createElement('button');
    detailsBtn.type = 'button';
    detailsBtn.className = 'milestone-link';
    detailsBtn.textContent = 'Detalle';
    detailsBtn.dataset.title = milestone.title || '';
    detailsBtn.dataset.details = milestone.details || '';

    item.appendChild(title);
    item.appendChild(meta);
    item.appendChild(detailsBtn);
    elements.projectMilestones.appendChild(item);
  });
}

function renderNoteCell(note) {
  if (!note) return '—';
  const shortText = note.length > 40 ? `${note.slice(0, 40)}…` : note;
  return `<button class="note-link" data-note="${escAttr(note)}" title="Ver nota completa">${shortText}</button>`;
}
