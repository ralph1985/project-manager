import { HOURLY_RATE } from './config.js';
import { loadTasks } from './usecases/loadTasks.js';
import { getDashboardStats } from './usecases/getDashboardStats.js';
import { getProjectSummaries } from './usecases/getProjectSummaries.js';
import { listRecentTasks } from './usecases/getRecentTasks.js';
import { getElements } from './ui/elements.js';
import { renderProjectSummaries, renderRecentTasks, renderStats } from './ui/render.js';

const elements = getElements();

async function init() {
  const tasks = await loadTasks();
  const stats = getDashboardStats(tasks, HOURLY_RATE);
  const projectSummaries = getProjectSummaries(tasks);
  const recentTasks = listRecentTasks(tasks, 6);

  renderStats(elements, {
    totalTasks: tasks.length,
    completedTasks: stats.statusCounts['Completada'] || 0,
    inProgressTasks: stats.statusCounts['En curso'] || 0,
    blockedTasks: stats.statusCounts['Bloqueada'] || 0,
    totalHours: stats.totalHours,
    totalCost: stats.totalCost,
  });
  renderProjectSummaries(elements, projectSummaries);
  renderRecentTasks(elements, recentTasks);
}

init().catch((err) => {
  console.error('Dashboard init failed', err);
});
