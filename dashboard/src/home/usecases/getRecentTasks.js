import { getRecentTasks } from '../domain/task.js';

export function listRecentTasks(tasks, limit) {
  return getRecentTasks(tasks, limit);
}
