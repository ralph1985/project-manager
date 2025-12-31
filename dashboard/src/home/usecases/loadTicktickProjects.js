import { fetchTickTickProjects } from '../infrastructure/ticktickRepository.js';

export async function loadTickTickProjects(options = {}) {
  return fetchTickTickProjects(options);
}
