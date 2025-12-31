import { fetchTickTickTasks } from '../infrastructure/ticktickRepository.js';

export async function loadTickTickTasks(projectId) {
  return fetchTickTickTasks(projectId);
}
