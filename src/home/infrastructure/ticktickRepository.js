export async function fetchTickTickProjects() {
  const res = await fetch('/api/ticktick/projects');
  if (!res.ok) throw new Error('Failed to load TickTick projects');
  return res.json();
}

export async function fetchTickTickTasks(projectId) {
  const res = await fetch(`/api/ticktick/projects/${projectId}/tasks`);
  if (!res.ok) throw new Error('Failed to load TickTick tasks');
  return res.json();
}
