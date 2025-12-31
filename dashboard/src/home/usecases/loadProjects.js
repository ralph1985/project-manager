import { fetchProjects } from '../infrastructure/projectsRepository.js';

export async function loadProjects() {
  const projects = await fetchProjects();
  return projects.slice().sort((a, b) => {
    const aOrder = Number.isFinite(a.order) ? a.order : Number.POSITIVE_INFINITY;
    const bOrder = Number.isFinite(b.order) ? b.order : Number.POSITIVE_INFINITY;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.name || '').localeCompare(b.name || '');
  });
}
