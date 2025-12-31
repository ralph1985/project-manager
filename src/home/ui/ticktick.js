import { renderTickTickMessage, renderTickTickProjects, renderTickTickStatus, renderTickTickTasks } from './render.js';
import { TICKTICK_KEY } from '../config.js';
import { loadValue, saveValue } from '../infrastructure/storage.js';
import { loadTickTickProjects } from '../usecases/loadTicktickProjects.js';
import { loadTickTickTasks } from '../usecases/loadTicktickTasks.js';

export async function initTickTick(elements, options = {}) {
  const storageKey = options.storageKey || TICKTICK_KEY;
  const preferredProjectId = options.preferredProjectId || null;
  renderTickTickStatus(elements, 'Cargando', 'status-Info');
  renderTickTickMessage(elements, '');
  elements.ticktickProjectSelect.innerHTML = '';
  elements.ticktickProjectSelect.disabled = true;

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

    renderTickTickProjects(elements, projects);
    const savedProjectId = loadValue(storageKey);
    const defaultProjectId =
      projects.find((project) => project.id === savedProjectId)?.id ||
      projects.find((project) => project.id === preferredProjectId)?.id ||
      projects[0].id;

    elements.ticktickProjectSelect.value = defaultProjectId;
    elements.ticktickProjectSelect.disabled = false;
    await handleTickTickSelection(elements, defaultProjectId);

    if (elements.ticktickRefresh) {
      elements.ticktickRefresh.addEventListener('click', () => {
        const projectId = elements.ticktickProjectSelect.value;
        handleTickTickSelection(elements, projectId, { refresh: true });
      });
    }

    elements.ticktickProjectSelect.addEventListener('change', () => {
      const projectId = elements.ticktickProjectSelect.value;
      saveValue(storageKey, projectId);
      handleTickTickSelection(elements, projectId);
    });
  } catch {
    renderTickTickStatus(elements, 'Error', 'status-Bloqueada');
    renderTickTickMessage(elements, 'No se pudieron cargar los proyectos de TickTick.');
    elements.ticktickProjectSelect.disabled = true;
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
    renderTickTickStatus(elements, 'Activo', 'status-En');
    renderTickTickTasks(elements, data.tasks || []);
  } catch {
    renderTickTickStatus(elements, 'Error', 'status-Bloqueada');
    renderTickTickMessage(elements, 'No se pudieron cargar las tareas de TickTick.');
  }
}
