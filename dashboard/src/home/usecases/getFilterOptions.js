import { buildFilterOptions } from '../domain/task.js';

export function getFilterOptions(tasks) {
  return buildFilterOptions(tasks);
}
