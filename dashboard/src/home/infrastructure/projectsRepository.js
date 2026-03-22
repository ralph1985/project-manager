import { withBase } from '../config.js';

export async function fetchProjects() {
  const res = await fetch(withBase('/dashboard/data/projects.json'));
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}
