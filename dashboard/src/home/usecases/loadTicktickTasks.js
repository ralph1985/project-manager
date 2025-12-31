import { fetchTickTickTasks } from '../infrastructure/ticktickRepository.js';

export async function loadTickTickTasks(projectId, options = {}) {
  return fetchTickTickTasks(projectId, options);
}
