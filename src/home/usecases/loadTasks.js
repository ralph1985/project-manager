import { fetchTasks } from '../infrastructure/tasksRepository.js';
import { normalizeTask } from '../domain/task.js';

export async function loadTasks() {
  const tasks = await fetchTasks();
  return tasks.map(normalizeTask);
}
