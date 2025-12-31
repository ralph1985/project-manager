export async function fetchProjects() {
  const res = await fetch('/data/projects.json');
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}
