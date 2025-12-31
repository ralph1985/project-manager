import { FILTER_KEY, HOURLY_RATE } from './config.js';
import { applyFilters, sortTasks } from './domain/task.js';
import { loadTasks } from './usecases/loadTasks.js';
import { getDashboardStats } from './usecases/getDashboardStats.js';
import { getFilterOptions } from './usecases/getFilterOptions.js';
import { getProjectPhases } from './usecases/getProjectPhases.js';
import { loadJson, saveJson } from './infrastructure/storage.js';
import { getElements } from './ui/elements.js';
import {
  renderFilters,
  renderProjectPhases,
  renderStats,
  renderTable,
  updateSortIndicators,
} from './ui/render.js';
import { applySavedFilters, readFilters } from './ui/filters.js';
import { setupNotes } from './ui/notes.js';
import { initTickTick } from './ui/ticktick.js';

const elements = getElements();
let currentSort = { key: 'id', dir: 'desc' };

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

function setupFilters(allTasks) {
  const apply = () => {
    const filters = readFilters(elements);
    const filtered = applyFilters(allTasks, filters);
    renderTable(elements, sortTasks(filtered, currentSort));
    saveJson(FILTER_KEY, {
      search: (filters.search || '').toLowerCase().trim(),
      status: filters.status,
      owner: filters.owner,
      phase: filters.phase,
      project: filters.project,
      dateStart: filters.dateStart || '',
      dateEnd: filters.dateEnd || '',
    });
  };

  [
    elements.search,
    elements.statusFilter,
    elements.ownerFilter,
    elements.phaseFilter,
    elements.projectFilter,
    elements.dateStartFilter,
    elements.dateEndFilter,
  ].forEach((el) => el.addEventListener('input', apply));

  [
    elements.statusFilter,
    elements.ownerFilter,
    elements.phaseFilter,
    elements.projectFilter,
    elements.dateStartFilter,
    elements.dateEndFilter,
  ].forEach((el) => el.addEventListener('change', apply));

  elements.dateClearBtn.addEventListener('click', () => {
    elements.dateStartFilter.value = '';
    elements.dateEndFilter.value = '';
    apply();
  });

  apply();
  return apply;
}

async function init() {
  const tasks = await loadTasks();
  const stats = getDashboardStats(tasks, HOURLY_RATE);
  const projectPhases = getProjectPhases(tasks);
  const filterOptions = getFilterOptions(tasks);

  renderStats(elements, {
    totalTasks: tasks.length,
    completedTasks: stats.statusCounts['Completada'] || 0,
    inProgressTasks: stats.statusCounts['En curso'] || 0,
    blockedTasks: stats.statusCounts['Bloqueada'] || 0,
    totalHours: stats.totalHours,
    totalCost: stats.totalCost,
  });
  renderProjectPhases(elements, projectPhases, HOURLY_RATE);
  renderFilters(elements, filterOptions);

  const savedFilters = loadJson(FILTER_KEY) || {};
  applySavedFilters(elements, savedFilters);

  const applyFiltersCallback = setupFilters(tasks);
  setupSorting(applyFiltersCallback);
  setupNotes(elements);
  await initTickTick(elements);
}

init().catch((err) => {
  console.error('Dashboard init failed', err);
});
