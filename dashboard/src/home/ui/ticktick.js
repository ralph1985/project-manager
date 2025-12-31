import { renderTickTickMessage, renderTickTickStatus, renderTickTickTasks } from './render.js';
import { parseTickTickDate } from './format.js';
import { TICKTICK_NOT_SECTIONED_COLUMN_ID } from '../config.js';
import { DEFAULT_TICKTICK_PROJECT_ID, TICKTICK_KEY } from '../config.js';
import { loadValue, saveValue } from '../infrastructure/storage.js';
import { loadTickTickProjects } from '../usecases/loadTicktickProjects.js';
import { loadTickTickTasks } from '../usecases/loadTicktickTasks.js';

export async function initTickTick(elements, options = {}) {
  const storageKey = options.storageKey || TICKTICK_KEY;
  const preferredProjectId = options.preferredProjectId || null;
  const columnId = options.columnId || null;
  renderTickTickStatus(elements, 'Cargando', 'status-Info');
  renderTickTickMessage(elements, '');
  if (elements.ticktickColumnId) {
    elements.ticktickColumnId.textContent = columnId || '-';
  }
  if (elements.ticktickProjectSelect) {
    elements.ticktickProjectSelect.innerHTML = '';
    elements.ticktickProjectSelect.disabled = true;
  }

  try {
    const data = await loadTickTickProjects();
    if (data.status === 'missing-token') {
      renderTickTickStatus(elements, 'Sin token', 'status-Warn');
      renderTickTickMessage(
        elements,
        'Configura TICKTICK_ACCESS_TOKEN en el entorno para cargar proyectos.'
      );
      renderTickTickTasks(elements, []);
      return;
    }
    if (data.status === 'error') {
      renderTickTickStatus(elements, 'Error', 'status-Bloqueada');
      renderTickTickMessage(elements, 'No se pudieron cargar los proyectos de TickTick.');
      renderTickTickTasks(elements, []);
      return;
    }

    const projects = data.projects || [];
    if (!projects.length) {
      renderTickTickStatus(elements, 'Sin proyectos', 'status-No');
      renderTickTickMessage(elements, 'No hay proyectos disponibles en TickTick.');
      renderTickTickTasks(elements, []);
      return;
    }

    const savedProjectId = loadValue(storageKey);
    const defaultProjectId =
      projects.find((project) => project.id === savedProjectId)?.id ||
      projects.find((project) => project.id === preferredProjectId)?.id ||
      DEFAULT_TICKTICK_PROJECT_ID ||
      projects[0].id;

    await handleTickTickSelection(elements, defaultProjectId, { columnId });

    if (elements.ticktickRefresh) {
      elements.ticktickRefresh.addEventListener('click', () => {
        handleTickTickSelection(elements, defaultProjectId, { refresh: true, columnId });
      });
    }
  } catch {
    renderTickTickStatus(elements, 'Error', 'status-Bloqueada');
    renderTickTickMessage(elements, 'No se pudieron cargar los proyectos de TickTick.');
    if (elements.ticktickProjectSelect) {
      elements.ticktickProjectSelect.disabled = true;
    }
    renderTickTickTasks(elements, []);
  }
}

async function handleTickTickSelection(elements, projectId, options = {}) {
  if (!projectId) return;
  renderTickTickStatus(elements, 'Cargando', 'status-Info');
  renderTickTickMessage(elements, '');
  elements.ticktickTasks.innerHTML = '';

  try {
    const data = await loadTickTickTasks(projectId, options);
    if (data.status === 'missing-token') {
      renderTickTickStatus(elements, 'Sin token', 'status-Warn');
      renderTickTickMessage(
        elements,
        'Configura TICKTICK_ACCESS_TOKEN en el entorno para cargar tareas.'
      );
      renderTickTickTasks(elements, []);
      return;
    }
    if (data.status === 'error') {
      renderTickTickStatus(elements, 'Error', 'status-Bloqueada');
      renderTickTickMessage(elements, 'No se pudieron cargar las tareas de TickTick.');
      renderTickTickTasks(elements, []);
      return;
    }
    const tasks = normalizeTickTickTasks(data.tasks || [], options.columnId);
    renderTickTickStatus(elements, 'Activo', 'status-En');
    renderTickTickTasks(elements, tasks);
  } catch {
    renderTickTickStatus(elements, 'Error', 'status-Bloqueada');
    renderTickTickMessage(elements, 'No se pudieron cargar las tareas de TickTick.');
  }
}

function normalizeTickTickTasks(tasks, columnId) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const overdue = [];
  const today = [];
  const noDate = [];

  const shouldIncludeByColumn = (taskColumnId, selectedColumnId) => {
    if (!selectedColumnId) return true;
    if (taskColumnId === selectedColumnId) return true;
    if (
      selectedColumnId === TICKTICK_NOT_SECTIONED_COLUMN_ID &&
      (taskColumnId === null || taskColumnId === undefined)
    ) {
      return true;
    }
    return false;
  };

  tasks.forEach((task) => {
    if (!shouldIncludeByColumn(task.columnId, columnId)) return;
    const due = parseTickTickDate(task.dueDate);
    if (!due || Number.isNaN(due.valueOf())) {
      noDate.push({ ...task, ticktickStatus: 'nodate' });
      return;
    }
    if (due < startOfToday) {
      overdue.push({ ...task, ticktickStatus: 'overdue' });
      return;
    }
    if (due >= startOfToday && due <= endOfToday) {
      today.push({ ...task, ticktickStatus: 'today' });
    }
  });

  overdue.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  today.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  return [...overdue, ...today, ...noDate];
}
