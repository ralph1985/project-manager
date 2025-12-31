import { fetchProjects } from '../infrastructure/projectsRepository.js';

export async function loadProjects() {
  return fetchProjects();
}
