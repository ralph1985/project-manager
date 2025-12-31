import { HOURLY_RATE } from './config.js';
import { applyFilters, filterTasksByProject, sortTasks } from './domain/task.js';
import { loadTasks } from './usecases/loadTasks.js';
import { loadProjects } from './usecases/loadProjects.js';
import './ui/components/index.js';
import { getDashboardStats } from './usecases/getDashboardStats.js';
import { getFilterOptions } from './usecases/getFilterOptions.js';
import { loadJson, saveJson } from './infrastructure/storage.js';
import { getProjectElements } from './ui/elementsProject.js';
import {
  renderProjectFilters,
  renderProjectStats,
  renderProjectTodos,
  renderProjectTable,
  updateSortIndicators,
} from './ui/render.js';
import { applySavedProjectFilters, readProjectFilters } from './ui/projectFilters.js';
import { setupNotes } from './ui/notes.js';
import { initTickTick } from './ui/ticktick.js';
import { loadProjectTodos } from './usecases/loadProjectTodos.js';

const elements = getProjectElements();
let currentSort = { key: 'id', dir: 'desc' };

function getProjectFromUrl(projects) {
  const url = new URL(window.location.href);
  const projectId = url.searchParams.get('project');
  if (projectId && projects.some((project) => project.id === projectId)) {
    return projectId;
  }
  return projects[0]?.id || '';
}

function setProjectSelector(projects, currentProjectId) {
  elements.projectSelect.innerHTML = '';
  projects.forEach((project) => {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.name;
    elements.projectSelect.appendChild(option);
  });
  elements.projectSelect.value = currentProjectId;
  const currentProject = projects.find((project) => project.id === currentProjectId);
  elements.projectTitle.textContent = currentProject?.name || 'Proyecto';

  elements.projectSelect.addEventListener('change', () => {
    const selected = elements.projectSelect.value;
    const url = new URL(window.location.href);
    url.searchParams.set('project', selected);
    window.location.assign(url.toString());
  });
}

function setupSorting(applyFilterCallback) {
  const headers = document.querySelectorAll('#tasksTable thead th.sortable');
  headers.forEach((th) => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (currentSort.key === key) {
        currentSort = { key, dir: currentSort.dir === 'asc' ? 'desc' : 'asc' };
      } else {
        currentSort = { key, dir: 'asc' };
      }
      updateSortIndicators(currentSort);
      applyFilterCallback();
    });
  });
  updateSortIndicators(currentSort);
}

function setupFilters(projectTasks, projectId) {
  const storageKey = `pm-project-filters:${encodeURIComponent(projectId)}`;
  const apply = () => {
    const filters = readProjectFilters(elements);
    const filtered = applyFilters(projectTasks, {
      ...filters,
      project: [projectId],
    });
    renderProjectTable(elements, sortTasks(filtered, currentSort));
    saveJson(storageKey, {
      search: (filters.search || '').toLowerCase().trim(),
      status: filters.status,
      owner: filters.owner,
      phase: filters.phase,
      dateStart: filters.dateStart || '',
      dateEnd: filters.dateEnd || '',
    });
  };

  [
    elements.search,
    elements.statusFilter,
    elements.ownerFilter,
    elements.phaseFilter,
    elements.dateStartFilter,
    elements.dateEndFilter,
  ].forEach((el) => el.addEventListener('input', apply));

  [
    elements.statusFilter,
    elements.ownerFilter,
    elements.phaseFilter,
    elements.dateStartFilter,
    elements.dateEndFilter,
  ].forEach((el) => el.addEventListener('change', apply));

  elements.dateClearBtn.addEventListener('click', () => {
    elements.dateStartFilter.value = '';
    elements.dateEndFilter.value = '';
    apply();
  });

  const savedFilters = loadJson(storageKey) || {};
  applySavedProjectFilters(elements, savedFilters);

  apply();
  return apply;
}

async function init() {
  const [tasks, projects] = await Promise.all([loadTasks(), loadProjects()]);
  const currentProjectId = getProjectFromUrl(projects);
  if (!currentProjectId) return;

  setProjectSelector(projects, currentProjectId);

  const projectTasks = filterTasksByProject(tasks, currentProjectId);
  const projectStats = getDashboardStats(projectTasks, HOURLY_RATE);
  const filterOptions = getFilterOptions(projectTasks);

  renderProjectStats(
    elements,
    {
      totalTasks: projectTasks.length,
      completedTasks: projectStats.statusCounts['Completada'] || 0,
      inProgressTasks: projectStats.statusCounts['En curso'] || 0,
      blockedTasks: projectStats.statusCounts['Bloqueada'] || 0,
      totalHours: projectStats.totalHours,
    },
    HOURLY_RATE
  );
  renderProjectFilters(elements, filterOptions);

  const applyFiltersCallback = setupFilters(projectTasks, currentProjectId);
  setupSorting(applyFiltersCallback);
  setupNotes(elements);

  const project = projects.find((item) => item.id === currentProjectId);
  const ticktickStorageKey = `pm-ticktick-project-${encodeURIComponent(currentProjectId)}`;
  await initTickTick(elements, {
    storageKey: ticktickStorageKey,
    preferredProjectId: project?.ticktickProjectId || null,
  });

  const todos = await loadProjectTodos(currentProjectId);
  renderProjectTodos(elements, todos);
}

init().catch((err) => {
  console.error('Project dashboard init failed', err);
});
