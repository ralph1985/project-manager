import { countStatuses } from '../domain/task.js';

export function getDashboardStats(tasks, hourlyRate) {
  const totalHours = tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
  const totalCost = totalHours * hourlyRate;
  const statusCounts = countStatuses(tasks);
  return { totalHours, totalCost, statusCounts };
}
