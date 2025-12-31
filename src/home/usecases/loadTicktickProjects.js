import { fetchTickTickProjects } from '../infrastructure/ticktickRepository.js';

export async function loadTickTickProjects() {
  return fetchTickTickProjects();
}
